const express = require('express');
const cors = require('cors');

// Simple Express app for API routes
const app = express();

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Basic routes for testing
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Marketplace API endpoints',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      auth: '/api/auth', 
      orders: '/api/orders',
      cart: '/api/cart'
    }
  });
});

app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API test endpoint working!',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is healthy',
    uptime: process.uptime()
  });
});

// Export as serverless function
module.exports = app;