const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Changed to false to support guest orders
    index: true
  },
  guestEmail: {
    type: String,
    required: false,
    validate: {
      validator: function(email) {
        if (!email) return true; // Allow empty for registered users
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
    index: true
  },
  unitPrice: {
    type: mongoose.Schema.Types.Decimal128,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative'],
    get: (value) => {
      if (value !== null && value !== undefined) {
        return parseFloat(value.toString());
      }
      return value;
    }
  },
  isInstantOrder: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    required: [true, 'Order status is required'],
    enum: {
      values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed'],
      message: 'Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled, refunded, failed'
    },
    default: 'pending',
    index: true
  },
  orderDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [999, 'Quantity cannot exceed 999'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number'
    }
  },
  totalAmount: {
    type: mongoose.Schema.Types.Decimal128,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
    get: (value) => {
      if (value !== null && value !== undefined) {
        return parseFloat(value.toString());
      }
      return value;
    }
  },
  // Additional fields for order management
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  estimatedDelivery: Date,
  trackingNumber: String
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Compound indexes for efficient queries
orderSchema.index({ userID: 1, orderDate: -1 });
orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ productID: 1, orderDate: -1 });

// Pre-save middleware to calculate total amount
orderSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('unitPrice')) {
    const unitPrice = parseFloat(this.unitPrice.toString());
    this.totalAmount = mongoose.Types.Decimal128.fromString((unitPrice * this.quantity).toFixed(2));
  }
  next();
});

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  return Math.ceil((Date.now() - this.orderDate) / (1000 * 60 * 60 * 24));
});

// Validation: Either userID or guestEmail must be provided
orderSchema.pre('validate', function(next) {
  if (!this.userID && !this.guestEmail) {
    this.invalidate('userID', 'Either userID or guestEmail must be provided');
    this.invalidate('guestEmail', 'Either userID or guestEmail must be provided');
  }
  next();
});

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ status }).populate('userID productID');
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);