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
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

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
    documentation: 'See API_DOCUMENTATION.md for detailed request/response examples'
  });
});

// Try to load routes safely
try {
  // Connect to database
  const connectDB = require('../src/config/database');
  connectDB().catch(err => console.warn('DB connection failed:', err.message));

  // Load routes
  const authRoutes = require('../src/routes/authRoutes');
  const productRoutes = require('../src/routes/productRoutes');
  const orderRoutes = require('../src/routes/orderRoutes');
  const paymentRoutes = require('../src/routes/paymentRoutes');
  const cartRoutes = require('../src/routes/cartRoutes');
  const payoutRoutes = require('../src/routes/payoutRoutes');
  const favoriteRoutes = require('../src/routes/favoriteRoutes');
  const reviewRoutes = require('../src/routes/reviewRoutes');

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/payouts', payoutRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/reviews', reviewRoutes);

  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.warn('⚠️ Some routes failed to load:', error.message);
  console.error('Route loading error details:', error);
  
  // Fallback API endpoints for testing when main routes fail
  app.get('/api/auth/test', (req, res) => {
    res.json({ 
      success: true, 
      message: 'Auth endpoint working (fallback mode)', 
      service: 'fallback',
      note: 'Main auth routes failed to load'
    });
  });
  
  app.post('/api/auth/login', (req, res) => {
    res.status(503).json({ 
      success: false, 
      message: 'Auth service temporarily unavailable (fallback mode)', 
      service: 'fallback',
      note: 'Please check database connection and route configuration'
    });
  });
  
  app.get('/api/products', (req, res) => {
    res.json({ 
      success: true, 
      message: 'Products endpoint working (fallback mode)', 
      data: [],
      service: 'fallback',
      note: 'Main product routes failed to load'
    });
  });
  
  app.get('/api/cart', (req, res) => {
    res.json({ 
      success: true, 
      message: 'Cart endpoint working (fallback mode)', 
      data: { cartItems: [], summary: { totalItems: 0, totalPrice: 0 } },
      service: 'fallback'
    });
  });
}

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