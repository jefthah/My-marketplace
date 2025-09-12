const express = require('express');
const {
  registerUser,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  uploadProfileImage,
  changePassword,
  updateProfileComplete
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('../middleware/validation');
const { uploadPhoto } = require('../middleware/upload');
const User = require('../models/user');

const router = express.Router();

// Auth endpoints
router.post('/register', uploadPhoto, validateRegister, registerUser);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password/:resetToken', validateResetPassword, resetPassword);

// Profile management endpoints
router.put('/profile', protect, updateProfile);
router.post('/profile/image', protect, uploadPhoto, uploadProfileImage);
router.put('/profile/complete', protect, uploadPhoto, updateProfileComplete); // New combined endpoint
router.put('/change-password', protect, changePassword);

// Verify token endpoint
router.post('/verify', protect, async (req, res) => {
  try {
    // protect middleware already verified the token and attached user to req.user
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      },
      message: 'Token verified successfully'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
});

// Get user photo
router.get('/photo/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user || !user.photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Set CORS headers for images
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(user.photo);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available roles
router.get('/roles', async (req, res) => {
  try {
    const Role = require('../models/role');
    const roles = await Role.find().select('_id roleName description createdAt');
    
    res.json({
      success: true,
      data: roles,
      message: 'Roles retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving roles',
      error: error.message
    });
  }
});

// Admin: Create user with specific role (admin only)
router.post('/admin/create-user', protect, uploadPhoto, async (req, res) => {
  try {
    // Check if current user is admin
    if (req.user.roleID.roleName !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { username, email, password, roleName } = req.body;

    // Validate required fields
    if (!username || !email || !password || !roleName) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and roleName are required'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Get role
    const Role = require('../models/role');
    const role = await Role.findOne({ roleName });
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Prepare user data
    const userData = {
      username,
      email,
      password,
      roleID: role._id
    };

    // Add photo if uploaded
    if (req.file) {
      userData.photo = req.file.buffer;
    }

    // Create user
    const newUser = await User.create(userData);

    // Create photo URL if photo exists
    const photoUrl = newUser.photo ? 
      `${req.protocol}://${req.get('host')}/api/auth/photo/${newUser._id}` : 
      null;

    res.status(201).json({
      success: true,
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: role.roleName,
        photoUrl: photoUrl,
        createdAt: newUser.createdAt
      },
      message: 'User created successfully by admin'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Get all users (admin only)
router.get('/admin/users', protect, async (req, res) => {
  try {
    // Check if current user is admin
    if (req.user.roleID.roleName !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const users = await User.find().populate('roleID').select('-password');
    
    const usersWithPhotoUrl = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.roleID?.roleName,
      photoUrl: user.photo ? 
        `${req.protocol}://${req.get('host')}/api/auth/photo/${user._id}` : 
        null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json({
      success: true,
      data: usersWithPhotoUrl,
      count: usersWithPhotoUrl.length,
      message: 'Users retrieved successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
});

// Get user by ID (admin only)
router.get('/user/:userId', protect, async (req, res) => {
  try {
    // Check if current user is admin
    if (req.user.roleID.roleName !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const user = await User.findById(req.params.userId).populate('roleID');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create photo URL if photo exists
    const photoUrl = user.photo ? 
      `${req.protocol}://${req.get('host')}/api/auth/photo/${user._id}` : 
      null;

    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.roleID?.roleName,
      photoUrl: photoUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      data: userData,
      message: 'User retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message
    });
  }
});

// Get user photo
router.get('/photo/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.photo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Photo not found' 
      });
    }
    
    // Detect image type from buffer
    const photoBuffer = user.photo;
    let contentType = 'image/jpeg'; // default
    
    // Simple image type detection based on magic bytes
    if (photoBuffer[0] === 0x89 && photoBuffer[1] === 0x50) {
      contentType = 'image/png';
    } else if (photoBuffer[0] === 0xFF && photoBuffer[1] === 0xD8) {
      contentType = 'image/jpeg';
    } else if (photoBuffer[0] === 0x47 && photoBuffer[1] === 0x49) {
      contentType = 'image/gif';
    } else if (photoBuffer[0] === 0x52 && photoBuffer[1] === 0x49) {
      contentType = 'image/webp';
    }
    
    res.set({
      'Content-Type': contentType,
      'Content-Length': photoBuffer.length,
      'Cache-Control': 'public, max-age=86400' // Cache for 1 day
    });
    
    res.send(photoBuffer);
  } catch (error) {
    console.error('Error retrieving photo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving photo',
      error: error.message 
    });
  }
});

module.exports = router;