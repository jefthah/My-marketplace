const express = require('express');
const {
  createOrder,
  createOrderFromCart,
  getUserOrders,
  getOrder,
  getGuestOrder,
  updateOrderStatus,
  getOrderStats,
  getAllOrders,
  adminUpdateOrderStatus,
  createInstantOrder,
  downloadOrderFile,
  getOrderDownloadUrl
} = require('../controllers/orderController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateCreateOrder,
  validateCreateOrderFromCart,
  validateUpdateOrderStatus
} = require('../middleware/validation');

const router = express.Router();

// Public routes (no authentication required) - MUST be before generic /:id routes
router.get('/guest/:id', getGuestOrder);                 // GET /api/orders/guest/:id - Get guest order
router.post('/instant', createInstantOrder);             // POST /api/orders/instant - Create instant order
router.get('/:id/download-url', getOrderDownloadUrl);    // GET /api/orders/:id/download-url - Get download URL
router.get('/:id/download', downloadOrderFile);          // GET /api/orders/:id/download - Download order file (public)
router.get('/:id', optionalAuth, getOrder);              // GET /api/orders/:id - Get single order (supports both guest and user orders)

// All other order routes require authentication
router.use(protect);

// User order routes
router.route('/')
  .get(getUserOrders)                                    // GET /api/orders - Get user's orders
  .post(validateCreateOrder, createOrder);               // POST /api/orders - Create new order

router.post('/from-cart', validateCreateOrderFromCart, createOrderFromCart);  // POST /api/orders/from-cart - Create orders from cart

router.get('/stats', getOrderStats);                     // GET /api/orders/stats - Get order statistics

router.put('/:id/status', validateUpdateOrderStatus, updateOrderStatus);  // PUT /api/orders/:id/status - Update order status (user)

// ===== ADMIN ROUTES =====
router.use(authorize('admin')); // Only admin can access these routes

router.get('/admin/all', getAllOrders);                  // GET /api/orders/admin/all - Get all orders (admin)

router.put('/admin/:id/status', adminUpdateOrderStatus); // PUT /api/orders/admin/:id/status - Update order status (admin)

module.exports = router;
