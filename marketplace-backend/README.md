# Marketplace Backend API

A comprehensive marketplace backend built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- **User Authentication** - JWT-based authentication system
- **Role-based Access Control** - Admin and User roles
- **Product Management** - CRUD operations for products
- **Order Management** - Order processing and tracking
- **Shopping Cart** - Cart functionality
- **Payment Integration** - Midtrans payment gateway
- **Review System** - Product reviews and ratings
- **File Upload** - Cloudinary integration for images
- **Security** - Helmet, CORS, rate limiting, and input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd marketplace-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/marketplace

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Midtrans (for payments)
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_IS_PRODUCTION=false

# Frontend URL
CLIENT_URL=http://localhost:5173
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Database
```bash
npm run seed
```

### Create Admin User
```bash
node create-admin.js
```

## 📁 Project Structure

```
marketplace-backend/
├── api/                    # Vercel serverless functions
│   └── index.js           # Main API entry point for Vercel
├── src/
│   ├── app.js             # Express app configuration
│   ├── seeder.js          # Database seeder
│   ├── config/            # Configuration files
│   │   ├── database.js    # MongoDB connection
│   │   └── midtrans.js    # Midtrans configuration
│   ├── controllers/       # Route controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── ...
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js        # Authentication middleware
│   │   ├── security.js    # Security middleware
│   │   └── ...
│   ├── models/            # Mongoose models
│   │   ├── user.js
│   │   ├── product.js
│   │   ├── order.js
│   │   └── ...
│   ├── routes/            # Route definitions
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── ...
│   ├── services/          # Business logic services
│   └── utils/             # Utility functions
├── uploads/               # File upload directory
├── server.js              # Local server entry point
├── create-admin.js        # Admin user creation script
└── vercel.json           # Vercel deployment configuration
```

## 🛡️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## 🚀 Deployment

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### Environment Variables for Production
Make sure to set all required environment variables in your deployment platform.

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **Your Name** - *Initial work*

## 🙏 Acknowledgments

- Express.js community
- MongoDB team
- All contributors who helped with this project