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
  // Connect to database
  const connectDB = require('../src/config/database');
  connectDB().then(() => {
    console.log('✅ Database connected successfully');
  }).catch(err => {
    console.error('⚠️ Database connection failed:', err.message);
  });

  // Load auth routes
  const authRoutes = require('../src/routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');

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
