// Load environment variables
require('dotenv').config();

// Create a completely standalone Express app for debugging
const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

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
    version: 'debug-standalone',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  console.log('🔍 Debug endpoint called');
  res.json({
    success: true,
    message: 'Debug endpoint working!',
    environment: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    timestamp: new Date().toISOString()
  });
});

// Simple POST test endpoint
app.post('/test', (req, res) => {
  console.log('🧪 Simple POST test called');
  res.json({
    success: true,
    message: 'POST request works!',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Simple test login endpoint WITHOUT any database
app.post('/api/test/login', (req, res) => {
  console.log('🔍 Test login endpoint called');
  console.log('📝 Request body:', req.body);
  console.log('📍 Request path:', req.path);
  console.log('🔗 Request URL:', req.url);
  
  const { email, password } = req.body;
  
  // Test credentials without touching database
  if (email === 'jefta.supra@gmail.com' && password === 'Jefta123456') {
    console.log('✅ Credentials match - success response');
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
      note: 'Ini adalah endpoint test tanpa database - STANDALONE',
      debug: {
        receivedEmail: email,
        receivedPassword: password ? '***' : 'empty',
        timestamp: new Date().toISOString()
      }
    });
  } else {
    console.log('❌ Credentials do not match');
    console.log('Expected: jefta.supra@gmail.com / Jefta123456');
    console.log('Received:', email, '/', password ? '***' : 'empty');
    
    res.status(401).json({
      success: false,
      message: 'Kredensial test tidak cocok',
      expected: 'jefta.supra@gmail.com / Jefta123456',
      received: {
        email: email,
        passwordProvided: !!password
      }
    });
  }
});

// Real login endpoint with database (will be implemented next)
app.post('/api/auth/login', async (req, res) => {
  try {
    res.status(503).json({
      success: false,
      message: 'Database authentication not implemented yet',
      note: 'Use /api/test/login for testing',
      nextSteps: 'Will implement MongoDB connection and real auth'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Standalone API - Debug Mode',
    availableEndpoints: [
      'GET /',
      'GET /debug', 
      'POST /api/test/login',
      'GET /api'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /',
      'GET /debug',
      'POST /api/test/login',
      'GET /api'
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
