// my-marketplace-frontend/src/services/api.ts

import type { Product, ProductsResponse } from '../types'

// Cart interfaces
export interface CartItem {
  _id: string
  userID: string
  productID: Product
  quantity: number
  addedAt: string
  updatedAt: string
  totalPrice?: number
}

export type Summary = {
  totalItems: number
  totalQuantity: number
  totalPrice: number
}

export interface CartResponse {
  success: boolean
  statusCode: number
  data: {
    cartItems: CartItem[]
    summary: Summary
  }
  message: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  statusCode: number
  data: T
  message: string
}

// For Vite projects, use import.meta.env; for Create React App, use process.env (with @types/node installed)
// Here is the Vite-compatible version:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  }
}

// Helper function to get public headers (no auth)
const getPublicHeaders = () => {
  return {
    'Content-Type': 'application/json',
  }
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      throw new Error('Please login to continue')
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Helper function to handle public API responses (doesn't logout on 401)
const handlePublicResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const apiService = {
  // Fetch all products
  async getProducts(page: number = 1, limit: number = 10): Promise<ProductsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  // Fetch single product by ID
  async getProduct(id: string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await handleResponse(response)
      return data.data
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  },

  // Fetch products by category
  async getProductsByCategory(category: string, page: number = 1, limit: number = 10): Promise<ProductsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/products?category=${category}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error fetching products by category:', error)
      throw error
    }
  },

  // Cart methods
  async getCartItems(): Promise<ApiResponse<{ cartItems: CartItem[]; summary: Summary }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      const data = await handleResponse(response)
      
      // Handle different response formats from backend
      if (data.data?.cartItems) {
        return data
      } else if (Array.isArray(data.data)) {
        // If backend returns array directly, wrap it
        return {
          ...data,
          data: {
            cartItems: data.data,
            summary: {
              totalItems: data.data.length,
              totalQuantity: data.data.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
              totalPrice: data.data.reduce((sum: number, item: CartItem) => 
                sum + (item.productID.price * item.quantity), 0)
            }
          }
        }
      }
      return data
    } catch (error) {
      console.error('Error fetching cart items:', error)
      throw error
    }
  },

  async addToCart(productID: string, quantity: number = 1): Promise<ApiResponse<CartItem>> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productID, quantity }),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  },

  async updateCartItem(productID: string, quantity: number): Promise<ApiResponse<CartItem>> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productID}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error updating cart item:', error)
      throw error
    }
  },

  async removeCartItem(productID: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productID}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error removing cart item:', error)
      throw error
    }
  },

  async clearCart(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    }
  },

  async getCartCount(): Promise<ApiResponse<{ totalItems: number; totalQuantity: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/count`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error fetching cart count:', error)
      throw error
    }
  },

  // Order methods
  async createOrderFromCart(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/from-cart`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error creating order from cart:', error)
      throw error
    }
  },

  async getUserOrders(page: number = 1, limit: number = 10, status?: string): Promise<import('../types').OrdersResponse> {
    try {
      let url = `${API_BASE_URL}/orders?page=${page}&limit=${limit}`
      if (status) {
        url += `&status=${status}`
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error fetching user orders:', error)
      throw error
    }
  },

  async getOrder(orderId: string): Promise<ApiResponse<import('../types').Order>> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    }
  },

  // Payment methods
  async createPayment(orderID: string, paymentMethod: string = 'midtrans'): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderID, paymentMethod }),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error creating payment:', error)
      throw error
    }
  },

  async getUserPayments(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error fetching user payments:', error)
      throw error
    }
  },

  async getPayment(paymentId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error fetching payment:', error)
      throw error
    }
  },

  async getInstantPayment(paymentId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/instant/${paymentId}`, {
        method: 'GET',
        headers: getPublicHeaders(), // Use public headers for instant payments
      })
      return handlePublicResponse(response) // Use public response handler
    } catch (error) {
      console.error('Error fetching instant payment:', error)
      throw error
    }
  },

  async checkPaymentStatus(paymentId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/status`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error checking payment status:', error)
      throw error
    }
  },

  // Instant order and payment methods
  async createInstantOrder(productId: string, quantity: number, email?: string): Promise<ApiResponse> {
    try {
      const requestData: {
        productId: string;
        quantity: number;
        email?: string;
        isGuest?: boolean;
      } = {
        productId,
        quantity
      }
      
      if (email) {
        requestData.email = email
        // Determine if this is a guest order by checking if user is logged in
        const token = localStorage.getItem('token')
        requestData.isGuest = !token
      }

      const response = await fetch(`${API_BASE_URL}/orders/instant`, {
        method: 'POST',
        headers: getPublicHeaders(), // Use public headers for instant orders
        body: JSON.stringify(requestData),
      })
      return handlePublicResponse(response) // Use public response handler
    } catch (error) {
      console.error('Error creating instant order:', error)
      throw error
    }
  },

  async createInstantPayment(orderId: string, email: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/instant`, {
        method: 'POST',
        headers: getPublicHeaders(), // Use public headers for instant payments
        body: JSON.stringify({
          orderId,
          email
        }),
      })
      return handlePublicResponse(response) // Use public response handler
    } catch (error) {
      console.error('Error creating instant payment:', error)
      throw error
    }
  },

  // Profile management
  async getMe(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error fetching current user:', error)
      throw error
    }
  },

  async updateProfile(profileData: {
    name?: string;
    phone?: string;
    address?: string;
    bio?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  async uploadProfileImage(imageFile: File): Promise<ApiResponse> {
    try {
      const formData = new FormData()
      formData.append('photo', imageFile) // Changed from 'profileImage' to 'photo'
      
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/auth/profile/image`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error uploading profile image:', error)
      throw error
    }
  },

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  },

  // Combined profile update with optional image
  async updateProfileComplete(profileData: {
    name?: string;
    phone?: string;
    address?: string;
    bio?: string;
  }, imageFile?: File): Promise<ApiResponse> {
    try {
      const formData = new FormData()
      
      // Add profile data
      if (profileData.name !== undefined) formData.append('name', profileData.name)
      if (profileData.phone !== undefined) formData.append('phone', profileData.phone || '')
      if (profileData.address !== undefined) formData.append('address', profileData.address || '')
      if (profileData.bio !== undefined) formData.append('bio', profileData.bio || '')
      
      // Add image if provided
      if (imageFile) {
        formData.append('photo', imageFile)
      }
      
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/auth/profile/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  // Toggle favorite product
  async toggleFavorite(productId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/toggle/${productId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      return handleResponse(response)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error
    }
  }
}

export default apiService
