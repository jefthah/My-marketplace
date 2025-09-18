const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

// Global error handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://my-marketplace-dx.vercel.app',
      /https:\/\/.*\.vercel\.app$/
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With']
}));

// Basic routes
app.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Marketplace API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      products: '/api/products (coming soon)',
      auth: '/api/auth (coming soon)',
      orders: '/api/orders (coming soon)',
      cart: '/api/cart (coming soon)'
    }
  });
}));

app.get('/test', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'API test endpoint working perfectly!',
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
    headers: {
      'user-agent': req.get('User-Agent'),
      'content-type': req.get('Content-Type')
    }
  });
}));

app.get('/health', asyncHandler(async (req, res) => {
  res.json({
    status: 'healthy',
    message: 'API server is running smoothly',
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
}));

// Simple products mock endpoint
app.get('/products', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Products endpoint (mock data)',
    count: 3,
    data: [
      {
        id: 1,
        name: 'Sample Product 1',
        price: 29.99,
        description: 'This is a sample product for testing'
      },
      {
        id: 2, 
        name: 'Sample Product 2',
        price: 49.99,
        description: 'Another sample product for testing'
      },
      {
        id: 3,
        name: 'Sample Product 3', 
        price: 19.99,
        description: 'Third sample product for testing'
      }
    ]
  });
}));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: ['/', '/test', '/health', '/products']
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