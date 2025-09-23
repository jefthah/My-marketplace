const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Simple API helper
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  user_id: string;
  product_id: string;
  order_id: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    username: string;
  };
  product?: {
    name: string;
    price: number;
    image: string;
  };
}

export interface CreateReviewData {
  rating: number;
  comment?: string;
  product_id: string;
  order_id: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  rating5: number;
  rating4: number;
  rating3: number;
  rating2: number;
  rating1: number;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: ReviewData[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
    statistics?: ReviewStats;
  };
}

export interface CanReviewResponse {
  success: boolean;
  canReview: boolean;
  reason?: string; // Backend mengembalikan string, bukan enum
  existingReview?: ReviewData;
}

class ReviewService {
    // Cek apakah user sudah memberikan ulasan untuk produk ini
  async hasUserReviewedProduct(productId: string): Promise<{ hasReviewed: boolean; review?: ReviewData }> {
    try {
      const response = await apiCall(`/reviews/has-reviewed/${productId}`);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengecek status ulasan';
      throw new Error(errorMessage);
    }
  }

  // Cek apakah user bisa memberikan ulasan
  async createReview(reviewData: CreateReviewData): Promise<{ success: boolean; data?: ReviewData; message: string }> {
    try {
      const response = await apiCall('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal membuat ulasan';
      throw new Error(errorMessage);
    }
  }

  // Mengambil ulasan berdasarkan produk
  async getReviewsByProduct(
    productId: string, 
    options: {
      page?: number;
      limit?: number;
      sort?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful';
    } = {}
  ): Promise<ReviewsResponse> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.sort) params.append('sort', options.sort);

      const response = await apiCall(`/reviews/product/${productId}?${params.toString()}`);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengambil ulasan';
      throw new Error(errorMessage);
    }
  }

  // Mengambil ulasan berdasarkan user yang sedang login
  async getUserReviews(page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/user?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengambil ulasan');
      }
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengambil ulasan';
      throw new Error(errorMessage);
    }
  }

  // Update ulasan
  async updateReview(
    reviewId: string, 
    updateData: { rating?: number; comment?: string }
  ): Promise<{ success: boolean; data?: ReviewData; message: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal memperbarui ulasan');
      }
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui ulasan';
      throw new Error(errorMessage);
    }
  }

  // Hapus ulasan
  async deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal menghapus ulasan');
      }
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus ulasan';
      throw new Error(errorMessage);
    }
  }

  // Mark ulasan sebagai helpful
  async markHelpful(reviewId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal memberikan feedback');
      }
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memberikan feedback';
      throw new Error(errorMessage);
    }
  }

  // Mengambil semua ulasan (untuk halaman reviews umum)
  async getAllReviews(options: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating';
  } = {}): Promise<ReviewsResponse> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.sort) params.append('sort', options.sort);

      const response = await apiCall(`/reviews?${params.toString()}`);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengambil ulasan';
      throw new Error(errorMessage);
    }
  }
  async canUserReview(productId: string, orderId: string): Promise<CanReviewResponse> {
    try {
      const response = await apiCall(`/reviews/can-review/${productId}/${orderId}`);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengecek permission ulasan';
      throw new Error(errorMessage);
    }
  }

  // Mendapatkan statistik rating untuk produk
  async getProductRatingStats(productId: string): Promise<ReviewStats> {
    try {
      const response = await this.getReviewsByProduct(productId, { limit: 1 });
      return response.data.statistics || {
        averageRating: 0,
        totalReviews: 0,
        rating5: 0,
        rating4: 0,
        rating3: 0,
        rating2: 0,
        rating1: 0
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengambil statistik rating';
      throw new Error(errorMessage);
    }
  }
}

export const reviewService = new ReviewService();
