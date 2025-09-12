// marketplace-backend/src/middleware/validation.js

const { body, validationResult, param } = require('express-validator');
const ApiError = require('../utils/apiError');

// Middleware to handle validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array().map(error => error.msg).join(', ');
    return next(new ApiError(errorMessage, 400));
  }
  next();
};

// Register validation
exports.validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Name must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_\s]+$/)
    .withMessage('Name can only contain letters, numbers, underscores, and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidation
];

// Login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidation
];

// Forgot password validation
exports.validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidation
];

// Reset password validation
exports.validateResetPassword = [
  param('resetToken')
    .isLength({ min: 1 })
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  handleValidation
];

// Product validation for create
exports.validateProduct = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product title must be between 1 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),
  
  body('category')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  
  body('benefit1')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Benefit 1 is required and must be between 1 and 100 characters'),
  
  body('benefit2')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Benefit 2 is required and must be between 1 and 100 characters'),
  
  body('benefit3')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Benefit 3 is required and must be between 1 and 100 characters'),
  
  body('videoUrl')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        return /^https?:\/\/.+/.test(value); // Simple URL validation
      }
      if (Array.isArray(value)) {
        return value.every(url => typeof url === 'string' && /^https?:\/\/.+/.test(url));
      }
      return false;
    })
    .withMessage('Video URLs must be valid HTTP/HTTPS URLs'),
  
  handleValidation
];

// Product validation for update (all fields optional)
exports.validateProductUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product title must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),
  
  body('category')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  
  body('benefit1')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Benefit 1 must be between 1 and 100 characters'),
  
  body('benefit2')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Benefit 2 must be between 1 and 100 characters'),
  
  body('benefit3')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Benefit 3 must be between 1 and 100 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('videoUrl')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        return /^https?:\/\/.+/.test(value);
      }
      if (Array.isArray(value)) {
        return value.every(url => typeof url === 'string' && /^https?:\/\/.+/.test(url));
      }
      return false;
    })
    .withMessage('Video URLs must be valid HTTP/HTTPS URLs'),
  
  handleValidation
];

// Validation for removing images
exports.validateRemoveImages = [
  body('imageUrls')
    .isArray({ min: 1 })
    .withMessage('Please provide at least one image URL to remove')
    .custom((value) => {
      return value.every(url => typeof url === 'string' && url.trim().length > 0);
    })
    .withMessage('All image URLs must be valid strings'),
  
  handleValidation
];

// Cart validation for add to cart
exports.validateAddToCart = [
  body('productID')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 999 })
    .withMessage('Quantity must be a number between 1 and 999'),
  
  handleValidation
];

// Cart validation for update quantity
exports.validateUpdateCart = [
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 999 })
    .withMessage('Quantity must be a number between 1 and 999'),
  
  handleValidation
];

// Order validation for create order
exports.validateCreateOrder = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 999 })
    .withMessage('Quantity must be a number between 1 and 999'),
  
  body('unitPrice')
    .notEmpty()
    .withMessage('Unit price is required')
    .isNumeric()
    .withMessage('Unit price must be a number'),
  
  body('shippingAddress')
    .optional()
    .isObject()
    .withMessage('Shipping address must be an object'),
  
  body('shippingAddress.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street cannot exceed 200 characters'),
  
  body('shippingAddress.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  handleValidation
];

// Order validation for create order from cart
exports.validateCreateOrderFromCart = [
  // No validation needed for from-cart endpoint
  // It will use existing cart data from database
  handleValidation
];

// Order validation for update status
exports.validateUpdateOrderStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['cancelled'])
    .withMessage('Only cancellation is allowed for users'),
  
  handleValidation
];

// Payment validation for create payment
exports.validateCreatePayment = [
  body('orderID')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID format'),
  
  body('paymentMethod')
    .optional()
    .isIn(['midtrans', 'credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'cod', 'paypal', 'stripe'])
    .withMessage('Invalid payment method'),
  
  handleValidation
];

// Payment validation for update status
exports.validateUpdatePaymentStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['cancelled'])
    .withMessage('Only cancellation is allowed for users'),
  
  handleValidation
];

// Payment validation for upload proof
exports.validateUploadPaymentProof = [
  body('paymentProof')
    .notEmpty()
    .withMessage('Payment proof is required')
    .isURL()
    .withMessage('Payment proof must be a valid URL'),
  
  handleValidation
];