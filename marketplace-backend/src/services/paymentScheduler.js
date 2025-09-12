const cron = require('node-cron');
const Payment = require('../models/payment');
const Order = require('../models/order');
const emailService = require('./emailService');

// Function to check and update expired payments
const checkExpiredPayments = async () => {
  try {
    console.log('🔍 Checking for expired payments...');
    
    // Find payments that are pending for more than 10 minutes (updated from 15)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const expiredPayments = await Payment.find({
      paymentStatus: 'pending',
      createdAt: { $lt: tenMinutesAgo }
    }).populate({
      path: 'orderID',
      populate: {
        path: 'userID',
        select: 'username email'
      }
    }).populate('userID', 'username email');

    console.log(`Found ${expiredPayments.length} payments to check`);

    if (expiredPayments.length > 0) {
      console.log(`⏰ Found ${expiredPayments.length} expired payments`);
      
      for (const payment of expiredPayments) {
        console.log(`Processing payment: ${payment.transactionID}`);
        console.log(`User from payment.userID:`, payment.userID);
        console.log(`User from payment.orderID.userID:`, payment.orderID?.userID);
        
        // Get user email from payment.userID or payment.orderID.userID or customerEmail
        let userEmail = null;
        let userName = 'Customer';
        
        if (payment.userID?.email) {
          userEmail = payment.userID.email;
          userName = payment.userID.username || 'Customer';
        } else if (payment.orderID?.userID?.email) {
          userEmail = payment.orderID.userID.email;
          userName = payment.orderID.userID.username || 'Customer';
        } else if (payment.customerEmail) {
          userEmail = payment.customerEmail;
        }
        
        console.log(`Final email to send to: ${userEmail}`);

        // Update payment status to expired (more accurate than failed)
        await Payment.findByIdAndUpdate(payment._id, {
          paymentStatus: 'expired',
          failureReason: 'Payment timeout - exceeded 10 minutes limit',
          updatedAt: new Date()
        });

        // Update order status to failed if exists
        if (payment.orderID) {
          await Order.findByIdAndUpdate(payment.orderID._id, {
            status: 'failed',
            failureReason: 'Payment expired - no payment received within 10 minutes',
            updatedAt: new Date()
          });
        }

        console.log(`❌ Payment ${payment.transactionID} marked as expired due to timeout`);

        // Send email notification
        try {
          if (userEmail) {
            await emailService.sendPaymentExpiredNotification({
              email: userEmail,
              username: userName,
              transactionID: payment.transactionID,
              orderID: payment.orderID?._id,
              amount: payment.amount,
              expiredAt: new Date()
            });
            console.log(`📧 Expired payment email sent for ${payment.transactionID} to ${userEmail}`);
          } else {
            console.log(`⚠️ No email found for payment ${payment.transactionID} - skipping email notification`);
          }
        } catch (emailError) {
          console.error(`❌ Failed to send email for ${payment.transactionID}:`, emailError.message);
          // Don't fail the whole process if email fails
        }
      }
    } else {
      console.log('✅ No expired payments found');
    }
  } catch (error) {
    console.error('❌ Error checking expired payments:', error);
  }
};

// Function to start the payment expiry scheduler
const startPaymentExpiryScheduler = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    checkExpiredPayments();
  });

  console.log('⏰ Payment expiry scheduler started - checking every 5 minutes');
  
  // Run immediately on startup
  checkExpiredPayments();
};

module.exports = {
  startPaymentExpiryScheduler,
  checkExpiredPayments
};
