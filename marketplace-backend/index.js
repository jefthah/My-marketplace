const express = require('express');
const cors = require('cors');

// Simple test app
const app = express();

app.use(cors());
app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API endpoint working!',
    status: 'success'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Marketplace Backend',
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = app;