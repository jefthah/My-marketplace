import React, { useState } from 'react';
import { X, Mail, Download, Shield, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  hasSourceCode: boolean;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  productID: string;
  quantity: number;
  totalAmount: number;
}

interface PaymentData {
  _id: string;
  midtransToken: string;
  paymentUrl: string;
  payment?: {
    _id: string;
    orderID: string;
    amount: number;
    transactionID: string;
    midtransToken: string;
    paymentUrl: string;
  };
}

interface InstantCheckoutModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  userEmail?: string;
}

const InstantCheckoutModal: React.FC<InstantCheckoutModalProps> = ({
  product,
  isOpen,
  onClose,
  isLoggedIn,
  userEmail
}) => {
  const [guestEmail, setGuestEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleInstantPurchase = async () => {
    const email = isLoggedIn ? userEmail : guestEmail;
    
    // Validate email
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!isLoggedIn && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create instant order
      const orderResponse = await apiService.createInstantOrder(
        product._id,
        1, // quantity = 1 for instant purchase
        email // Always pass email for both logged and guest users
      );

      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const orderData = orderResponse.data as OrderData;

      // Create payment
      const paymentResponse = await apiService.createInstantPayment(
        orderData._id,
        email!
      );

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Failed to create payment');
      }

      const paymentData = paymentResponse.data as PaymentData;

      // Debug log untuk melihat struktur response
      console.log('Payment response:', paymentResponse);
      console.log('Payment data:', paymentData);
      
      // Get payment ID and snap token from response
      const paymentId = paymentData.payment?._id || paymentData._id;
      const snapToken = paymentData.payment?.midtransToken || paymentData.midtransToken;
      
      console.log('Payment ID:', paymentId);
      console.log('Snap Token:', snapToken);

      // Close modal and navigate to payment page with both paymentId and snapToken
      onClose();
      
      // Debug log before navigation
      console.log('InstantCheckoutModal - About to navigate with:', {
        paymentId: paymentId,
        orderId: orderData._id,
        orderData: orderData,
        snapToken: snapToken
      });
      
      if (snapToken) {
        // Navigate to payment page with payment data in state for instant access
        navigate('/payment', {
          state: {
            paymentId: paymentId,
            orderId: orderData._id, // Add orderId to state
            snapToken: snapToken,
            orderDetails: {
              _id: orderData._id,
              totalAmount: orderData.totalAmount || product.price,
              quantity: 1,
              unitPrice: product.price
            }
          }
        });
      } else {
        // Fallback: navigate with query parameter
        navigate(`/payment?paymentId=${paymentId}&orderId=${orderData._id}`);
      }

    } catch (error) {
      console.error('Purchase error:', error);
      setError(error instanceof Error ? error.message : 'Purchase failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Instant Download</h2>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-blue-100 mt-1">Get your source code immediately after payment</p>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <img 
              src={product.images[0]} 
              alt={product.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{product.title}</h3>
              <p className="text-2xl font-bold text-purple-600">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Email Input for Guest */}
        {!isLoggedIn && (
          <div className="p-6 border-b bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Enter your email for source code delivery"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Source code will be sent to this email after successful payment
            </p>
          </div>
        )}

        {/* Logged In User Info */}
        {isLoggedIn && (
          <div className="p-6 border-b bg-green-50">
            <div className="flex items-center text-green-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Logged in as: {userEmail}</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Source code will be sent to your registered email
            </p>
          </div>
        )}

        {/* Features */}
        <div className="p-6 space-y-3">
          <h4 className="font-semibold text-gray-800 mb-3">What you'll get:</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Download className="w-4 h-4 text-green-500 mr-3" />
              <span>Complete source code (ZIP file)</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-blue-500 mr-3" />
              <span>Instant email delivery</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 text-purple-500 mr-3" />
              <span>Secure payment via Midtrans</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-orange-500 mr-3" />
              <span>Available 24/7 for download</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 space-y-3">
          <button
            onClick={handleInstantPurchase}
            disabled={isProcessing || (!isLoggedIn && !guestEmail)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Buy Now - Rp {product.price.toLocaleString('id-ID')}
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstantCheckoutModal;
