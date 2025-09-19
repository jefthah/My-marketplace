# Marketplace Frontend (React + TypeScript)

A modern marketplace frontend built with React, TypeScript, and Vite.

## 🚀 Features

- **Modern UI/UX** - Clean and responsive design
- **User Authentication** - Login, register, and profile management
- **Product Catalog** - Browse and search products
- **Shopping Cart** - Add, remove, and manage cart items
- **Order Management** - Place orders and track status
- **Payment Integration** - Secure payment processing
- **Reviews & Ratings** - Product reviews and ratings
- **Admin Dashboard** - Product and order management (Admin only)
- **Responsive Design** - Works on desktop and mobile

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-marketplace-frontend
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
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Marketplace
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
my-marketplace-frontend/
├── public/                 # Static assets
│   └── logo/              # Logo files
├── src/
│   ├── components/        # Reusable components
│   │   ├── AddProductForm.tsx
│   │   ├── ProductCard.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx
│   │   ├── ProductsPage.tsx
│   │   └── ...
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom hooks
│   │   ├── useAuth.ts
│   │   └── ...
│   ├── services/         # API services
│   │   └── api.ts
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── constants/        # App constants
│   ├── layouts/          # Layout components
│   └── features/         # Feature-based components
├── index.html
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

## 🛡️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🚀 Deployment

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### Environment Variables for Production
- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

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

- React team
- Vite team
- TypeScript community
- All contributors who helped with this project