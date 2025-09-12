import React, { useState, useEffect, useCallback } from 'react';
import { Star, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '../services/reviewService';
import { API_BASE_URL } from '../constants';
import Navigation from '../layouts/Navigation';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user_id: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  product_id: {
    _id: string;
    title: string;
    images: string[];
    price: number;
  };
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  rating5: number;
  rating4: number;
  rating3: number;
  rating2: number;
  rating1: number;
}

const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_rating' | 'lowest_rating'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const handleCartClick = () => {
    navigate('/cart');
  };

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reviewService.getAllReviews({
        page: currentPage,
        limit: 12,
        sort: sortBy
      });

      if (response.success) {
        let filteredReviews = response.data.reviews as unknown as Review[];
        
        // Filter by rating if selected
        if (filterRating) {
          filteredReviews = filteredReviews.filter(review => review.rating === filterRating);
        }

        setReviews(filteredReviews);
        setStats(response.data.statistics || null);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError('Gagal memuat ulasan');
      }
    } catch (err) {
      setError('Gagal memuat ulasan');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, filterRating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${size} ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getRatingPercentage = (ratingCount: number, total: number) => {
    return total > 0 ? Math.round((ratingCount / total) * 100) : 0;
  };

  const getProductImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Handle relative paths from backend
    // Remove /api from API_BASE_URL if present and add the path
    const baseUrl = API_BASE_URL.replace('/api', '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  const getUserProfileUrl = (username: string, profileImage?: string) => {
    if (profileImage) {
      // If it's already a base64 data URL from backend, use it directly
      if (profileImage.startsWith('data:image/')) {
        return profileImage;
      }
      // If it's a file path, construct URL
      const cleanPath = profileImage.startsWith('/') ? profileImage.slice(1) : profileImage;
      return `${API_BASE_URL}/${cleanPath}`;
    }
    // Default avatar using ui-avatars.com
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=3B82F6&color=fff&size=128`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600">
            <p className="text-lg">{error}</p>
            <button 
              onClick={fetchReviews} 
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Coba lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation onCartClick={handleCartClick} />
      <div className="min-h-screen bg-gray-50 pt-16 py-8">
        <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Apa Kata <span className="text-blue-600">Pelanggan Kami</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ribuan bisnis telah mempercayai kami untuk kebutuhan design mereka
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalReviews.toLocaleString()}
              </div>
              <div className="text-gray-600">Total Reviews</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-blue-600 mr-2">
                  {stats.averageRating.toFixed(1)}
                </span>
                <Star className="w-8 h-8 text-yellow-400 fill-current" />
              </div>
              <div className="text-gray-600">Rating Rata-rata</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {getRatingPercentage(stats.rating5 + stats.rating4, stats.totalReviews)}%
              </div>
              <div className="text-gray-600">Kepuasan Pelanggan</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Distribusi Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats[`rating${rating}` as keyof ReviewStats] as number;
                  const percentage = getRatingPercentage(count, stats.totalReviews);
                  return (
                    <div key={rating} className="flex items-center text-sm">
                      <span className="w-8">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-2" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">Filter & Sort:</span>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="highest_rating">Rating Tertinggi</option>
              <option value="lowest_rating">Rating Terendah</option>
            </select>

            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Rating</option>
              <option value="5">5 Bintang</option>
              <option value="4">4 Bintang</option>
              <option value="3">3 Bintang</option>
              <option value="2">2 Bintang</option>
              <option value="1">1 Bintang</option>
            </select>
          </div>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Belum ada ulasan</h2>
            <p className="text-gray-600">Jadilah yang pertama memberikan ulasan!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                {/* Product Info */}
                <div className="flex items-start gap-3 mb-4 pb-4 border-b">
                  {review.product_id?.images?.[0] ? (
                    <img
                      src={getProductImageUrl(review.product_id.images[0])}
                      alt={review.product_id.title}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {review.product_id?.title || 'Produk'}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium">
                      {review.product_id?.price ? formatPrice(review.product_id.price) : ''}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    "{review.comment}"
                  </p>
                )}

                {/* User Info */}
                <div className="flex items-center">
                  <img
                    src={getUserProfileUrl(review.user_id.username, review.user_id.profileImage)}
                    alt={review.user_id.username}
                    className="w-8 h-8 rounded-full mr-3 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getUserProfileUrl(review.user_id.username);
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.user_id.username}
                    </p>
                    <p className="text-xs text-gray-500">Verified Purchase</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sebelumnya
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ReviewsPage;
