const Cart = require('../models/cart');
const Product = require('../models/product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private (User login required)
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productID, quantity = 1 } = req.body;
  const userID = req.user._id;

  // Check if product exists
  const product = await Product.findById(productID);
  if (!product) {
    return next(new ApiError('Product not found', 404));
  }

  // Check if item already exists in cart
  let cartItem = await Cart.findOne({ userID, productID });

  if (cartItem) {
    // Update quantity if item exists
    cartItem.quantity += parseInt(quantity);
    cartItem.updatedAt = new Date();
    await cartItem.save();
  } else {
    // Create new cart item
    cartItem = await Cart.create({
      userID,
      productID,
      quantity: parseInt(quantity)
    });
  }

  // Populate product details
  await cartItem.populate('productID', 'title price images category');

  res.status(201).json(
    new ApiResponse(201, cartItem, 'Item added to cart successfully')
  );
});

// @desc    Get user's cart items
// @route   GET /api/cart
// @access  Private (User login required)
exports.getCartItems = asyncHandler(async (req, res) => {
  const userID = req.user._id;

  const cartItems = await Cart.find({ userID })
    .populate('productID', 'title price images category description')
    .sort({ addedAt: -1 });

  // Calculate total cart value
  const totalItems = cartItems.length;
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    if (item.productID && item.productID.price) {
      return sum + (item.quantity * item.productID.price);
    }
    return sum;
  }, 0);

  res.json(
    new ApiResponse(200, {
      cartItems,
      summary: {
        totalItems,
        totalQuantity,
        totalPrice
      }
    }, 'Cart items retrieved successfully')
  );
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productID
// @access  Private (User login required)
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { productID } = req.params;
  const { quantity } = req.body;
  const userID = req.user._id;

  if (!quantity || quantity < 1) {
    return next(new ApiError('Quantity must be at least 1', 400));
  }

  const cartItem = await Cart.findOne({ userID, productID });
  if (!cartItem) {
    return next(new ApiError('Cart item not found', 404));
  }

  cartItem.quantity = parseInt(quantity);
  cartItem.updatedAt = new Date();
  await cartItem.save();

  await cartItem.populate('productID', 'title price images category');

  res.json(
    new ApiResponse(200, cartItem, 'Cart item updated successfully')
  );
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productID
// @access  Private (User login required)
exports.removeCartItem = asyncHandler(async (req, res, next) => {
  const { productID } = req.params;
  const userID = req.user._id;

  const cartItem = await Cart.findOneAndDelete({ userID, productID });
  if (!cartItem) {
    return next(new ApiError('Cart item not found', 404));
  }

  res.json(
    new ApiResponse(200, {}, 'Item removed from cart successfully')
  );
});

// @desc    Clear all cart items
// @route   DELETE /api/cart
// @access  Private (User login required)
exports.clearCart = asyncHandler(async (req, res) => {
  const userID = req.user._id;

  await Cart.deleteMany({ userID });

  res.json(
    new ApiResponse(200, {}, 'Cart cleared successfully')
  );
});

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private (User login required)
exports.getCartCount = asyncHandler(async (req, res) => {
  const userID = req.user._id;

  const totalItems = await Cart.countDocuments({ userID });
  const cartItems = await Cart.find({ userID });
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  res.json(
    new ApiResponse(200, {
      totalItems,
      totalQuantity
    }, 'Cart count retrieved successfully')
  );
});
