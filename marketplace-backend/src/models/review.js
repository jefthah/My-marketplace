const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer'
    }
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required']
  },
  is_verified_purchase: {
    type: Boolean,
    default: true
  },
  helpful_count: {
    type: Number,
    default: 0,
    min: [0, 'Helpful count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index untuk performa yang lebih baik
reviewSchema.index({ product_id: 1 });
reviewSchema.index({ user_id: 1 });
reviewSchema.index({ order_id: 1 });
reviewSchema.index({ user_id: 1, product_id: 1, order_id: 1 }, { unique: true });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Virtual untuk populate user name
reviewSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Virtual untuk populate product details
reviewSchema.virtual('product', {
  ref: 'Product',
  localField: 'product_id',
  foreignField: '_id',
  justOne: true
});

// Virtual untuk populate order details
reviewSchema.virtual('order', {
  ref: 'Order',
  localField: 'order_id',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware untuk validasi
reviewSchema.pre('save', async function(next) {
  // Cek apakah user sudah pernah review produk dari order yang sama
  if (this.isNew) {
    const existingReview = await this.constructor.findOne({
      user_id: this.user_id,
      product_id: this.product_id,
      order_id: this.order_id,
      _id: { $ne: this._id }
    });
    
    if (existingReview) {
      const error = new Error('User has already reviewed this product from this order');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Static method untuk mendapatkan statistik rating produk
reviewSchema.statics.getProductRatingStats = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product_id: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$product_id',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    averageRating: 0,
    totalReviews: 0,
    rating5: 0,
    rating4: 0,
    rating3: 0,
    rating2: 0,
    rating1: 0
  };
};

// Instance method untuk increment helpful count
reviewSchema.methods.incrementHelpful = function() {
  this.helpful_count += 1;
  return this.save();
};

module.exports = mongoose.model('Review', reviewSchema);
