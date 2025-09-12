const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required'],
    index: true
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Made optional for guest payments
    index: true
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'cod', 'paypal', 'stripe', 'midtrans'],
      message: 'Payment method must be one of: credit_card, debit_card, bank_transfer, e_wallet, cod, paypal, stripe, midtrans'
    },
    index: true
  },
  transactionID: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    index: true
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative'],
    get: (value) => {
      if (value !== null && value !== undefined) {
        return parseFloat(value.toString());
      }
      return value;
    }
  },
  paymentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  paymentStatus: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: {
      values: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'expired'],
      message: 'Payment status must be one of: pending, processing, completed, failed, cancelled, refunded, expired'
    },
    default: 'pending',
    index: true
  },
  // Additional payment fields
  currency: {
    type: String,
    default: 'IDR',
    uppercase: true
  },
  paymentGateway: {
    type: String,
    enum: ['midtrans', 'xendit', 'doku', 'ovo', 'gopay', 'dana', 'linkaja', 'manual']
  },
  gatewayTransactionID: String, // ID from payment gateway
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed // Store gateway response
  },
  // Midtrans specific fields
  snapToken: {
    type: String // Midtrans Snap token
  },
  midtransToken: {
    type: String // Alternative field name for Midtrans token
  },
  paymentUrl: {
    type: String // Midtrans payment URL
  },
  // Guest payment fields
  customerEmail: {
    type: String // Email for guest payments
  },
  isInstantPayment: {
    type: Boolean,
    default: false
  },
  refundAmount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: (value) => {
      if (value !== null && value !== undefined) {
        return parseFloat(value.toString());
      }
      return value;
    }
  },
  refundDate: Date,
  refundReason: String,
  paymentProof: String, // URL to payment proof image
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Compound indexes for efficient queries
paymentSchema.index({ userID: 1, paymentDate: -1 });
paymentSchema.index({ paymentStatus: 1, paymentDate: -1 });
paymentSchema.index({ orderID: 1, paymentStatus: 1 });
paymentSchema.index({ paymentMethod: 1, paymentDate: -1 });

// Virtual for payment age in hours
paymentSchema.virtual('paymentAge').get(function() {
  return Math.ceil((Date.now() - this.paymentDate) / (1000 * 60 * 60));
});

// Virtual for net amount (amount - refund)
paymentSchema.virtual('netAmount').get(function() {
  const amount = parseFloat(this.amount.toString());
  const refund = parseFloat(this.refundAmount.toString()) || 0;
  return amount - refund;
});

// Static method to get payments by status
paymentSchema.statics.getPaymentsByStatus = function(status) {
  return this.find({ paymentStatus: status }).populate('orderID userID');
};

// Static method to get payments by method
paymentSchema.statics.getPaymentsByMethod = function(method) {
  return this.find({ paymentMethod: method }).populate('orderID userID');
};

// Instance method to update payment status
paymentSchema.methods.updateStatus = function(newStatus, gatewayResponse = null) {
  this.paymentStatus = newStatus;
  if (gatewayResponse) {
    this.gatewayResponse = gatewayResponse;
  }
  return this.save();
};

// Instance method to process refund
paymentSchema.methods.processRefund = function(refundAmount, reason) {
  this.refundAmount = mongoose.Types.Decimal128.fromString(refundAmount.toString());
  this.refundDate = new Date();
  this.refundReason = reason;
  this.paymentStatus = 'refunded';
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);
