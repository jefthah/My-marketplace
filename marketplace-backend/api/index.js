const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://localhost:3000',
      'https://my-marketplace-dx.vercel.app',
      /https:\/\/.*\.vercel\.app$/
    ];
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With']
}));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Marketplace Backend API is running!',
    version: '3.0.0-database-integrated',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    routesLoaded: true,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    mongoUriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'not set',
    routesLoaded: 'synchronously'
  });
});

// Load routes directly
try {
  // Connect to database with serverless-friendly settings
  const mongoose = require('mongoose');
  
  // Configure mongoose for serverless
  mongoose.set('bufferCommands', false);
  mongoose.set('bufferMaxEntries', 0);
  
  const connectDB = async () => {
    if (mongoose.connections[0].readyState) {
      console.log('✅ Database already connected');
      return;
    }
    
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        maxPoolSize: 10, // Maintain up to 10 socket connections
        minPoolSize: 5, // Maintain at least 5 socket connections
        maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0 // Disable mongoose buffering
      });
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('⚠️ Database connection failed:', error.message);
      throw error;
    }
  };
  
  // Connect immediately
  connectDB().catch(err => {
    console.error('Database initialization failed:', err.message);
  });

  // Create custom login endpoint with detailed error logging
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔍 Login attempt for:', email);
      
      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password diperlukan'
        });
      }
      
      // Ensure database connection
      await connectDB();
      console.log('✅ Database connection ensured');
      
      // Try to load User model
      const User = require('../src/models/user');
      console.log('✅ User model loaded');
      
      // Find user with timeout
      const user = await User.findOne({ email }).select('+password').maxTimeMS(10000);
      console.log('🔍 User found:', user ? 'Yes' : 'No');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials - user not found'
        });
      }
      
      // Check password
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('🔍 Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials - wrong password'
        });
      }
      
      // Generate JWT
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      
      console.log('✅ Login successful for:', email);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Login error:', error.message);
      console.error('❌ Stack:', error.stack);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
        details: 'Check server logs for more information'
      });
    }
  });
  
  console.log('✅ Custom login endpoint created');
  
  // Debug endpoint to list users in database
  app.get('/api/debug/users', async (req, res) => {
    try {
      await connectDB();
      const User = require('../src/models/user');
      
      const users = await User.find({}, 'email username role').limit(10);
      
      res.json({
        success: true,
        message: 'Users in database',
        count: users.length,
        users: users.map(user => ({
          email: user.email,
          username: user.username,
          role: user.role
        }))
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
  });

  // Load other routes
  const routes = [
    { path: '/api/products', module: '../src/routes/productRoutes', name: 'Product' },
    { path: '/api/orders', module: '../src/routes/orderRoutes', name: 'Order' },
    { path: '/api/cart', module: '../src/routes/cartRoutes', name: 'Cart' },
    { path: '/api/payments', module: '../src/routes/paymentRoutes', name: 'Payment' },
    { path: '/api/payouts', module: '../src/routes/payoutRoutes', name: 'Payout' },
    { path: '/api/favorites', module: '../src/routes/favoriteRoutes', name: 'Favorite' },
    { path: '/api/reviews', module: '../src/routes/reviewRoutes', name: 'Review' }
  ];

  routes.forEach(route => {
    try {
      const routeModule = require(route.module);
      app.use(route.path, routeModule);
      console.log(`✅ ${route.name} routes loaded`);
    } catch (err) {
      console.warn(`⚠️ ${route.name} routes failed:`, err.message);
    }
  });

  console.log('✅ All routes loaded successfully');

} catch (error) {
  console.error('❌ Route loading failed:', error.message);
  
  // Fallback login endpoint
  app.post('/api/auth/login', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Authentication service temporarily unavailable',
      error: error.message
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/me',
      'GET /api/products'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Export for Vercel
module.exports = app;
