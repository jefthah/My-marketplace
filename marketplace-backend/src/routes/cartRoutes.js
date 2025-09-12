const express = require('express');
const {
  addToCart,
  getCartItems,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartCount
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { validateAddToCart, validateUpdateCart } = require('../middleware/validation');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Cart routes
router.route('/')
  .get(getCartItems)           // GET /api/cart - Get all cart items
  .post(validateAddToCart, addToCart)  // POST /api/cart - Add item to cart
  .delete(clearCart);          // DELETE /api/cart - Clear all cart items

router.get('/count', getCartCount);  // GET /api/cart/count - Get cart count

router.route('/:productID')
  .put(validateUpdateCart, updateCartItem)   // PUT /api/cart/:productID - Update quantity
  .delete(removeCartItem);                   // DELETE /api/cart/:productID - Remove item

module.exports = router;
