const Payment = require('../models/payment');
const Order = require('../models/order');
const User = require('../models/user');
const Product = require('../models/product');
const Payout = require('../models/payout');
const emailService = require('../services/emailService'); // Back to direct emailService
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { core } = require('../config/midtrans');
const crypto = require('crypto');

// @desc    Handle Midtrans notification webhook
// @route   POST /api/payments/midtrans/notification
// @access  Public (Webhook from Midtrans)
exports.handleMidtransNotification = asyncHandler(async (req, res, next) => {
  const notification = req.body;
  
  console.log('Midtrans Notification:', notification);

  // Safely extract properties with fallbacks
  const order_id = notification.order_id;
  const transaction_status = notification.transaction_status;
  const fraud_status = notification.fraud_status;
  const payment_type = notification.payment_type;
  const gross_amount = notification.gross_amount;
  const signature_key = notification.signature_key;
  
  // Validate required fields
  if (!order_id || !transaction_status || !gross_amount) {
    console.log('Missing required fields:', { order_id, transaction_status, gross_amount });
    return next(new ApiError('Missing required notification fields', 400));
  }

  // Verify signature key for security
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const expectedSignature = crypto
    .createHash('sha512')
    .update(`${order_id}${notification.status_code || '200'}${gross_amount}${serverKey}`)
    .digest('hex');

  console.log('Expected signature:', expectedSignature);
  console.log('Received signature:', signature_key);
  
  if (signature_key !== expectedSignature) {
    return next(new ApiError('Invalid signature', 400));
  }

  try {
    // Get payment from database
    const payment = await Payment.findOne({ transactionID: order_id });
    if (!payment) {
      return next(new ApiError('Payment not found', 404));
    }

    // Get order with user details
    const order = await Order.findById(payment.orderID).populate('userID');
    if (!order) {
      return next(new ApiError('Order not found', 404));
    }

    let paymentStatus = 'pending';
    let orderStatus = order.status;
    let shouldSendEmail = false;

    // Update payment status based on Midtrans notification
    switch (transaction_status) {
      case 'capture':
        if (fraud_status === 'accept') {
          paymentStatus = 'completed';
          orderStatus = 'confirmed';
          shouldSendEmail = true;
        } else if (fraud_status === 'challenge') {
          paymentStatus = 'processing';
        } else {
          paymentStatus = 'failed';
        }
        break;
      
      case 'settlement':
        paymentStatus = 'completed';
        orderStatus = 'confirmed';
        shouldSendEmail = true;
        break;
      
      case 'pending':
        paymentStatus = 'pending';
        break;
      
      case 'deny':
      case 'expire':
      case 'cancel':
        paymentStatus = 'failed';
        orderStatus = 'cancelled';
        break;
      
      default:
        paymentStatus = 'pending';
    }

    // Update payment
    await Payment.findByIdAndUpdate(payment._id, {
      paymentStatus,
      gatewayTransactionID: notification.transaction_id,
      gatewayResponse: notification,
      paymentDate: paymentStatus === 'completed' ? new Date() : payment.paymentDate
    });

    // Update order status
    await Order.findByIdAndUpdate(order._id, {
      status: orderStatus
    });

    // Send email notification if payment is successful (async without blocking webhook)
    if (shouldSendEmail) {
      // Process email in background without blocking webhook response
      setImmediate(async () => {
        try {
          // Get product details for email
          const product = await Product.findById(order.productID);
          
          // Handle guest vs registered user email
          const customerEmail = order.guestEmail || order.userID?.email;
          const customerName = order.customerName || order.userID?.username || 'Customer';
          
          // Ensure we have a valid email
          if (!customerEmail) {
            console.error('No customer email found for order:', order._id);
            return;
          }
          
          console.log(`📨 Sending email to: ${customerEmail} for product: ${product?.title}`);
          
          const orderData = {
            orderId: order._id.toString(), // Add missing orderId
            orderNumber: order.orderNumber || order_id,
            productName: product?.title || 'Portfolio Website',
            productType: product?.category || 'responsive-portfolio',
            totalAmount: gross_amount,
            createdAt: order.createdAt || new Date(),
          };
          
          // Check if product has source code to send via email
          let sourceCodeAvailable = false;
          let downloadUrl = `http://localhost:5173/order/${order._id}`;
          
          if (product && product.hasSourceCode && product.sourceCode) {
            // Priority: Cloudinary URL > Database file > Default order URL
            if (product.sourceCode.cloudinaryUrl) {
              sourceCodeAvailable = true;
              downloadUrl = product.sourceCode.cloudinaryUrl;
              console.log(`📁 Source code available on Cloudinary: ${product.sourceCode.originalName || 'source-code.zip'}`);
            } else if (product.sourceCode.fileData) {
              sourceCodeAvailable = true;
              console.log(`📁 Source code available in database: ${product.sourceCode.originalName || 'source-code.zip'}`);
            } else {
              console.log('⚠️ No source code file configured for this product');
            }
          } else {
            console.log('⚠️ No source code configured for this product');
          }
          
          // Send email immediately with optimized transporter
          await emailService.sendPortfolioSourceCode(
            customerEmail,
            customerName,
            { ...orderData, downloadUrl }, // Include download URL in order data
            sourceCodeAvailable // Just pass availability flag
          );
          
          console.log(`✅ Email sent successfully to ${customerEmail}`);
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }
      });
    }

    // Create payout record if payment is completed
    if (paymentStatus === 'completed') {
      try {
        // Check if payout record already exists
        const existingPayout = await Payout.findOne({ transactionID: order_id });
        
        if (!existingPayout) {
          // Get full order and product details
          const fullOrder = await Order.findById(order._id).populate('productID userID');
          
          // Handle guest orders (userID might be null)
          const isGuestOrder = !fullOrder.userID;
          const customerEmail = fullOrder.guestEmail || fullOrder.userID?.email;
          const customerName = fullOrder.customerName || fullOrder.userID?.username || 'Guest Customer';
          
          const payoutData = {
            orderID: fullOrder._id,
            paymentID: payment._id,
            productID: fullOrder.productID._id,
            transactionID: order_id,
            amount: parseInt(gross_amount),
            paymentMethod: payment_type || 'midtrans',
            status: 'completed',
            purchaseDate: new Date(),
            completedAt: new Date(),
            productDetails: {
              title: fullOrder.productID.title,
              description: fullOrder.productID.description,
              price: fullOrder.productID.price,
              category: fullOrder.productID.category,
              images: fullOrder.productID.images
            },
            customerInfo: {
              name: customerName,
              email: customerEmail,
              phone: fullOrder.userID?.phone || ''
            }
          };

          // Only add userID if it exists (not guest order)
          if (!isGuestOrder) {
            payoutData.userID = fullOrder.userID._id;
          }

          await Payout.create(payoutData);
          console.log(`Payout record created for transaction ${order_id}`);
        }
      } catch (payoutError) {
        console.error('Failed to create payout record:', payoutError);
        // Don't fail the webhook if payout creation fails
      }
    }

    console.log(`Payment ${order_id} updated to ${paymentStatus}, Order status: ${orderStatus}`);

    res.status(200).json({
      status: 'success',
      message: 'Notification processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return next(new ApiError('Failed to process notification', 500));
  }
});

// @desc    Check payment status from Midtrans
// @route   GET /api/payments/:id/status
// @access  Private (User login required)
exports.checkPaymentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userID = req.user._id;

  // Get payment
  const payment = await Payment.findOne({ _id: id, userID }).populate('orderID');
  if (!payment) {
    return next(new ApiError('Payment not found', 404));
  }

  // Check status from Midtrans if it's a Midtrans payment
  if (payment.paymentGateway === 'midtrans' && payment.transactionID) {
    try {
      const statusResponse = await core.transaction.status(payment.transactionID);
      
      let paymentStatus = 'pending';
      let orderStatus = payment.orderID.status;

      switch (statusResponse.transaction_status) {
        case 'capture':
          if (statusResponse.fraud_status === 'accept') {
            paymentStatus = 'completed';
            orderStatus = 'confirmed';
          } else if (statusResponse.fraud_status === 'challenge') {
            paymentStatus = 'processing';
          } else {
            paymentStatus = 'failed';
          }
          break;
        
        case 'settlement':
          paymentStatus = 'completed';
          orderStatus = 'confirmed';
          break;
        
        case 'pending':
          paymentStatus = 'pending';
          break;
        
        case 'deny':
        case 'expire':
        case 'cancel':
          paymentStatus = 'failed';
          orderStatus = 'cancelled';
          break;
        
        default:
          paymentStatus = 'pending';
      }

      // Update payment if status changed
      if (payment.paymentStatus !== paymentStatus) {
        await Payment.findByIdAndUpdate(payment._id, {
          paymentStatus,
          gatewayResponse: statusResponse,
          paymentDate: paymentStatus === 'completed' ? new Date() : payment.paymentDate
        });

        // Update order status
        await Order.findByIdAndUpdate(payment.orderID._id, {
          status: orderStatus
        });
      }

      // Refresh payment data
      const updatedPayment = await Payment.findById(payment._id).populate('orderID');
      
      res.status(200).json(
        new ApiResponse(200, {
          payment: updatedPayment,
          midtransStatus: statusResponse
        }, 'Payment status checked successfully')
      );

    } catch (error) {
      console.error('Error checking Midtrans status:', error);
      return next(new ApiError('Failed to check payment status', 500));
    }
  } else {
    // Return current payment status for non-Midtrans payments
    res.status(200).json(
      new ApiResponse(200, { payment }, 'Payment status retrieved successfully')
    );
  }
});

module.exports = {
  handleMidtransNotification: exports.handleMidtransNotification,
  checkPaymentStatus: exports.checkPaymentStatus
};
