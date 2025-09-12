import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, User, CreditCard, CheckCircle, Lock, ShoppingBag } from 'lucide-react';
import emailService from '../services/emailService';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface CheckoutFormData {
  email: string;
  name: string;
  confirmEmail: string;
}

interface LocationState {
  cartItems: CartItem[];
  total: number;
}

const GuestCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    name: '',
    confirmEmail: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Guest Info, 2: Payment, 3: Confirmation

  // Redirect if no cart data
  if (!state || !state.cartItems || state.cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Items to Checkout</h2>
          <p className="text-gray-600 mb-4">Please add items to your cart first.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const { cartItems, total } = state;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.confirmEmail.trim()) {
      newErrors.confirmEmail = 'Please confirm your email';
    } else if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateForm()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orderId = `ORD-${Date.now()}`;
      
      // Generate download URLs for items
      const itemsWithDownloads = cartItems.map(item => ({
        ...item,
        downloadUrl: emailService.generateDownloadUrl(item.id, orderId)
      }));

      // Send download links via email
      const emailSuccess = await emailService.sendDownloadLinks({
        customerEmail: formData.email,
        customerName: formData.name,
        orderNumber: orderId,
        items: itemsWithDownloads.map(item => ({
          name: item.name,
          downloadUrl: item.downloadUrl
        }))
      });

      if (!emailSuccess) {
        throw new Error('Failed to send download links');
      }
      
      // Navigate to order detail page
      navigate(`/order/${orderId}`, {
        state: {
          order: {
            id: orderId,
            orderNumber: orderId,
            status: 'completed',
            customerEmail: formData.email,
            customerName: formData.name,
            items: itemsWithDownloads,
            subtotal: total,
            total: total,
            createdAt: new Date().toISOString(),
            paymentMethod: 'Guest Checkout',
            isGuestOrder: true
          }
        }
      });
      
    } catch (error) {
      console.error('Order processing failed:', error);
      alert('Order processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
          1
        </div>
        <div className={`w-16 h-1 ${currentStep > 1 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
          2
        </div>
        <div className={`w-16 h-1 ${currentStep > 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
          3
        </div>
      </div>
    </div>
  );

  const renderGuestInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Guest Checkout</h2>
        <p className="text-gray-600">Enter your details to receive your digital products</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
          </div>
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          <p className="text-xs text-gray-500 mt-1">Your digital products will be sent to this email</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="confirmEmail"
              value={formData.confirmEmail}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.confirmEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Confirm your email address"
            />
          </div>
          {errors.confirmEmail && <p className="text-sm text-red-600 mt-1">{errors.confirmEmail}</p>}
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Information</h2>
        <p className="text-gray-600">Choose your payment method</p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-blue-500 rounded-xl p-4 bg-blue-50">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-800">Free Download</h3>
              <p className="text-sm text-gray-600">No payment required for this guest checkout</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Secure Guest Checkout</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Your information is secure and will only be used to deliver your digital products via email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmation</h2>
        <p className="text-gray-600">Review your order details before completing</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Customer Information</h3>
        <div className="space-y-2">
          <p><span className="text-gray-600">Name:</span> <span className="font-medium">{formData.name}</span></p>
          <p><span className="text-gray-600">Email:</span> <span className="font-medium">{formData.email}</span></p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{item.name}</h4>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => currentStep === 1 ? navigate('/cart') : handlePreviousStep()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{currentStep === 1 ? 'Back to Cart' : 'Previous'}</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Guest Checkout</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {renderStepIndicator()}

        <div className="bg-white rounded-xl shadow-sm border p-8">
          {currentStep === 1 && renderGuestInfoStep()}
          {currentStep === 2 && renderPaymentStep()}
          {currentStep === 3 && renderConfirmationStep()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                onClick={handlePreviousStep}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Previous
              </button>
            )}
            
            <div className="flex-1"></div>
            
            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCompleteOrder}
                disabled={isProcessing}
                className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Complete Order</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestCheckoutPage;
