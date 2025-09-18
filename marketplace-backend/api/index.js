const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('../src/config/database');

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: function (origin, callback) {
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

// Connect to database
connectDB().catch(err => {
  console.error('Database connection failed:', err);
});

// Load only essential routes for serverless
try {
  const authRoutes = require('../src/routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (err) {
  console.error('❌ Auth routes failed:', err.message);
  
  // Fallback auth endpoints jika routes gagal load
  const { registerUser, login } = require('../src/controllers/authController');
  
  app.post('/api/auth/register', async (req, res) => {
    try {
      await registerUser(req, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  });
  
  app.post('/api/auth/login', async (req, res) => {
    try {
      await login(req, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  });
  
  console.log('✅ Fallback auth endpoints created');
}

try {
  const productRoutes = require('../src/routes/productRoutes');
  app.use('/api/products', productRoutes);
  console.log('✅ Product routes loaded');
} catch (err) {
  console.error('❌ Product routes failed:', err.message);
}

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Marketplace Backend API (Original)',
    version: '3.0.0-serverless',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    database: 'MongoDB Atlas Connected',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      products: 'GET /api/products'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Export for Vercel
module.exports = app;
