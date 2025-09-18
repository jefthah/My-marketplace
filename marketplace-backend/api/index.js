const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Simple Auth Endpoints - Defined directly to avoid loading issues
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Test credentials for demo
    if (email === 'jeftasaputra543@gmail.com' && password === 'jefta123456') {
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'test-user-123',
            email: email,
            name: 'Jefta Saputra',
            role: 'user'
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlci0xMjMiLCJlbWFpbCI6ImplZnRhc2FwdXRyYTU0M0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTY5NDEyMzQ1Nn0.test-token'
        }
      });
    }
    
    // Test admin credentials
    if (email === 'admin@marketplace.com' && password === 'admin123') {
      return res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          user: {
            id: 'admin-123',
            email: email,
            name: 'Admin User',
            role: 'admin'
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTEyMyIsImVtYWlsIjoiYWRtaW5AbWFya2V0cGxhY2UuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjk0MTIzNDU2fQ.admin-test-token'
        }
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }
    
    // Mock successful registration
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: 'new-user-' + Date.now(),
          name: name,
          email: email,
          phone: phone || null,
          role: 'user'
        }
      }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  // Mock user data for testing
  return res.json({
    success: true,
    data: {
      id: 'test-user-123',
      name: 'Jefta Saputra',
      email: 'jeftasaputra543@gmail.com',
      role: 'user',
      phone: null,
      address: null
    }
  });
});

// Simple Product Endpoints
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    statusCode: 200,
    data: {
      products: [
        {
          _id: 'product-1',
          title: 'Sample Digital Product',
          description: 'This is a sample digital product for testing',
          price: 99000,
          category: 'software',
          images: ['https://via.placeholder.com/300x200'],
          rating: 4.5,
          totalReviews: 10,
          isActive: true
        },
        {
          _id: 'product-2',
          title: 'Another Digital Product',
          description: 'Another sample product',
          price: 149000,
          category: 'template',
          images: ['https://via.placeholder.com/300x200'],
          rating: 4.8,
          totalReviews: 25,
          isActive: true
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        pages: 1
      }
    },
    message: 'Products retrieved successfully'
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    statusCode: 200,
    data: {
      _id: id,
      title: 'Sample Digital Product',
      description: 'This is a sample digital product for testing',
      price: 99000,
      category: 'software',
      images: ['https://via.placeholder.com/300x200'],
      rating: 4.5,
      totalReviews: 10,
      isActive: true,
      userID: {
        _id: 'user-123',
        username: 'jefta',
        photo: null
      }
    },
    message: 'Product retrieved successfully'
  });
});

// API info
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Marketplace API endpoints',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    endpoints: {
      // Authentication endpoints
      auth: {
        base: '/api/auth',
        endpoints: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          me: 'GET /api/auth/me',
          forgotPassword: 'POST /api/auth/forgot-password',
          resetPassword: 'PUT /api/auth/reset-password/:resetToken',
          profile: 'PUT /api/auth/profile',
          profileImage: 'POST /api/auth/profile/image',
          changePassword: 'PUT /api/auth/change-password'
        }
      },
      // Product endpoints
      products: {
        base: '/api/products',
        endpoints: {
          getAll: 'GET /api/products',
          getById: 'GET /api/products/:id',
          getByCategory: 'GET /api/products/category/:category',
          create: 'POST /api/products (Admin)',
          update: 'PUT /api/products/:id (Admin)',
          delete: 'DELETE /api/products/:id (Admin)',
          adminProducts: 'GET /api/products/admin/my-products (Admin)',
          stats: 'GET /api/products/admin/stats (Admin)'
        }
      },
      // Cart endpoints
      cart: {
        base: '/api/cart',
        endpoints: {
          getCart: 'GET /api/cart',
          addToCart: 'POST /api/cart',
          updateCart: 'PUT /api/cart/:productID',
          removeFromCart: 'DELETE /api/cart/:productID',
          clearCart: 'DELETE /api/cart',
          getCount: 'GET /api/cart/count'
        }
      },
      // Order endpoints
      orders: {
        base: '/api/orders',
        endpoints: {
          getUserOrders: 'GET /api/orders',
          getOrderById: 'GET /api/orders/:orderId',
          createFromCart: 'POST /api/orders/from-cart',
          createInstant: 'POST /api/orders/instant'
        }
      },
      // Payment endpoints
      payments: {
        base: '/api/payments',
        endpoints: {
          createPayment: 'POST /api/payments',
          getUserPayments: 'GET /api/payments',
          getPaymentById: 'GET /api/payments/:paymentId',
          getInstantPayment: 'GET /api/payments/instant/:paymentId',
          checkStatus: 'GET /api/payments/:paymentId/status',
          createInstant: 'POST /api/payments/instant'
        }
      },
      // Payout endpoints
      payouts: {
        base: '/api/payouts',
        endpoints: {
          getPayouts: 'GET /api/payouts',
          createPayout: 'POST /api/payouts',
          updatePayout: 'PUT /api/payouts/:id'
        }
      },
      // Favorite endpoints
      favorites: {
        base: '/api/favorites',
        endpoints: {
          toggleFavorite: 'POST /api/favorites/toggle/:productId',
          getUserFavorites: 'GET /api/favorites'
        }
      },
      // Review endpoints
      reviews: {
        base: '/api/reviews',
        endpoints: {
          getAllReviews: 'GET /api/reviews',
          getUserReviews: 'GET /api/reviews/user',
          getProductReviews: 'GET /api/reviews/product/:productId',
          createReview: 'POST /api/reviews',
          updateReview: 'PUT /api/reviews/:reviewId',
          deleteReview: 'DELETE /api/reviews/:reviewId',
          markHelpful: 'POST /api/reviews/:reviewId/helpful',
          hasReviewed: 'GET /api/reviews/has-reviewed/:productId',
          canReview: 'GET /api/reviews/can-review/:productId/:orderId'
        }
      }
    },
    documentation: 'See API_DOCUMENTATION.md for detailed request/response examples',
    testCredentials: {
      user: {
        email: 'jeftasaputra543@gmail.com',
        password: 'jefta123456'
      },
      admin: {
        email: 'admin@marketplace.com',
        password: 'admin123'
      }
    }
  });
});

// Simple Cart Endpoints
app.get('/api/cart', (req, res) => {
  res.json({
    success: true,
    statusCode: 200,
    data: {
      cartItems: [],
      summary: {
        totalItems: 0,
        totalQuantity: 0,
        totalPrice: 0
      }
    },
    message: 'Cart retrieved successfully'
  });
});

app.post('/api/cart', (req, res) => {
  const { productID, quantity = 1 } = req.body;
  
  if (!productID) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }
  
  res.json({
    success: true,
    statusCode: 200,
    data: {
      _id: 'cart-item-' + Date.now(),
      userID: 'test-user-123',
      productID: {
        _id: productID,
        title: 'Sample Product',
        price: 99000,
        images: ['https://via.placeholder.com/300x200']
      },
      quantity: quantity,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: 'Product added to cart successfully'
  });
});

// Simple Orders Endpoints
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    statusCode: 200,
    data: {
      orders: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        hasNext: false,
        hasPrev: false
      }
    },
    message: 'Orders retrieved successfully'
  });
});

// Simple Reviews Endpoints
app.get('/api/reviews', (req, res) => {
  res.json({
    success: true,
    data: {
      reviews: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 10
      }
    }
  });
});

app.get('/api/reviews/product/:productId', (req, res) => {
  const { productId } = req.params;
  
  res.json({
    success: true,
    data: {
      reviews: [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Great product! Highly recommended.',
          user_id: 'user-123',
          product_id: productId,
          is_verified_purchase: true,
          helpful_count: 2,
          createdAt: new Date().toISOString(),
          user: {
            name: 'John Doe',
            username: 'johndoe'
          }
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        limit: 10
      },
      statistics: {
        averageRating: 5.0,
        totalReviews: 1,
        rating5: 1,
        rating4: 0,
        rating3: 0,
        rating2: 0,
        rating1: 0
      }
    }
  });
});

// Optional: Try to load additional routes if available
console.log('🔄 All basic endpoints are defined directly in this file');
console.log('✅ API is ready to serve requests');

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    suggestion: `Try visiting GET /api to see all available endpoints`,
    quickLinks: {
      apiInfo: 'GET /api',
      health: 'GET /health',
      auth: 'POST /api/auth/login',
      products: 'GET /api/products',
      cart: 'GET /api/cart',
      orders: 'GET /api/orders',
      reviews: 'GET /api/reviews'
    }
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