import React, { useState, useEffect, useCallback } from 'react';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../constants';
import { Link } from 'react-router-dom';

interface FavoriteItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  totalReviews: number;
  addedAt: string;
}

const FavoritesPage: React.FC = () => {
  const { user, token } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    console.log('=== FETCHING FAVORITES ===');
    console.log('User:', user);
    console.log('Token:', token);
    
    try {
      setLoading(true);
      const apiUrl = `${API_BASE_URL}/favorites`;
      console.log('Making request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        console.log('data.data:', data.data);
        console.log('data.favorites:', data.favorites);
        console.log('Is data.data array?', Array.isArray(data.data));
        console.log('Is data.favorites array?', Array.isArray(data.favorites));
        
        // Backend mengembalikan data.data.favorites, bukan data.favorites
        const favoritesArray = Array.isArray(data.data?.favorites) 
          ? data.data.favorites 
          : (Array.isArray(data.favorites) 
            ? data.favorites 
            : (Array.isArray(data.data) ? data.data : []));
        console.log('Final favorites array:', favoritesArray);
        console.log('Setting favorites state with:', favoritesArray);
        console.log('Array length:', favoritesArray.length);
        console.log('First item:', favoritesArray[0]);
        setFavorites(favoritesArray);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Failed to load favorites');
      setFavorites([]); // Set sebagai array kosong jika error
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (user && token) {
      fetchFavorites();
    }
  }, [user, token, fetchFavorites]);

  const removeFromFavorites = async (productId: string) => {
    try {
      console.log('Removing favorite:', productId);
      
      const response = await fetch(`${API_BASE_URL}/favorites/toggle/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Remove response successful');
        // Remove from local state using the correct property
        setFavorites(favorites.filter(fav => fav.id !== productId));
        console.log('Updated favorites list locally');
      } else {
        throw new Error('Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Failed to remove from favorites');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-12 border border-blue-100 max-w-2xl mx-auto mt-20">
            <div className="text-center">
              <div className="bg-blue-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="text-white fill-current" size={48} />
              </div>
              <h1 className="text-4xl font-bold text-blue-900 mb-4">Login Required</h1>
              <p className="text-blue-700 mb-8 leading-relaxed text-lg">
                Please sign in to access your personal favorites collection. 
                Your wishlist is safely stored and will be here when you return!
              </p>
              <div className="space-y-4">
                <Link 
                  to="/login" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                >
                  <Heart className="fill-current" size={24} />
                  Sign In to Continue
                </Link>
                <Link 
                  to="/" 
                  className="w-full border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700 hover:text-blue-900 px-8 py-4 rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-3 font-medium"
                >
                  <span className="text-xl">🏠</span>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header Skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-blue-100">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-300 rounded-lg animate-pulse flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <div className="h-6 sm:h-8 bg-blue-300 rounded w-32 sm:w-48 mb-1 sm:mb-2 animate-pulse"></div>
                  <div className="h-3 sm:h-4 bg-blue-200 rounded w-24 sm:w-32 animate-pulse"></div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="h-10 sm:h-12 bg-blue-300 rounded w-full sm:w-32 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Loading Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-0 animate-pulse border border-blue-100">
                <div className="bg-blue-300 rounded-t-lg" style={{ aspectRatio: '16/9' }}></div>
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="bg-blue-300 h-5 sm:h-6 rounded w-3/4"></div>
                  <div className="bg-blue-200 h-3 sm:h-4 rounded"></div>
                  <div className="bg-blue-200 h-3 sm:h-4 rounded w-2/3"></div>
                  <div className="flex justify-between items-center py-1 sm:py-2">
                    <div className="bg-blue-300 h-3 sm:h-4 rounded w-20 sm:w-24"></div>
                    <div className="bg-blue-300 h-4 sm:h-5 w-4 sm:w-5 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2 sm:pt-3">
                    <div className="bg-blue-300 h-10 sm:h-12 rounded"></div>
                    <div className="bg-blue-300 h-10 sm:h-12 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-blue-100">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-600 p-3 sm:p-4 rounded-lg shadow-lg flex-shrink-0">
                <Heart className="text-white fill-current" size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-1 sm:mb-2">My Favorites</h1>
                <p className="text-black text-sm sm:text-base lg:text-lg">Something went wrong</p>
              </div>
            </div>
          </div>

          {/* Error State */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-12 border border-blue-100">
            <div className="text-center max-w-md mx-auto">
              <div className="bg-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-4xl text-white">😞</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-3 sm:mb-4">Oops! Something went wrong</h2>
              <p className="text-blue-700 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">{error}</p>
              <button 
                onClick={fetchFavorites}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base sm:text-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    console.log('=== RENDER: favorites.length === 0 ===');
    console.log('Favorites state:', favorites);
    console.log('Type of favorites:', typeof favorites);
    console.log('Is array:', Array.isArray(favorites));
    console.log('Length:', favorites.length);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-red-500 p-3 sm:p-4 rounded-lg shadow-lg flex-shrink-0">
                  <Heart className="text-white fill-current" size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-1 sm:mb-2">
                    My Favorites
                  </h1>
                  <p className="text-gray-700 text-sm sm:text-base lg:text-lg">Your personal wishlist collection</p>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-12 border border-gray-100">
            <div className="text-center max-w-md sm:max-w-lg mx-auto">
              <div className="mb-6 sm:mb-8">
                <div className="relative">
                  <div className="bg-gray-100 w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                    <Heart size={80} className="sm:w-[100px] sm:h-[100px] text-gray-500" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" 
                          style={{animationDelay: `${i * 0.2}s`}}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Your wishlist is empty</h2>
              <p className="text-gray-700 mb-6 sm:mb-8 leading-relaxed text-base sm:text-lg">
                Discover amazing products and save your favorites here. 
                Start building your dream collection today!
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                <Link 
                  to="/products" 
                  className="w-full bg-blue-600 hover:bg-blue-950 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2 sm:gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base sm:text-lg"
                >
                  <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
                  Explore Products
                </Link>
                
                <Link 
                  to="/" 
                  className="w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 hover:text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2 sm:gap-3 font-medium"
                >
                  <span className="text-lg sm:text-xl">🏠</span>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-blue-100">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-red-500 p-3 sm:p-4 rounded-lg shadow-lg flex-shrink-0">
                <Heart className="text-white fill-current" size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-1 sm:mb-2">
                  My Favorites
                </h1>
                <p className="text-black text-sm sm:text-base lg:text-lg">
                  {favorites.length} product{favorites.length !== 1 ? 's' : ''} in your wishlist
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
              <Link 
                to="/products"
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium text-sm sm:text-base"
              >
                <ShoppingCart size={18} />
                <span>Browse More</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {Array.isArray(favorites) && favorites.map((favorite) => {
            return (
              <div key={favorite.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-blue-100">
                {/* Product Image */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <img
                    src={favorite.image && favorite.image !== '/api/placeholder/300/200' 
                      ? favorite.image 
                      : 'https://via.placeholder.com/400x225/f3f4f6/9ca3af?text=No+Image'}
                    alt={favorite.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x225/f3f4f6/9ca3af?text=No+Image';
                    }}
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromFavorites(favorite.id)}
                    className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white hover:bg-red-500 text-red-500 hover:text-white p-2 sm:p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                    title="Remove from favorites"
                  >
                    <Heart size={16} className="sm:w-5 sm:h-5 fill-current" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                      <h3 className="font-bold text-lg sm:text-xl text-black line-clamp-2 group-hover:text-blue-700 transition-colors flex-1">
                        {favorite.title}
                      </h3>
                      <span className="bg-blue-100 text-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                        {favorite.category}
                      </span>
                    </div>
                    
                    <p className="text-black text-sm sm:text-base line-clamp-2 sm:line-clamp-3 leading-relaxed mb-3">
                      {favorite.description}
                    </p>

                    {/* Price */}
                    <div className="mb-3">
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">
                        Rp {favorite.price?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2 sm:pt-3">
                    <Link
                      to={`/product/${favorite.id}`}
                      className="bg-white border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700 hover:text-blue-900 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 font-medium sm:font-semibold text-xs sm:text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Eye size={14} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </Link>
                    <button className="bg-white border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700 hover:text-blue-900 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 font-medium sm:font-semibold text-xs sm:text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                      <ShoppingCart size={14} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Cart</span>
                    </button>
                  </div>

                  {/* Added date */}
                  <div className="pt-3 sm:pt-4 border-t border-blue-100">
                    <p className="text-xs sm:text-sm text-blue-600 flex items-center gap-1 sm:gap-2">
                      <span className="text-blue-400">💝</span>
                      <span>Added {new Date(favorite.addedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
