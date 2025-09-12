import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../constants';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: number;
  showToast?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  productId, 
  className = '', 
  size = 20,
  showToast = true 
}) => {
  const { user, token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/check/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }, [productId, token]);

  // Check if product is in favorites when component mounts
  useEffect(() => {
    if (user && token) {
      checkFavoriteStatus();
    }
  }, [productId, user, token, checkFavoriteStatus]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== FAVORITE BUTTON CLICKED ===');
    console.log('toggleFavorite called for productId:', productId);
    console.log('User:', user);
    console.log('Token:', token);
    console.log('User exists:', !!user);
    console.log('Token exists:', !!token);
    
    if (!user || !token) {
      console.log('User not logged in - showing alert');
      if (showToast) {
        // You can implement a toast notification here
        alert('Please login to add favorites');
      }
      return;
    }

    console.log('User is logged in - proceeding with API call');

    console.log('User is logged in - proceeding with API call');
    setIsLoading(true);
    
    try {
      const apiUrl = `${API_BASE_URL}/favorites/toggle/${productId}`;
      console.log('Making request to:', apiUrl);
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Full request URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response received');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setIsFavorite(data.data.isFavorite);
        
        if (showToast) {
          // You can implement a toast notification here
          const message = data.data.isFavorite 
            ? 'Added to favorites!' 
            : 'Removed from favorites!';
          console.log(message);
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      if (showToast) {
        alert('Failed to update favorites');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <button
        onClick={toggleFavorite}
        className={`favorite-btn-guest ${className}`}
        title="Login to add favorites"
      >
        <Heart 
          size={size} 
          className="text-gray-400 hover:text-red-500 transition-colors" 
        />
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`favorite-btn ${isFavorite ? 'favorited' : ''} ${className}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart 
        size={size} 
        className={`transition-all duration-200 ${
          isFavorite 
            ? 'text-red-500 fill-red-500 scale-110' 
            : 'text-gray-400 hover:text-red-500 hover:scale-110'
        } ${isLoading ? 'opacity-50' : ''}`}
      />
    </button>
  );
};

export default FavoriteButton;
