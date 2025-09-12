const express = require('express');
const {
  createPayment,
  getUserPayments,
  getPayment,
  updatePaymentStatus,
  uploadPaymentProof,
  getPaymentStats,
  getAllPayments,
  adminUpdatePaymentStatus,
  processRefund,
  createInstantPayment,
  retryPayment,
  getOrderFromTransaction,
  checkExpiredPayments
} = require('../controllers/paymentController');
const midtransController = require('../controllers/midtransController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateCreatePayment,
  validateUpdatePaymentStatus,
  validateUploadPaymentProof
} = require('../middleware/validation');

const router = express.Router();

// Public routes (no authentication required)
router.post('/midtrans/notification', midtransController.handleMidtransNotification);  // Midtrans webhook
router.post('/instant', optionalAuth, createInstantPayment);           // POST /api/payments/instant - Create instant payment (supports both guest and user)
router.post('/retry/:orderId', retryPayment);            // POST /api/payments/retry/:orderId - Retry failed payment
router.get('/instant/:id', getPayment);                  // GET /api/payments/instant/:id - Get instant payment (public)
router.get('/transaction/:transactionId', getOrderFromTransaction); // GET /api/payments/transaction/:transactionId - Get order from transaction ID
router.post('/check-expired', checkExpiredPayments);     // POST /api/payments/check-expired - Check expired payments (public)

// All other payment routes require authentication
router.use(protect);

// User payment routes
router.route('/')
  .get(getUserPayments)                                  // GET /api/payments - Get user's payments
  .post(validateCreatePayment, createPayment);           // POST /api/payments - Create new payment

router.get('/stats', getPaymentStats);                   // GET /api/payments/stats - Get payment statistics

router.route('/:id')
  .get(getPayment);                                      // GET /api/payments/:id - Get single payment

router.get('/:id/status', midtransController.checkPaymentStatus);          // GET /api/payments/:id/status - Check payment status from Midtrans

router.put('/:id/status', validateUpdatePaymentStatus, updatePaymentStatus);  // PUT /api/payments/:id/status - Update payment status (user)

router.put('/:id/proof', validateUploadPaymentProof, uploadPaymentProof);     // PUT /api/payments/:id/proof - Upload payment proof

// ===== ADMIN ROUTES =====
router.use(authorize('admin')); // Only admin can access these routes

router.get('/admin/all', getAllPayments);                // GET /api/payments/admin/all - Get all payments (admin)

router.put('/admin/:id/status', adminUpdatePaymentStatus); // PUT /api/payments/admin/:id/status - Update payment status (admin)

router.post('/admin/:id/refund', processRefund);         // POST /api/payments/admin/:id/refund - Process refund (admin)

router.post('/admin/check-expired', checkExpiredPayments); // POST /api/payments/admin/check-expired - Manually check expired payments (admin)

module.exports = router;
