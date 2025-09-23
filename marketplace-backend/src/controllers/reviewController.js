const Review = require('../models/review');
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const mongoose = require('mongoose');

// Membuat ulasan baru
const createReview = async (req, res) => {
  try {
    const { rating, comment, product_id, order_id } = req.body;
    const user_id = req.user.id;

    // Validasi input
    if (!rating || !product_id || !order_id) {
      return res.status(400).json({
        success: false,
        message: 'Rating, product_id, dan order_id wajib diisi'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus antara 1-5'
      });
    }

    // Cek apakah user sudah pernah review produk dari order ini
    const existingReview = await Review.findOne({
      user_id: user_id,
      product_id: product_id,
      order_id: order_id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah memberikan ulasan untuk produk ini'
      });
    }

    // Cek apakah order milik user dan statusnya confirmed
    const order = await Order.findOne({
      _id: order_id,
      userID: user_id,
      status: 'confirmed'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan atau belum confirmed'
      });
    }

    // Cek apakah produk sesuai dengan order
    const productInOrder = order.productID.toString() === product_id;

    if (!productInOrder) {
      return res.status(400).json({
        success: false,
        message: 'Produk tidak ditemukan dalam order ini'
      });
    }

    // Buat review baru
    const newReview = new Review({
      rating,
      comment: comment || '',
      user_id,
      product_id,
      order_id
    });

    await newReview.save();

    // Populate data untuk response
    const populatedReview = await Review.findById(newReview._id)
      .populate('user_id', 'username photo')
      .populate('product_id', 'title');

    // Transform photo to profileImage
    let transformedReview = populatedReview.toObject();
    if (transformedReview.user_id.photo) {
      const base64Photo = transformedReview.user_id.photo.toString('base64');
      transformedReview.user_id.profileImage = `data:image/jpeg;base64,${base64Photo}`;
      delete transformedReview.user_id.photo;
    }

    res.status(201).json({
      success: true,
      message: 'Ulasan berhasil dibuat',
      data: transformedReview
    });

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat ulasan',
      error: error.message
    });
  }
};

// Cek apakah user sudah memberikan ulasan untuk produk tertentu
const hasUserReviewedProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;

    console.log('=== CHECK USER HAS REVIEWED ===');
    console.log('Product ID:', product_id);
    console.log('User ID:', user_id);

    const existingReview = await Review.findOne({
      user_id: user_id,
      product_id: product_id
    }).populate('user_id', 'username');

    console.log('Existing review found:', existingReview ? 'YES' : 'NO');

    res.json({
      success: true,
      hasReviewed: !!existingReview,
      review: existingReview || null
    });

  } catch (error) {
    console.error('Error checking user review:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengecek ulasan',
      error: error.message
    });
  }
};

// Mendapatkan semua ulasan (untuk halaman reviews umum)
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = '-createdAt' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({})
      .populate('user_id', 'username photo')
      .populate('product_id', 'title images price')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Transform photo buffer to base64 for user profile images
    const transformedReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      // Safeguard when user document missing or without photo
      if (reviewObj.user_id && reviewObj.user_id.photo) {
        try {
          reviewObj.user_id.profileImage = `data:image/jpeg;base64,${reviewObj.user_id.photo.toString('base64')}`;
        } catch (_) {
          reviewObj.user_id.profileImage = null;
        }
        delete reviewObj.user_id.photo;
      } else if (reviewObj.user_id) {
        reviewObj.user_id.profileImage = null;
      }
      return reviewObj;
    });

    const total = await Review.countDocuments({});
    const totalPages = Math.ceil(total / limitNum);

    // Hitung statistik rating
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
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

    res.json({
      success: true,
      data: {
        reviews: transformedReviews,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          limit: limitNum
        },
        statistics: stats[0] || {
          averageRating: 0,
          totalReviews: 0,
          rating5: 0,
          rating4: 0,
          rating3: 0,
          rating2: 0,
          rating1: 0
        }
      }
    });

  } catch (error) {
    console.error('Error getting all reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil ulasan',
      error: error.message
    });
  }
};

// Mendapatkan semua ulasan untuk produk tertentu
const getReviewsByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ product_id })
      .populate('user_id', 'username photo')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Transform reviews to include profileImage
    const transformedReviews = reviews.map(review => {
      let profileImage = null;
      const userDoc = review.user_id;
      if (userDoc && userDoc.photo) {
        try {
          const base64Photo = userDoc.photo.toString('base64');
          profileImage = `data:image/jpeg;base64,${base64Photo}`;
        } catch (_) {
          profileImage = null;
        }
      }

      const safeUser = userDoc ? userDoc.toObject() : { username: 'Unknown User' };
      return {
        ...review.toObject(),
        user_id: {
          ...safeUser,
          profileImage,
          photo: undefined
        }
      };
    });

    const total = await Review.countDocuments({ product_id });
    const totalPages = Math.ceil(total / limitNum);

    // Calculate review statistics
    const ratingStats = await Review.aggregate([
      { $match: { product_id: new mongoose.Types.ObjectId(product_id) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const statistics = ratingStats.length > 0 ? {
      averageRating: Math.round(ratingStats[0].averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: ratingStats[0].totalReviews
    } : {
      averageRating: 0,
      totalReviews: 0
    };

    res.json({
      success: true,
      data: {
        reviews: transformedReviews,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          limit: limitNum
        },
        statistics
      }
    });

  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil ulasan',
      error: error.message
    });
  }
};

// Mendapatkan semua ulasan dari user yang sedang login
const getReviewsByUser = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ user_id })
      .populate('product_id', 'title images')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({ user_id });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error getting user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil ulasan user',
      error: error.message
    });
  }
};

// Update ulasan
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    // Validasi rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus antara 1-5'
      });
    }

    // Cek apakah review milik user
    const review = await Review.findOne({ _id: id, user_id });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Ulasan tidak ditemukan atau bukan milik Anda'
      });
    }

    // Update review
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    review.updatedAt = new Date();

    await review.save();

    const updatedReview = await Review.findById(id)
      .populate('user_id', 'username')
      .populate('product_id', 'title');

    res.json({
      success: true,
      message: 'Ulasan berhasil diupdate',
      data: updatedReview
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengupdate ulasan',
      error: error.message
    });
  }
};

// Hapus ulasan
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Cek apakah review milik user
    const review = await Review.findOne({ _id: id, user_id });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Ulasan tidak ditemukan atau bukan milik Anda'
      });
    }

    await Review.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Ulasan berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus ulasan',
      error: error.message
    });
  }
};

// Mark ulasan sebagai helpful
const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Ulasan tidak ditemukan'
      });
    }

    // Cek apakah user sudah pernah mark helpful
    const hasMarked = review.helpful_users && review.helpful_users.includes(user_id);

    if (hasMarked) {
      // Remove helpful mark
      review.helpful_users = review.helpful_users.filter(
        userId => userId.toString() !== user_id
      );
      review.helpful_count = Math.max(0, (review.helpful_count || 0) - 1);
    } else {
      // Add helpful mark
      if (!review.helpful_users) review.helpful_users = [];
      review.helpful_users.push(user_id);
      review.helpful_count = (review.helpful_count || 0) + 1;
    }

    await review.save();

    res.json({
      success: true,
      message: hasMarked ? 'Helpful mark removed' : 'Marked as helpful',
      data: {
        helpful_count: review.helpful_count,
        user_marked: !hasMarked
      }
    });

  } catch (error) {
    console.error('Error marking helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat marking helpful',
      error: error.message
    });
  }
};

// Cek apakah user bisa memberikan ulasan
const canUserReview = async (req, res) => {
  try {
    const { product_id, order_id } = req.params;
    const user_id = req.user.id;

    console.log('=== CAN USER REVIEW CHECK ===');
    console.log('Product ID:', product_id);
    console.log('Order ID:', order_id);
    console.log('User ID:', user_id);

    // Cek apakah order milik user dan statusnya confirmed
    const order = await Order.findOne({
      _id: order_id,
      userID: user_id,
      status: 'confirmed'
    });

    console.log('Order found:', order ? 'YES' : 'NO');
    if (order) {
      console.log('Order status:', order.status);
      console.log('Order userID:', order.userID);
      console.log('Order productID:', order.productID);
      console.log('Expected productID:', product_id);
    }

    if (!order) {
      console.log('❌ CANNOT REVIEW: Order not found or not confirmed');
      return res.json({
        success: true,
        canReview: false,
        reason: 'Order tidak ditemukan atau belum confirmed'
      });
    }

    // Cek apakah produk sesuai dengan order
    const productInOrder = order.productID.toString() === product_id;

    console.log('Product in order:', productInOrder ? 'YES' : 'NO');

    if (!productInOrder) {
      console.log('❌ CANNOT REVIEW: Product not in order');
      return res.json({
        success: true,
        canReview: false,
        reason: 'Produk tidak ditemukan dalam order ini'
      });
    }

    // Cek apakah user sudah pernah review produk dari order ini
    const existingReview = await Review.findOne({
      user_id: user_id,
      product_id: product_id,
      order_id: order_id
    });

    console.log('Existing review:', existingReview ? 'YES' : 'NO');

    if (existingReview) {
      console.log('❌ CANNOT REVIEW: Already reviewed');
      return res.json({
        success: true,
        canReview: false,
        reason: 'Anda sudah memberikan ulasan untuk produk ini',
        existingReview: existingReview
      });
    }

    console.log('✅ CAN REVIEW: All checks passed');
    res.json({
      success: true,
      canReview: true,
      reason: 'Anda dapat memberikan ulasan untuk produk ini'
    });

  } catch (error) {
    console.error('Error checking review permission:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengecek permission',
      error: error.message
    });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewsByProduct,
  getReviewsByUser,
  updateReview,
  deleteReview,
  markHelpful,
  canUserReview,
  hasUserReviewedProduct
};
