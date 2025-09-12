import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Download, Eye, Check, ShieldCheck } from 'lucide-react';
import { apiService } from '../../services/api';

interface Designer {
  name: string;
  avatar: string;
  level: string;
}

import type { Product as ProductType } from '../../types';

interface Product extends Omit<ProductType, 'userID' | 'description' | 'category' | 'images' | 'videoUrl' | 'benefit1' | 'benefit2' | 'benefit3' | 'createdAt' | 'updatedAt'> {
  designer: Designer;
  originalPrice: number;
  discount: number;
  sales: number;
  rating: number;
  reviews: number;
}

interface PurchaseBoxProps {
  product: Product;
}

interface License {
  value: string;
  label: string;
  price: number;
}

const PurchaseBox: React.FC<PurchaseBoxProps> = ({ product }) => {
  const navigate = useNavigate();
  const [selectedLicense, setSelectedLicense] = useState<string>('regular');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const licenses: License[] = [
    { value: 'regular', label: 'Regular License', price: product.price || 45 },
    { value: 'extended', label: 'Extended License', price: (product.price || 45) * 2.5 },
    { value: 'team', label: 'Team License', price: (product.price || 45) * 4 }
  ];

  const currentLicense = licenses.find(l => l.value === selectedLicense);

  const includedItems: string[] = [
    'Full source code',
    'Documentation',
    'Free updates',
    '6 months support',
    'Commercial license'
  ];

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        navigate('/login');
        return;
      }

  // Get product ID
  const productID = product._id;
      if (!productID) {
        alert('Product information is missing');
        return;
      }

      // Add to cart
      const response = await apiService.addToCart(productID, 1);
      
      if (response.success) {
        // Success message
        const userChoice = window.confirm('Product added to cart! Would you like to view your cart?');
        if (userChoice) {
          navigate('/cart');
        }
      } else {
        throw new Error(response.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      const error = err instanceof Error ? err : new Error(String(err))

      if (error.message && error.message.includes('login')) {
        alert('Your session has expired. Please login again.');
        navigate('/login');
      } else {
        alert(error.message || 'Failed to add to cart. Please try again.');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setIsAddingToCart(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to purchase');
        navigate('/login');
        return;
      }

  // Get product ID
  const productID = product._id;
      if (!productID) {
        alert('Product information is missing');
        return;
      }

      // Add to cart first
      await apiService.addToCart(productID, 1);
      
      // Then navigate to checkout
      navigate('/checkout');
    } catch (err) {
      console.error('Error during buy now:', err);
      const error = err instanceof Error ? err : new Error(String(err))

      if (error.message && error.message.includes('login')) {
        alert('Your session has expired. Please login again.');
        navigate('/login');
      } else {
        alert('Failed to process. Please try again.');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleLivePreview = () => {
    // Implement live preview logic
    alert('Live preview feature coming soon!');
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 sticky top-24">
        {/* Price */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-blue-600">
              Rp {currentLicense?.price.toLocaleString('id-ID')}
            </span>
            <span className="text-xl text-gray-400 line-through">
              Rp {product.originalPrice.toLocaleString('id-ID')}
            </span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-semibold">
              SAVE {product.discount}%
            </span>
          </div>
          <p className="text-sm text-gray-500">One-time payment, lifetime access</p>
        </div>

        {/* License Type */}
        <div>
          <label className="block text-sm font-semibold mb-2">License Type</label>
          <select 
            value={selectedLicense}
            onChange={(e) => setSelectedLicense(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {licenses.map((license) => (
              <option key={license.value} value={license.value}>
                {license.label} - Rp {license.price.toLocaleString('id-ID')}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
              isAddingToCart 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          
          <button 
            onClick={handleBuyNow}
            disabled={isAddingToCart}
            className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
              isAddingToCart 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
            }`}
          >
            <Download className="w-5 h-5 mr-2" />
            Buy Now
          </button>
          
          <button 
            onClick={handleLivePreview}
            className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center"
          >
            <Eye className="w-5 h-5 mr-2" />
            Live Preview
          </button>
        </div>

        {/* What's Included */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">What's Included:</h4>
          <ul className="space-y-3">
            {includedItems.map((item, index) => (
              <li key={index} className="flex items-center text-sm">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Designer Info */}
        <div className="border-t pt-6">
          <div className="flex items-center space-x-3">
            <img 
              src={product.designer.avatar || 'https://via.placeholder.com/48'}
              alt={product.designer.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <h5 className="font-semibold">{product.designer.name}</h5>
              <p className="text-sm text-gray-500">{product.designer.level}</p>
            </div>
            <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-50">
              Follow
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t pt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{product.sales}</p>
            <p className="text-xs text-gray-500">Sales</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{product.rating}</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{product.reviews}</p>
            <p className="text-xs text-gray-500">Reviews</p>
          </div>
        </div>
      </div>

      {/* Guarantee Box */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <ShieldCheck className="w-8 h-8 text-green-600 mr-3 flex-shrink-0" />
          <div>
            <h5 className="font-semibold text-green-900">30-Day Money Back Guarantee</h5>
            <p className="text-sm text-green-700">100% refund if you're not satisfied</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchaseBox;