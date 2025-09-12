const User = require('../models/user');
const Role = require('../models/role');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const emailService = require('../services/emailService');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Register user (role otomatis 'user')
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, address } = req.body;
  
  // Use name as username
  const username = name;

  // Check if user exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    return next(new ApiError('User already exists', 400));
  }

  // Get user role (otomatis)
  const userRole = await Role.findOne({ roleName: 'user' });
  if (!userRole) {
    return next(new ApiError('User role not found in database', 500));
  }

  // Prepare user data
  const userData = {
    username,
    email,
    password,
    roleID: userRole._id
  };

  // Add optional fields
  if (phone) userData.phone = phone;
  if (address) userData.address = address;

  // Add photo if uploaded
  if (req.file) {
    userData.photo = req.file.buffer;
  }

  // Create user
  const user = await User.create(userData);

  sendTokenResponse(user, 201, res, req);
});

// Login user
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ApiError('Please provide an email and password', 400));
  }

  // Check for user and populate role
  const user = await User.findOne({ email }).select('+password').populate('roleID', 'roleName');

  if (!user) {
    return next(new ApiError('Invalid credentials', 401));
  }

  // Check if password matches
  const isPasswordMatched = await user.matchPassword(password);

  if (!isPasswordMatched) {
    return next(new ApiError('Invalid credentials', 401));
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, req);
});

// Get current logged in user
exports.getMe = asyncHandler(async (req, res, next) => {
  // req.user is set in protect middleware
  const user = await User.findById(req.user.id).populate('roleID', 'roleName');
  
  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  // Create photo URL if photo exists
  let photoUrl = null;
  if (user.photo) {
    const base64Photo = user.photo.toString('base64');
    photoUrl = `data:image/jpeg;base64,${base64Photo}`;
  }

  res.status(200).json(
    new ApiResponse(200, {
      _id: user._id,
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      role: user.roleID?.roleName || 'user',
      profileImage: photoUrl,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }, 'User retrieved successfully')
  );
});

// Forgot password - Send reset email
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ApiError('Please provide an email address', 400));
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError('No user found with this email address', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL}/api/auth/reset-password/${resetToken}`;

  try {
    // Send email
    await emailService.sendResetPasswordEmail(user.email, resetUrl, user.username);

    res.status(200).json(
      new ApiResponse(200, {}, 'Password reset email sent successfully')
    );
  } catch (error) {
    console.log(error);

    // Clear reset fields if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ApiError('Email could not be sent', 500));
  }
});

// Reset password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const { resetToken } = req.params;

  if (!password || !confirmPassword) {
    return next(new ApiError('Please provide password and confirm password', 400));
  }

  if (password !== confirmPassword) {
    return next(new ApiError('Passwords do not match', 400));
  }

  if (password.length < 6) {
    return next(new ApiError('Password must be at least 6 characters', 400));
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ApiError('Invalid or expired reset token', 400));
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res, req);
});

// Logout
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
});

// Get current logged in user
exports.getMe = asyncHandler(async (req, res, next) => {
  console.log('=== GET ME REQUEST ===');
  console.log('User ID:', req.user.id);
  
  const user = await User.findById(req.user.id).populate('roleID');
  
  console.log('User found:', {
    username: user.username,
    email: user.email,
    phone: user.phone,
    address: user.address,
    bio: user.bio,
    hasPhoto: !!user.photo
  });

  // Create photo URL if photo exists
  let photoUrl = null;
  if (user.photo) {
    const base64Photo = user.photo.toString('base64');
    photoUrl = `data:image/jpeg;base64,${base64Photo}`;
  }

  const userData = {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.roleID?.roleName,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      profileImage: photoUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  };

  console.log('Response data:', userData);
  res.status(200).json(new ApiResponse(200, userData));
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, req) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Create photo URL if photo exists
  let photoUrl = null;
  if (user.photo) {
    // Convert buffer to base64 data URL to avoid CORS issues
    const base64Photo = user.photo.toString('base64');
    photoUrl = `data:image/jpeg;base64,${base64Photo}`;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json(
      new ApiResponse(statusCode, {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.roleID?.roleName,
          photoUrl: photoUrl
        }
      })
    );
};

// Update user profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, address, bio } = req.body;
  const userId = req.user.id;

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  // Update fields if provided (only update if value is not undefined and different from current)
  if (name !== undefined && name !== null && name !== user.username) {
    // Check if username already exists for different user
    const existingUser = await User.findOne({ username: name, _id: { $ne: userId } });
    if (existingUser) {
      return next(new ApiError('Username already exists', 400));
    }
    user.username = name;
  }
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (bio !== undefined) user.bio = bio;

  // Save updated user
  await user.save();

  // Create photo URL if photo exists
  let photoUrl = null;
  if (user.photo) {
    const base64Photo = user.photo.toString('base64');
    photoUrl = `data:image/jpeg;base64,${base64Photo}`;
  }

  res.status(200).json(
    new ApiResponse(200, {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        profileImage: photoUrl
      }
    }, 'Profile updated successfully')
  );
});

// Upload profile image
exports.uploadProfileImage = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  if (!req.file) {
    return next(new ApiError('Please upload a profile image', 400));
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  // Update user photo
  user.photo = req.file.buffer;
  await user.save();

  // Create photo URL
  const base64Photo = user.photo.toString('base64');
  const photoUrl = `data:image/jpeg;base64,${base64Photo}`;

  res.status(200).json(
    new ApiResponse(200, {
      profileImage: photoUrl
    }, 'Profile image updated successfully')
  );
});

// Update user profile (with optional image upload)
exports.updateProfileComplete = asyncHandler(async (req, res, next) => {
  console.log('=== UPDATE PROFILE COMPLETE ===');
  console.log('Request body:', req.body);
  console.log('File uploaded:', req.file ? 'Yes' : 'No');
  
  const { name, phone, address, bio } = req.body;
  const userId = req.user.id;

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  console.log('User before update:', {
    username: user.username,
    phone: user.phone,
    address: user.address,
    bio: user.bio
  });

  // Update fields if provided
  if (name !== undefined && name !== null && name.trim() !== user.username) {
    // Check if username already exists for different user
    const existingUser = await User.findOne({ username: name.trim(), _id: { $ne: userId } });
    if (existingUser) {
      return next(new ApiError('Username already exists', 400));
    }
    user.username = name.trim();
  }
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (bio !== undefined) user.bio = bio;

  // Update photo if uploaded
  if (req.file) {
    user.photo = req.file.buffer;
  }

  // Save updated user
  await user.save();
  
  console.log('User after update:', {
    username: user.username,
    phone: user.phone,
    address: user.address,
    bio: user.bio
  });

  // Create photo URL if photo exists
  let photoUrl = null;
  if (user.photo) {
    const base64Photo = user.photo.toString('base64');
    photoUrl = `data:image/jpeg;base64,${base64Photo}`;
  }

  res.status(200).json(
    new ApiResponse(200, {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        profileImage: photoUrl
      }
    }, 'Profile updated successfully')
  );
});

// Change password
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Validation
  if (!currentPassword || !newPassword) {
    return next(new ApiError('Current password and new password are required', 400));
  }

  if (newPassword.length < 6) {
    return next(new ApiError('New password must be at least 6 characters', 400));
  }

  // Find user with password field
  const user = await User.findById(userId).select('+password');
  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  // Check current password
  const isCurrentPasswordCorrect = await user.matchPassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    return next(new ApiError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, {}, 'Password changed successfully')
  );
});