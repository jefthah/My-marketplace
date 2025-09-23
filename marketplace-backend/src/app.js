const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

// Import routes - ENABLED BACK
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cartRoutes = require('./routes/cartRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://localhost:3000',
      'https://my-marketplace-dx.vercel.app', // Replace with your actual frontend URL
      'https://*.vercel.app' // Allow all vercel apps for development
    ];
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const regex = new RegExp(allowedOrigin.replace('*', '.*'));
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With', 'If-Modified-Since']
};

app.use(cors(corsOptions));

// Rate limiting - DISABLED FOR TESTING
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Marketplace Backend API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint for troubleshooting
app.get('/debug', (req, res) => {
  const rawUri = process.env.MONGODB_URI || '';
  const masked = rawUri
    ? rawUri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+(@.*)/i, '$1****$2')
    : null;
  const hasBadParam = /(bufferMaxEntries|useNewUrlParser|useUnifiedTopology|poolSize|wtimeoutMS)/i.test(rawUri);
  res.json({
    success: true,
    message: 'API is working!',
    environment: process.env.NODE_ENV,
    hasMongoUri: !!rawUri,
    mongoUriMask: masked,
    containsInvalidParams: hasBadParam,
    hasJwtSecret: !!process.env.JWT_SECRET,
    routesLoaded: 'synchronously',
    timestamp: new Date().toISOString()
  });
});

// Simple test login endpoint without database
app.post('/api/test/login', (req, res) => {
  const { email, password } = req.body;
  
  // Test credentials without touching database
  if (email === 'jefta.supra@gmail.com' && password === 'Jefta123456') {
    res.json({
      success: true,
      message: 'Test login berhasil!',
      data: {
        token: 'fake-jwt-token-for-testing',
        user: {
          id: 'test-id',
          email: email,
          username: 'Test User',
          role: 'user'
        }
      },
      note: 'Ini adalah endpoint test tanpa database'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Kredensial test tidak cocok',
      expected: 'jefta.supra@gmail.com / Jefta123456'
    });
  }
});

// Connect to database on startup for serverless
connectDB().catch(err => {
  console.error('Database connection failed on startup:', err.message);
});

// Routes - ENABLED BACK
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler middleware (should be last)
app.use(errorHandler);

module.exports = app;