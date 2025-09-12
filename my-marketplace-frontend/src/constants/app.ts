// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// App Routes
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  CATEGORY: '/category/:id'
} as const

// Categories
export const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: '🎨' },
  { id: 'logo', name: 'Logo Design', icon: '🏷️' },
  { id: 'web', name: 'Web Design', icon: '💻' },
  { id: 'mobile', name: 'Mobile UI', icon: '📱' },
  { id: 'print', name: 'Print Design', icon: '📄' },
  { id: 'branding', name: 'Branding', icon: '🎯' }
] as const

// Pagination
export const ITEMS_PER_PAGE = 12

// Default Values
export const DEFAULT_VALUES = {
  CART_ITEM_COUNT: 0,
  RATING: 0,
  VIEWS: 0
} as const
