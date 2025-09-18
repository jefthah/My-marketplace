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
  console.log('🔄 Starting route loading process...');
  
  // Connect to database (non-blocking)
  try {
    console.log('🔄 Attempting database connection...');
    const connectDB = require('../src/config/database');
    connectDB()
      .then(() => console.log('✅ Database connected successfully'))
      .catch(err => console.warn('⚠️ DB connection failed:', err.message));
  } catch (dbError) {
    console.warn('⚠️ Database module loading failed:', dbError.message);
  }

  // Load routes one by one with individual error handling
  console.log('🔄 Loading routes...');
  
  try {
    const authRoutes = require('../src/routes/authRoutes');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
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

  console.log('✅ Route loading process completed');
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
  
  // Simple fallback login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          service: 'fallback'
        });
      }
      
      // Mock successful login for testing (remove in production)
      if (email === 'jeftasaputra543@gmail.com' && password === 'jefta123456') {
        return res.json({
          success: true,
          message: 'Login successful (fallback mode)',
          data: {
            user: {
              id: 'mock-user-id',
              email: email,
              name: 'Test User',
              role: 'user'
            },
            token: 'mock-jwt-token-for-testing'
          },
          service: 'fallback',
          note: 'This is a mock response for testing. Main auth service needs database connection.'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        service: 'fallback'
      });
      
    } catch (err) {
      console.error('Fallback login error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error in fallback mode',
        service: 'fallback'
      });
    }
  });
  
  // Fallback register endpoint
  app.post('/api/auth/register', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Registration service temporarily unavailable (fallback mode)',
      service: 'fallback',
      note: 'Please check database connection and try again later'
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