const express = require('express');
const {
  // Public routes
  getProducts,
  getProduct,
  getProductsByCategory,
  
  // Admin routes
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  getAdminProducts,
  getProductStats,
  removeProductImages
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');
const { validateProduct, validateProductUpdate } = require('../middleware/validation');
const { uploadProductImages, uploadProductWithSourceCode } = require('../middleware/upload');

const router = express.Router();

// ===== PUBLIC ROUTES =====
router.get('/', getProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProduct);

// ===== PROTECTED ROUTES (Admin only) =====
router.use(protect);
router.use(authorize('admin')); // Only admin can access these routes

// Admin product management
router.get('/admin/my-products', getAdminProducts);
router.get('/admin/stats', getProductStats);

router.post('/', uploadProductWithSourceCode, validateProduct, createProduct);
router.put('/:id', uploadProductImages, validateProductUpdate, updateProduct);
router.delete('/:id', deleteProduct); // Soft delete
router.delete('/:id/hard', hardDeleteProduct); // Hard delete
router.patch('/:id/remove-images', removeProductImages);

module.exports = router;