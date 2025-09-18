const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('../src/routes/authRoutes');
const productRoutes = require('../src/routes/productRoutes');
const orderRoutes = require('../src/routes/orderRoutes');
const paymentRoutes = require('../src/routes/paymentRoutes');
const cartRoutes = require('../src/routes/cartRoutes');
const payoutRoutes = require('../src/routes/payoutRoutes');
const favoriteRoutes = require('../src/routes/favoriteRoutes');
const reviewRoutes = require('../src/routes/reviewRoutes');

// Import middleware
const errorHandler = require('../src/middleware/errorHandler');

// Connect to database
const connectDB = require('../src/config/database');
connectDB();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
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
      if (typeof allowedOrigin === 'string' && allowedOrigin.includes('*')) {
        const regex = new RegExp(allowedOrigin.replace('*', '.*'));
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);

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

// Error handler middleware (should be last)
app.use(errorHandler);

module.exports = app;