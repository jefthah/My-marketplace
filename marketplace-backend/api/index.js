const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

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
    version: '2.0.0-standalone',
    buildDate: '2025-09-18T14:30:00Z',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    features: ['standalone-auth', 'direct-endpoints', 'no-db-required']
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running with standalone endpoints',
    version: '2.0.0-standalone',
    buildDate: '2025-09-18T14:30:00Z',
    timestamp: new Date().toISOString(),
    authEndpoints: 'active'
  });
});

// Try to load routes safely - restored original system
try {
  console.log('🔄 Starting route loading process...');
  
  // Connect to database
  try {
    console.log('� Attempting database connection...');
    const connectDB = require('../src/config/database');
    connectDB()
      .then(() => console.log('✅ Database connected successfully'))
      .catch(err => console.warn('⚠️ DB connection failed:', err.message));
  } catch (dbError) {
    console.warn('⚠️ Database module loading failed:', dbError.message);
  }

  // Load routes - restored original system
  console.log('� Loading original authentication routes...');
  
  try {
    const authRoutes = require('../src/routes/authRoutes');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded - using real database authentication');
  } catch (err) {
    console.warn('⚠️ Auth routes failed:', err.message);
  }
  
  try {
    const productRoutes = require('../src/routes/productRoutes');
    app.use('/api/products', productRoutes);
    console.log('✅ Product routes loaded');
  } catch (err) {
    console.warn('⚠️ Product routes failed:', err.message);
  }
  
  try {
    const orderRoutes = require('../src/routes/orderRoutes');
    app.use('/api/orders', orderRoutes);
    console.log('✅ Order routes loaded');
  } catch (err) {
    console.warn('⚠️ Order routes failed:', err.message);
  }
  
  try {
    const paymentRoutes = require('../src/routes/paymentRoutes');
    app.use('/api/payments', paymentRoutes);
    console.log('✅ Payment routes loaded');
  } catch (err) {
    console.warn('⚠️ Payment routes failed:', err.message);
  }
  
  try {
    const cartRoutes = require('../src/routes/cartRoutes');
    app.use('/api/cart', cartRoutes);
    console.log('✅ Cart routes loaded');
  } catch (err) {
    console.warn('⚠️ Cart routes failed:', err.message);
  }
  
  try {
    const payoutRoutes = require('../src/routes/payoutRoutes');
    app.use('/api/payouts', payoutRoutes);
    console.log('✅ Payout routes loaded');
  } catch (err) {
    console.warn('⚠️ Payout routes failed:', err.message);
  }
  
  try {
    const favoriteRoutes = require('../src/routes/favoriteRoutes');
    app.use('/api/favorites', favoriteRoutes);
    console.log('✅ Favorite routes loaded');
  } catch (err) {
    console.warn('⚠️ Favorite routes failed:', err.message);
  }
  
  try {
    const reviewRoutes = require('../src/routes/reviewRoutes');
    app.use('/api/reviews', reviewRoutes);
    console.log('✅ Review routes loaded');
  } catch (err) {
    console.warn('⚠️ Review routes failed:', err.message);
  }

  console.log('✅ Route loading process completed - using original database system');
} catch (error) {
  console.error('❌ Route loading failed completely:', error);
  
  // Only show fallback message if everything fails
  app.post('/api/auth/login', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Authentication service temporarily unavailable - database connection failed',
      note: 'Please check environment variables and database connection'
    });
  });
}

// Products will be handled by the original productRoutes from database

// API info
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Marketplace API endpoints',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    endpoints: {
      // Authentication endpoints
      auth: {
        base: '/api/auth',
        endpoints: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          me: 'GET /api/auth/me',
          forgotPassword: 'POST /api/auth/forgot-password',
          resetPassword: 'PUT /api/auth/reset-password/:resetToken',
          profile: 'PUT /api/auth/profile',
          profileImage: 'POST /api/auth/profile/image',
          changePassword: 'PUT /api/auth/change-password'
        }
      },
      // Product endpoints
      products: {
        base: '/api/products',
        endpoints: {
          getAll: 'GET /api/products',
          getById: 'GET /api/products/:id',
          getByCategory: 'GET /api/products/category/:category',
          create: 'POST /api/products (Admin)',
          update: 'PUT /api/products/:id (Admin)',
          delete: 'DELETE /api/products/:id (Admin)',
          adminProducts: 'GET /api/products/admin/my-products (Admin)',
          stats: 'GET /api/products/admin/stats (Admin)'
        }
      },
      // Cart endpoints
      cart: {
        base: '/api/cart',
        endpoints: {
          getCart: 'GET /api/cart',
          addToCart: 'POST /api/cart',
          updateCart: 'PUT /api/cart/:productID',
          removeFromCart: 'DELETE /api/cart/:productID',
          clearCart: 'DELETE /api/cart',
          getCount: 'GET /api/cart/count'
        }
      },
      // Order endpoints
      orders: {
        base: '/api/orders',
        endpoints: {
          getUserOrders: 'GET /api/orders',
          getOrderById: 'GET /api/orders/:orderId',
          createFromCart: 'POST /api/orders/from-cart',
          createInstant: 'POST /api/orders/instant'
        }
      },
      // Payment endpoints
      payments: {
        base: '/api/payments',
        endpoints: {
          createPayment: 'POST /api/payments',
          getUserPayments: 'GET /api/payments',
          getPaymentById: 'GET /api/payments/:paymentId',
          getInstantPayment: 'GET /api/payments/instant/:paymentId',
          checkStatus: 'GET /api/payments/:paymentId/status',
          createInstant: 'POST /api/payments/instant'
        }
      },
      // Payout endpoints
      payouts: {
        base: '/api/payouts',
        endpoints: {
          getPayouts: 'GET /api/payouts',
          createPayout: 'POST /api/payouts',
          updatePayout: 'PUT /api/payouts/:id'
        }
      },
      // Favorite endpoints
      favorites: {
        base: '/api/favorites',
        endpoints: {
          toggleFavorite: 'POST /api/favorites/toggle/:productId',
          getUserFavorites: 'GET /api/favorites'
        }
      },
      // Review endpoints
      reviews: {
        base: '/api/reviews',
        endpoints: {
          getAllReviews: 'GET /api/reviews',
          getUserReviews: 'GET /api/reviews/user',
          getProductReviews: 'GET /api/reviews/product/:productId',
          createReview: 'POST /api/reviews',
          updateReview: 'PUT /api/reviews/:reviewId',
          deleteReview: 'DELETE /api/reviews/:reviewId',
          markHelpful: 'POST /api/reviews/:reviewId/helpful',
          hasReviewed: 'GET /api/reviews/has-reviewed/:productId',
          canReview: 'GET /api/reviews/can-review/:productId/:orderId'
        }
      }
    },
    documentation: 'See API_DOCUMENTATION.md for detailed request/response examples',
    note: 'This API uses database authentication. Use credentials from your MongoDB Atlas database.',
    databaseCredentials: {
      availableUsers: [
        'admin@jsdesign.com',
        'super.admin@jsdesign.com'
      ],
      note: 'Passwords are hashed in database. Use the original passwords you set when creating these users.'
    }
  });
});

// All endpoints will be handled by original routes with database connection

console.log('✅ API is ready to serve requests with database authentication');

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    suggestion: `Try visiting GET /api to see all available endpoints`,
    quickLinks: {
      apiInfo: 'GET /api',
      health: 'GET /health',
      auth: 'POST /api/auth/login',
      products: 'GET /api/products',
      cart: 'GET /api/cart',
      orders: 'GET /api/orders',
      reviews: 'GET /api/reviews'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;