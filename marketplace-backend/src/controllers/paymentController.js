const Payment = require('../models/payment');
const Order = require('../models/order');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const crypto = require('crypto');
const { snap, core } = require('../config/midtrans');

// @desc    Get order ID from transaction ID 
// @route   GET /api/payments/transaction/:transactionId
// @access  Public
exports.getOrderFromTransaction = asyncHandler(async (req, res, next) => {
  const { transactionId } = req.params;

  // Find payment by transaction ID
  const payment = await Payment.findOne({ transactionID: transactionId }).populate('orderID');
  
  if (!payment) {
    return next(new ApiError('Transaction not found', 404));
  }

  res.status(200).json(new ApiResponse(200, {
    orderID: payment.orderID._id,
    paymentStatus: payment.paymentStatus,
    order: payment.orderID
  }, 'Order found successfully'));
});

// @desc    Create payment for order with Midtrans
// @route   POST /api/payments
// @access  Private (User login required)
exports.createPayment = asyncHandler(async (req, res, next) => {
  const { orderID, paymentMethod = 'midtrans' } = req.body;
  const userID = req.user._id;

  // Check if order exists and belongs to user
  const order = await Order.findOne({ _id: orderID, userID }).populate('productID', 'title');
  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  // Check if payment already exists for this order
  const existingPayment = await Payment.findOne({ orderID, paymentStatus: { $in: ['pending', 'processing', 'completed'] } });
  if (existingPayment) {
    return next(new ApiError('Payment already exists for this order', 400));
  }

  // Generate unique transaction ID
  const transactionID = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  let snapToken = null;
  let paymentUrl = null;

  // Create Midtrans payment if paymentMethod is midtrans
  if (paymentMethod === 'midtrans') {
    const parameter = {
      transaction_details: {
        order_id: transactionID,
        gross_amount: parseInt(order.totalAmount)
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: req.user.name || req.user.username,
        email: req.user.email,
        phone: req.user.phone || '08123456789'
      },
      item_details: [
        {
          id: order.productID._id,
          price: parseInt(order.unitPrice),
          quantity: order.quantity,
          name: order.productID.title || 'Product'
        }
      ]
    };

    try {
      const transaction = await snap.createTransaction(parameter);
      snapToken = transaction.token;
      paymentUrl = transaction.redirect_url;
    } catch (error) {
      console.error('Midtrans Error:', error);
      return next(new ApiError('Failed to create payment with Midtrans', 500));
    }
  }

  // Create payment record
  const payment = await Payment.create({
    orderID,
    userID,
    paymentMethod,
    transactionID,
    amount: order.totalAmount,
    paymentGateway: paymentMethod === 'midtrans' ? 'midtrans' : 'manual',
    snapToken,
    paymentUrl
  });

  // Populate order and user details
  await payment.populate('orderID', 'quantity totalAmount status');
  await payment.populate('userID', 'username email');

  res.status(201).json(
    new ApiResponse(201, {
      payment,
      snapToken,
      paymentUrl
    }, 'Payment created successfully')
  );
});

// @desc    Get user's payments
// @route   GET /api/payments
// @access  Private (User login required)
exports.getUserPayments = asyncHandler(async (req, res) => {
  const userID = req.user._id;
  const { status, method, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { userID };
  if (status) {
    query.paymentStatus = status;
  }
  if (method) {
    query.paymentMethod = method;
  }

  // Pagination
  const skip = (page - 1) * limit;

  const payments = await Payment.find(query)
    .populate('orderID', 'quantity totalAmount status productID')
    .populate({
      path: 'orderID',
      populate: {
        path: 'productID',
        select: 'title images category'
      }
    })
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalPayments = await Payment.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPayments / limit),
        totalPayments,
        hasNext: page * limit < totalPayments,
        hasPrev: page > 1
      }
    }, 'Payments retrieved successfully')
  );
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private (User login required)
exports.getPayment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userID = req.user._id;

  const payment = await Payment.findOne({ _id: id, userID })
    .populate('orderID')
    .populate({
      path: 'orderID',
      populate: {
        path: 'productID',
        select: 'title images category price description'
      }
    })
    .populate('userID', 'username email');

  if (!payment) {
    return next(new ApiError('Payment not found', 404));
  }

  res.json(
    new ApiResponse(200, payment, 'Payment retrieved successfully')
  );
});

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  Private (User login required)
exports.updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, paymentProof } = req.body;
  const userID = req.user._id;

  const payment = await Payment.findOne({ _id: id, userID });
  if (!payment) {
    return next(new ApiError('Payment not found', 404));
  }

  // Only allow certain status updates by user
  const allowedUserUpdates = ['cancelled'];
  if (!allowedUserUpdates.includes(status)) {
    return next(new ApiError('You can only cancel payments', 403));
  }

  // Don't allow cancellation of completed payments
  if (payment.paymentStatus === 'completed' && status === 'cancelled') {
    return next(new ApiError('Cannot cancel completed payments', 400));
  }

  payment.paymentStatus = status;
  if (paymentProof) {
    payment.paymentProof = paymentProof;
  }
  await payment.save();

  await payment.populate('orderID');

  res.json(
    new ApiResponse(200, payment, 'Payment status updated successfully')
  );
});

// @desc    Upload payment proof
// @route   PUT /api/payments/:id/proof
// @access  Private (User login required)
exports.uploadPaymentProof = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { paymentProof } = req.body;
  const userID = req.user._id;

  const payment = await Payment.findOne({ _id: id, userID });
  if (!payment) {
    return next(new ApiError('Payment not found', 404));
  }

  payment.paymentProof = paymentProof;
  payment.paymentStatus = 'processing'; // Update status to processing when proof is uploaded
  await payment.save();

  await payment.populate('orderID');

  res.json(
    new ApiResponse(200, payment, 'Payment proof uploaded successfully')
  );
});

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private (User login required)
exports.getPaymentStats = asyncHandler(async (req, res) => {
  const userID = req.user._id;

  const stats = await Payment.aggregate([
    { $match: { userID: userID } },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const totalPayments = await Payment.countDocuments({ userID });
  const totalPaid = await Payment.aggregate([
    { $match: { userID: userID, paymentStatus: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.json(
    new ApiResponse(200, {
      totalPayments,
      totalPaid: totalPaid[0]?.total || 0,
      statusBreakdown: stats
    }, 'Payment statistics retrieved successfully')
  );
});

// ===== ADMIN ROUTES =====

// @desc    Get all payments (Admin only)
// @route   GET /api/payments/admin/all
// @access  Private (Admin only)
exports.getAllPayments = asyncHandler(async (req, res) => {
  const { status, method, page = 1, limit = 20, search } = req.query;

  // Build query
  const query = {};
  if (status) {
    query.paymentStatus = status;
  }
  if (method) {
    query.paymentMethod = method;
  }

  // Pagination
  const skip = (page - 1) * limit;

  let payments = Payment.find(query)
    .populate('orderID', 'quantity totalAmount status productID')
    .populate({
      path: 'orderID',
      populate: {
        path: 'productID',
        select: 'title images category'
      }
    })
    .populate('userID', 'username email')
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  if (search) {
    payments = payments.find({
      $or: [
        { transactionID: { $regex: search, $options: 'i' } },
        { 'userID.username': { $regex: search, $options: 'i' } },
        { 'userID.email': { $regex: search, $options: 'i' } }
      ]
    });
  }

  const result = await payments;
  const totalPayments = await Payment.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      payments: result,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPayments / limit),
        totalPayments,
        hasNext: page * limit < totalPayments,
        hasPrev: page > 1
      }
    }, 'All payments retrieved successfully')
  );
});

// @desc    Update payment status (Admin only)
// @route   PUT /api/payments/admin/:id/status
// @access  Private (Admin only)
exports.adminUpdatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, gatewayTransactionID, notes } = req.body;

  const payment = await Payment.findById(id);
  if (!payment) {
    return next(new ApiError('Payment not found', 404));
  }

  payment.paymentStatus = status;
  if (gatewayTransactionID) payment.gatewayTransactionID = gatewayTransactionID;
  if (notes) payment.notes = notes;

  // If payment is confirmed, update order status
  if (status === 'completed') {
    const order = await Order.findById(payment.orderID);
    if (order && order.status === 'pending') {
      order.status = 'confirmed';
      await order.save();
    }
  }

  await payment.save();
  await payment.populate('orderID userID');

  res.json(
    new ApiResponse(200, payment, 'Payment status updated successfully')
  );
});

// @desc    Process refund (Admin only)
// @route   POST /api/payments/admin/:id/refund
// @access  Private (Admin only)
exports.processRefund = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { refundAmount, reason } = req.body;

  const payment = await Payment.findById(id);
  if (!payment) {
    return next(new ApiError('Payment not found', 404));
  }

  if (payment.paymentStatus !== 'completed') {
    return next(new ApiError('Can only refund completed payments', 400));
  }

  const amount = parseFloat(payment.amount.toString());
  if (refundAmount > amount) {
    return next(new ApiError('Refund amount cannot exceed payment amount', 400));
  }

  await payment.processRefund(refundAmount, reason);
  await payment.populate('orderID userID');

  res.json(
    new ApiResponse(200, payment, 'Refund processed successfully')
  );
});

// @desc    Create instant payment (for guest and logged users)
// @route   POST /api/payments/instant
// @access  Public/Private
exports.createInstantPayment = asyncHandler(async (req, res, next) => {
  const { orderId, email } = req.body;

  // Validate required fields
  if (!orderId || !email) {
    return next(new ApiError('Order ID and email are required', 400));
  }

  // Get order details
  const order = await Order.findById(orderId).populate('productID userID');
  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  // Verify the order belongs to the correct user/email
  if (order.userID) {
    // For users with account (both logged in via endpoint or found by email)
    // Verify email matches user's email
    if (order.userID.email !== email) {
      return next(new ApiError('Email does not match user account email', 403));
    }
  } else if (order.guestEmail && order.guestEmail !== email) {
    // For pure guest users
    return next(new ApiError('Email does not match order email', 403));
  }

  // Check if payment already exists for this order
  const existingPayment = await Payment.findOne({ 
    orderID: orderId, 
    paymentStatus: { $in: ['pending', 'processing', 'completed'] } 
  });
  if (existingPayment) {
    return next(new ApiError('Payment already exists for this order', 400));
  }

  // Generate unique transaction ID
  const transactionID = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  let customerName = 'Guest Customer';
  let customerEmail = email;

  if (order.userID) {
    customerName = order.userID.name || order.userID.username;
    customerEmail = order.userID.email;
  }

  // Create Midtrans payment
  const parameter = {
    transaction_details: {
      order_id: transactionID,
      gross_amount: parseInt(order.totalAmount)
    },
    credit_card: {
      secure: true
    },
    customer_details: {
      first_name: customerName,
      email: customerEmail,
      phone: '08123456789'
    },
    item_details: [
      {
        id: order.productID._id.toString(),
        price: parseInt(order.unitPrice),
        quantity: order.quantity,
        name: order.productID.title,
        category: order.productID.category || 'Digital Product'
      }
    ],
    callbacks: {
      finish: `${process.env.FRONTEND_URL}/payment/success`
    }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    
    // Create payment record
    const paymentData = {
      orderID: order._id,
      transactionID,
      amount: order.totalAmount,
      paymentMethod: 'midtrans',
      paymentStatus: 'pending',
      midtransToken: transaction.token,
      paymentUrl: transaction.redirect_url,
      customerEmail: customerEmail,
      isInstantPayment: true
    };

    // Add userID if available
    if (order.userID) {
      paymentData.userID = order.userID._id;
    }

    const payment = await Payment.create(paymentData);

    res.status(201).json(
      new ApiResponse(201, {
        payment,
        midtransToken: transaction.token,
        paymentUrl: transaction.redirect_url
      }, 'Instant payment created successfully')
    );

  } catch (error) {
    console.error('Midtrans error:', error);
    
    // Provide more specific error messages based on error type
    if (error.httpStatusCode === 401) {
      return next(new ApiError('Midtrans authentication failed. Please check server key configuration.', 500));
    } else if (error.httpStatusCode === 400) {
      return next(new ApiError('Invalid payment request data for Midtrans.', 400));
    } else if (error.httpStatusCode === 403) {
      return next(new ApiError('Midtrans access denied. Check API permissions.', 500));
    } else {
      return next(new ApiError(`Failed to create payment with Midtrans: ${error.message}`, 500));
    }
  }
});

// @desc    Retry payment for failed/expired order
// @route   POST /api/payments/retry/:orderId
// @access  Public
exports.retryPayment = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { email, paymentMethod = 'midtrans' } = req.body;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ApiError('Valid email is required', 400));
  }

  // Find the order
  const order = await Order.findById(orderId).populate('productID', 'title category').populate('userID', 'name username email');
  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  // Check if order is in failed status or if payment failed/expired
  if (order.status !== 'failed' && order.status !== 'pending') {
    return next(new ApiError('Order cannot be retried in current status', 400));
  }

  // Verify email matches order
  if (order.userID) {
    if (order.userID.email !== email) {
      return next(new ApiError('Email does not match order email', 403));
    }
  } else if (order.guestEmail && order.guestEmail !== email) {
    return next(new ApiError('Email does not match order email', 403));
  }

  // Check for existing pending/processing payments
  const existingActivePayment = await Payment.findOne({ 
    orderID: orderId, 
    paymentStatus: { $in: ['pending', 'processing', 'completed'] } 
  });
  
  if (existingActivePayment && existingActivePayment.paymentStatus === 'completed') {
    return next(new ApiError('Payment already completed for this order', 400));
  }

  // Mark previous failed payments as cancelled
  await Payment.updateMany(
    { orderID: orderId, paymentStatus: { $in: ['failed', 'pending'] } },
    { paymentStatus: 'cancelled', updatedAt: new Date() }
  );

  // Generate new transaction ID
  const transactionID = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  let customerName = 'Guest Customer';
  let customerEmail = email;

  if (order.userID) {
    customerName = order.userID.name || order.userID.username;
    customerEmail = order.userID.email;
  }

  // Create Midtrans payment
  const parameter = {
    transaction_details: {
      order_id: transactionID,
      gross_amount: parseInt(order.totalAmount)
    },
    credit_card: {
      secure: true
    },
    customer_details: {
      first_name: customerName,
      email: customerEmail,
      phone: '08123456789'
    },
    item_details: [
      {
        id: order.productID._id.toString(),
        price: parseInt(order.unitPrice),
        quantity: order.quantity,
        name: order.productID.title,
        category: order.productID.category || 'Digital Product'
      }
    ],
    callbacks: {
      finish: `${process.env.CLIENT_URL}/payment/success`
    }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    
    // Create new payment record
    const paymentData = {
      orderID: order._id,
      transactionID,
      amount: order.totalAmount,
      paymentMethod: 'midtrans',
      paymentStatus: 'pending',
      midtransToken: transaction.token,
      paymentUrl: transaction.redirect_url,
      customerEmail: customerEmail,
      isRetryPayment: true
    };

    // Add userID if available
    if (order.userID) {
      paymentData.userID = order.userID._id;
    }

    const payment = await Payment.create(paymentData);

    // Update order status back to pending
    await Order.findByIdAndUpdate(orderId, {
      status: 'pending',
      updatedAt: new Date()
    });

    res.status(201).json(
      new ApiResponse(201, {
        payment,
        midtransToken: transaction.token,
        paymentUrl: transaction.redirect_url
      }, 'Payment retry created successfully')
    );

  } catch (error) {
    console.error('Midtrans error on retry:', error);
    
    if (error.httpStatusCode === 401) {
      return next(new ApiError('Midtrans authentication failed. Please check server key configuration.', 500));
    } else if (error.httpStatusCode === 400) {
      return next(new ApiError('Invalid payment request data for Midtrans.', 400));
    } else if (error.httpStatusCode === 403) {
      return next(new ApiError('Midtrans access denied. Check API permissions.', 500));
    } else {
      return next(new ApiError(`Failed to create retry payment with Midtrans: ${error.message}`, 500));
    }
  }
});

// @desc    Check and update expired payments
// @route   POST /api/payments/check-expired
// @access  Private (Admin only or internal)
exports.checkExpiredPayments = asyncHandler(async (req, res, next) => {
  console.log('=== CHECKING EXPIRED PAYMENTS ===');

  try {
    // Calculate time 10 minutes ago (production setting)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    console.log('Current time:', new Date());
    console.log('Checking payments older than:', tenMinutesAgo);

    // Find all pending payments that are older than 10 minutes
    const expiredPayments = await Payment.find({
      paymentStatus: 'pending',
      createdAt: { $lt: tenMinutesAgo }
    }).populate('orderID userID', 'username email');

    console.log(`Found ${expiredPayments.length} expired payments`);

    const updatedPayments = [];
    const emailNotifications = [];

    for (const payment of expiredPayments) {
      console.log(`Processing expired payment: ${payment.transactionID}`);
      
      // Update payment status to expired
      payment.paymentStatus = 'expired';
      await payment.save();

      // Update related order status to failed
      if (payment.orderID) {
        payment.orderID.status = 'failed';
        payment.orderID.failureReason = 'Payment expired - no payment received within 10 minutes';
        await payment.orderID.save();
      }

      updatedPayments.push({
        transactionID: payment.transactionID,
        orderID: payment.orderID?._id,
        userEmail: payment.userID?.email || payment.customerEmail,
        amount: payment.amount
      });

      // Prepare email notification data
      if (payment.userID?.email || payment.customerEmail) {
        emailNotifications.push({
          email: payment.userID?.email || payment.customerEmail,
          username: payment.userID?.username || 'Customer',
          transactionID: payment.transactionID,
          orderID: payment.orderID?._id,
          amount: payment.amount,
          expiredAt: new Date()
        });
      }
    }

    console.log(`Updated ${updatedPayments.length} payments to expired status`);

    // Send email notifications (we'll implement the email service later)
    if (emailNotifications.length > 0) {
      try {
        const emailService = require('../services/emailService');
        for (const notification of emailNotifications) {
          await emailService.sendPaymentExpiredNotification(notification);
        }
        console.log(`Sent ${emailNotifications.length} email notifications`);
      } catch (emailError) {
        console.error('Error sending email notifications:', emailError);
        // Don't fail the whole process if email fails
      }
    }

    res.status(200).json(new ApiResponse(200, {
      expiredCount: updatedPayments.length,
      updatedPayments,
      emailsSent: emailNotifications.length
    }, `Successfully processed ${updatedPayments.length} expired payments`));

  } catch (error) {
    console.error('Error checking expired payments:', error);
    return next(new ApiError(`Failed to check expired payments: ${error.message}`, 500));
  }
});
