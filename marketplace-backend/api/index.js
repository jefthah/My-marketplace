const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Marketplace Backend API is working!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Simple register endpoint for testing
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, role } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, dan password diperlukan'
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'Registration endpoint is working! (Testing mode)',
    data: {
      username,
      email,
      role: role || 'user',
      createdAt: new Date().toISOString()
    }
  });
});

// Simple login endpoint for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email dan password diperlukan'
    });
  }
  
  res.json({
    success: true,
    message: 'Login endpoint is working! (Testing mode)',
    data: {
      email,
      testToken: 'test-jwt-token-123'
    }
  });
});

// Export for Vercel
module.exports = app;
