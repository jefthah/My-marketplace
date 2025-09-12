const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Allow null for guest orders
  },
  orderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  paymentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  transactionID: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['midtrans', 'manual', 'bank_transfer', 'gopay', 'ovo', 'dana', 'shopee_pay', 'echannel', 'credit_card', 'cstore', 'bca_va', 'bni_va', 'bri_va', 'permata_va', 'other_va']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  productDetails: {
    title: String,
    description: String,
    price: Number,
    category: String,
    images: [String]
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  downloadLinks: [{
    fileName: String,
    fileUrl: String,
    downloadCount: {
      type: Number,
      default: 0
    },
    expiresAt: Date
  }],
  invoice: {
    invoiceNumber: String,
    invoiceUrl: String,
    generatedAt: Date
  },
  refund: {
    isRefunded: {
      type: Boolean,
      default: false
    },
    refundAmount: Number,
    refundReason: String,
    refundDate: Date,
    refundTransactionID: String
  }
}, {
  timestamps: true
});

// Indexes untuk optimasi query
payoutSchema.index({ userID: 1, createdAt: -1 });
// transactionID sudah unique di schema definition, tidak perlu index lagi
payoutSchema.index({ status: 1 });
payoutSchema.index({ purchaseDate: -1 });

// Virtual untuk format amount dalam rupiah
payoutSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(this.amount);
});

// Method untuk update status
payoutSchema.methods.updateStatus = function(newStatus, completedAt = null) {
  this.status = newStatus;
  if (newStatus === 'completed' && completedAt) {
    this.completedAt = completedAt;
  }
  return this.save();
};

// Method untuk add download link
payoutSchema.methods.addDownloadLink = function(fileName, fileUrl, expiresInDays = 30) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  
  this.downloadLinks.push({
    fileName,
    fileUrl,
    expiresAt
  });
  
  return this.save();
};

// Static method untuk get user history
payoutSchema.statics.getUserHistory = function(userID, page = 1, limit = 10, status = null) {
  const query = { userID };
  if (status) {
    query.status = status;
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .populate('orderID', 'status createdAt')
    .populate('paymentID', 'paymentMethod paymentStatus')
    .populate('productID', 'title price category images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method untuk get statistics
payoutSchema.statics.getUserStats = function(userID) {
  return this.aggregate([
    { $match: { userID: mongoose.Types.ObjectId(userID) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Payout', payoutSchema);
