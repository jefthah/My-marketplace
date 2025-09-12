// marketplace-backend/src/middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError'); // Fixed import

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ApiError('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = await User.findById(decoded.id).populate('roleID');
    
    if (!req.user) {
      return next(new ApiError('User not found', 404));
    }

    next();
  } catch (err) {
    return next(new ApiError('Not authorized to access this route', 401));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roleID.roleName)) {
      return next(
        new ApiError(
          `User role ${req.user.roleID.roleName} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Optional authentication - sets req.user if token exists, but doesn't require it
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token, continue without setting req.user
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = await User.findById(decoded.id).populate('roleID');
    
    if (!req.user) {
      // Token is invalid, but we don't error out - just continue without user
      return next();
    }

    next();
  } catch (err) {
    // Token is invalid, but we don't error out - just continue without user
    next();
  }
});