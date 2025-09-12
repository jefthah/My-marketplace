const Payout = require('../models/payout');
const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const mongoose = require('mongoose');

// @desc    Get user purchase history
// @route   GET /api/payouts/history
// @access  Private
const getUserHistory = asyncHandler(async (req, res, next) => {
  const userID = req.user.id;
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;

  // Build query
  const query = { userID };
  
  if (status) {
    query.status = status;
  }
  
  if (startDate || endDate) {
    query.purchaseDate = {};
    if (startDate) query.purchaseDate.$gte = new Date(startDate);
    if (endDate) query.purchaseDate.$lte = new Date(endDate);
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get total count
  const totalCount = await Payout.countDocuments(query);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  // Get purchase history
  const purchases = await Payout.find(query)
    .populate('orderID', 'status createdAt customerInfo')
    .populate('paymentID', 'paymentMethod paymentStatus transactionTime')
    .populate('productID', 'title price category images description')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json(new ApiResponse(200, {
    purchases,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalCount,
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1
    }
  }, 'Purchase history retrieved successfully'));
});

// @desc    Get user purchase statistics
// @route   GET /api/payouts/stats
// @access  Private
const getUserStats = asyncHandler(async (req, res, next) => {
  const userID = req.user.id;

  // Get basic stats
  const stats = await Payout.aggregate([
    { $match: { userID: new mongoose.Types.ObjectId(userID) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  // Get monthly spending
  const monthlySpending = await Payout.aggregate([
    { 
      $match: { 
        userID: new mongoose.Types.ObjectId(userID),
        status: 'completed',
        purchaseDate: {
          $gte: new Date(new Date().getFullYear(), 0, 1) // This year
        }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$purchaseDate' },
          year: { $year: '$purchaseDate' }
        },
        totalSpent: { $sum: '$amount' },
        purchaseCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Get favorite categories
  const favoriteCategories = await Payout.aggregate([
    { 
      $match: { 
        userID: new mongoose.Types.ObjectId(userID),
        status: 'completed'
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productID',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$product.category',
        count: { $sum: 1 },
        totalSpent: { $sum: '$amount' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Format response
  const formattedStats = {
    overview: stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
      return acc;
    }, {}),
    monthlySpending,
    favoriteCategories,
    totalPurchases: stats.reduce((sum, stat) => sum + stat.count, 0),
    totalSpent: stats.reduce((sum, stat) => sum + stat.totalAmount, 0)
  };

  res.status(200).json(new ApiResponse(200, formattedStats, 'User statistics retrieved successfully'));
});

// @desc    Get single purchase detail
// @route   GET /api/payouts/:transactionID
// @access  Private
const getPurchaseDetail = asyncHandler(async (req, res, next) => {
  const { transactionID } = req.params;
  const userID = req.user.id;

  const purchase = await Payout.findOne({ 
    transactionID, 
    userID 
  })
    .populate('orderID', 'status createdAt customerInfo')
    .populate('paymentID', 'paymentMethod paymentStatus transactionTime')
    .populate('productID', 'title price category images description');

  if (!purchase) {
    return next(new ApiError('Purchase not found', 404));
  }

  res.status(200).json(new ApiResponse(200, purchase, 'Purchase detail retrieved successfully'));
});

// @desc    Download purchased product
// @route   GET /api/payouts/:transactionID/download
// @access  Private
const downloadProduct = asyncHandler(async (req, res, next) => {
  const { transactionID } = req.params;
  const userID = req.user.id;

  const purchase = await Payout.findOne({ 
    transactionID, 
    userID,
    status: 'completed'
  }).populate('productID');

  if (!purchase) {
    return next(new ApiError('Purchase not found or not completed', 404));
  }

  // Check if download links exist and not expired
  const validDownloadLinks = purchase.downloadLinks.filter(link => 
    !link.expiresAt || link.expiresAt > new Date()
  );

  if (validDownloadLinks.length === 0) {
    return next(new ApiError('Download links have expired or not available', 410));
  }

  // Increment download count
  validDownloadLinks.forEach(link => {
    link.downloadCount += 1;
  });
  await purchase.save();

  res.status(200).json(new ApiResponse(200, {
    downloadLinks: validDownloadLinks,
    productInfo: {
      title: purchase.productID.title,
      description: purchase.productID.description
    }
  }, 'Download links retrieved successfully'));
});

// @desc    Request refund
// @route   POST /api/payouts/:transactionID/refund
// @access  Private
const requestRefund = asyncHandler(async (req, res, next) => {
  const { transactionID } = req.params;
  const { reason } = req.body;
  const userID = req.user.id;

  if (!reason) {
    return next(new ApiError('Refund reason is required', 400));
  }

  const purchase = await Payout.findOne({ 
    transactionID, 
    userID,
    status: 'completed'
  });

  if (!purchase) {
    return next(new ApiError('Purchase not found or not eligible for refund', 404));
  }

  if (purchase.refund.isRefunded) {
    return next(new ApiError('This purchase has already been refunded', 400));
  }

  // Check if refund is still allowed (e.g., within 7 days)
  const daysSincePurchase = Math.floor((new Date() - purchase.completedAt) / (1000 * 60 * 60 * 24));
  if (daysSincePurchase > 7) {
    return next(new ApiError('Refund period has expired (7 days limit)', 400));
  }

  // Update refund status
  purchase.refund.refundReason = reason;
  purchase.refund.refundDate = new Date();
  purchase.status = 'refund_requested';
  
  await purchase.save();

  res.status(200).json(new ApiResponse(200, {
    transactionID,
    refundStatus: 'requested',
    refundReason: reason
  }, 'Refund request submitted successfully'));
});

module.exports = {
  getUserHistory,
  getUserStats,
  getPurchaseDetail,
  downloadProduct,
  requestRefund
};
