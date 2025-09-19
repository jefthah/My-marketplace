// ULTRA-MINIMAL Express app - NO DOTENV, NO EXTRA DEPENDENCIES
const express = require('express');

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic CORS - allow all origins for testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

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

// Debug endpoint - NO ENV VARS
app.get('/debug', (req, res) => {
  console.log('🔍 Debug endpoint called');
  res.json({
    success: true,
    message: 'ULTRA-MINIMAL Debug endpoint working!',
    version: 'ultra-minimal-v1',
    timestamp: new Date().toISOString(),
    note: 'No dotenv, no mongoose, no extra dependencies'
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

// ULTRA-SIMPLE test login
app.post('/api/test/login', (req, res) => {
  console.log('🔍 ULTRA-MINIMAL Test login called');
  console.log('📝 Body:', req.body);
  
  const { email, password } = req.body || {};
  
  if (email === 'jefta.supra@gmail.com' && password === 'Jefta123456') {
    console.log('✅ SUCCESS!');
    res.json({
      success: true,
      message: 'ULTRA-MINIMAL login berhasil!',
      data: {
        token: 'ultra-minimal-token',
        user: { email, id: '123' }
      }
    });
  } else {
    console.log('❌ FAILED!');
    res.status(401).json({
      success: false,
      message: 'ULTRA-MINIMAL login gagal',
      received: { email, hasPassword: !!password }
    });
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  console.log('📋 API info called');
  res.json({
    success: true,
    message: 'ULTRA-MINIMAL API',
    version: 'ultra-minimal-v1',
    endpoints: [
      'GET /',
      'GET /debug', 
      'POST /api/test/login',
      'POST /test'
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
