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
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments',
      cart: '/api/cart',
      payouts: '/api/payouts',
      favorites: '/api/favorites',
      reviews: '/api/reviews'
    }
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
  
  // Fallback API endpoints for testing
  app.get('/api/auth/test', (req, res) => {
    res.json({ success: true, message: 'Auth endpoint working', service: 'fallback' });
  });
  
  app.get('/api/products', (req, res) => {
    res.json({ 
      success: true, 
      message: 'Products endpoint working', 
      data: [],
      service: 'fallback'
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: {
      root: '/',
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments',
      cart: '/api/cart',
      payouts: '/api/payouts',
      favorites: '/api/favorites',
      reviews: '/api/reviews'
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