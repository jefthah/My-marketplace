// Load environment variables
require('dotenv').config();

// Import main application with error handling
let app;
try {
  app = require('../src/app');
  console.log('✅ Successfully imported main app');
} catch (error) {
  console.error('❌ Failed to import main app:', error.message);
  
  // Fallback to simple Express app
  const express = require('express');
  app = express();
  
  // Basic middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  // Basic CORS
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
  
  // Root route
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Fallback API - Main app failed to load',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  });
  
  // Test login fallback
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (email === 'jefta.supra@gmail.com' && password === 'Jefta123456') {
      res.json({
        success: true,
        message: 'Fallback login successful',
        data: {
          token: 'fallback-token',
          user: { email, id: 'fallback-id' }
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  });
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      note: 'Main app failed to load, using fallback'
    });
  });
}

// Export for Vercel
module.exports = app;
