const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// POST /api/reviews - Membuat ulasan baru
router.post('/', protect, reviewController.createReview);

// GET /api/reviews - Mendapatkan semua ulasan
router.get('/', reviewController.getAllReviews);

// GET /api/reviews/product/:product_id - Mendapatkan semua ulasan untuk produk tertentu
router.get('/product/:product_id', reviewController.getReviewsByProduct);

// GET /api/reviews/user - Mendapatkan semua ulasan dari user yang sedang login
router.get('/user', protect, reviewController.getReviewsByUser);

// GET /api/reviews/can-review/:product_id/:order_id - Cek apakah user bisa memberikan ulasan
router.get('/can-review/:product_id/:order_id', protect, reviewController.canUserReview);

// GET /api/reviews/has-reviewed/:product_id - Cek apakah user sudah memberikan ulasan untuk produk tertentu
router.get('/has-reviewed/:product_id', protect, reviewController.hasUserReviewedProduct);

// PUT /api/reviews/:id - Update ulasan
router.put('/:id', protect, reviewController.updateReview);

// DELETE /api/reviews/:id - Hapus ulasan
router.delete('/:id', protect, reviewController.deleteReview);

// POST /api/reviews/:id/helpful - Mark ulasan sebagai helpful
router.post('/:id/helpful', protect, reviewController.markHelpful);

module.exports = router;
