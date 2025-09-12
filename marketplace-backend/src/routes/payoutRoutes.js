const express = require('express');
const router = express.Router();
const {
  getUserHistory,
  getUserStats,
  getPurchaseDetail,
  downloadProduct,
  requestRefund
} = require('../controllers/payoutController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// @desc    Get user purchase history
// @route   GET /api/payouts/history
// @access  Private
router.get('/history', getUserHistory);

// @desc    Get user purchase statistics
// @route   GET /api/payouts/stats
// @access  Private
router.get('/stats', getUserStats);

// @desc    Get single purchase detail
// @route   GET /api/payouts/:transactionID
// @access  Private
router.get('/:transactionID', getPurchaseDetail);

// @desc    Download purchased product
// @route   GET /api/payouts/:transactionID/download
// @access  Private
router.get('/:transactionID/download', downloadProduct);

// @desc    Request refund
// @route   POST /api/payouts/:transactionID/refund
// @access  Private
router.post('/:transactionID/refund', requestRefund);

module.exports = router;
