import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface MidtransResult {
  transaction_id: string;
  order_id: string;
  payment_type: string;
  transaction_status: string;
  fraud_status?: string;
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: {
        onSuccess?: (result: MidtransResult) => void;
        onPending?: (result: MidtransResult) => void;
        onError?: (result: MidtransResult) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

interface OrderDetails {
  _id: string;
  totalAmount: number;
  quantity: number;
  unitPrice: number;
}

interface PaymentDetails {
  _id: string;
  orderID: string;
  amount: number;
  transactionID: string;
  midtransToken?: string;
  snapToken?: string;
  createdAt?: string;
  paymentDate?: string;
  paymentStatus: string;
}

interface LocationState {
  orderId: string;
  paymentId: string;
  snapToken: string;
  orderDetails: OrderDetails;
}

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const state = location.state as LocationState;
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed' | 'cancelled'>('idle');
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentDetails | null>(null);
  const [orderData, setOrderData] = useState<OrderDetails | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Get payment ID from URL parameter or state
  const paymentId = searchParams.get('paymentId') || state?.paymentId;
  const isTestMode = searchParams.get('test') === 'countdown';

  // Load payment data if coming from instant checkout
  useEffect(() => {
    const loadPaymentData = async () => {
      if (!paymentId || state?.snapToken) {
        // If we have snapToken from state (cart checkout), check if we have orderDetails
        if (state?.orderDetails && state?.orderId) {
          console.log('Using state data for countdown, orderId:', state.orderId);
          // Try to get payment data for the order
          try {
            const orderResponse = await apiService.getOrder(state.orderId);
            if (orderResponse.success) {
              setOrderData(orderResponse.data as OrderDetails);
              // Only try to get payment data if user is logged in
              if (user) {
                try {
                  const paymentsResponse = await apiService.getUserPayments();
                  if (paymentsResponse.success && Array.isArray(paymentsResponse.data) && paymentsResponse.data.length > 0) {
                    // Find payment for this order
                    const orderPayment = (paymentsResponse.data as PaymentDetails[]).find((p: PaymentDetails) => p.orderID === state.orderId);
                    if (orderPayment) {
                      setPaymentData(orderPayment);
                      console.log('Found payment data:', orderPayment);
                    }
                  }
                } catch (error) {
                  console.log('Could not load user payments (guest mode):', error);
                }
              }
            }
          } catch (error) {
            console.error('Error loading order/payment data from state:', error);
          }
        }
        return;
      }

      try {
        setIsLoading(true);
        // Use instant payment endpoint for payments from instant checkout
        const paymentResponse = await apiService.getInstantPayment(paymentId);
        if (paymentResponse.success) {
          const payment = paymentResponse.data as PaymentDetails;
          setPaymentData(payment);
          // Also load order data
          const orderResponse = await apiService.getOrder(payment.orderID);
          if (orderResponse.success) {
            setOrderData(orderResponse.data as OrderDetails);
          }
        }
      } catch (error) {
        console.error('Error loading payment data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentData();
  }, [paymentId, state, user]);

  // Load Midtrans Snap script
  useEffect(() => {
    const loadSnapScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.snap) {
          setSnapLoaded(true);
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'; // Use production URL for production
        script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY');
        script.onload = () => {
          setSnapLoaded(true);
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Midtrans Snap'));
        document.head.appendChild(script);
      });
    };

    loadSnapScript().catch((error) => {
      console.error('Error loading Midtrans Snap:', error);
      alert('Failed to load payment system. Please try again.');
    });
  }, []);

  // Calculate countdown timer
  useEffect(() => {
    console.log('🕒 Countdown useEffect triggered, paymentData:', paymentData);
    console.log('🕒 State from navigation:', state);
    console.log('🕒 paymentStatus:', paymentStatus);
    
    // For testing: Add mock payment data if no payment data exists
    let actualPaymentData = paymentData;
    if ((!paymentData && import.meta.env.DEV) || isTestMode) {
      console.log('🧪 Creating mock payment data for testing countdown...');
      actualPaymentData = {
        _id: 'test-payment',
        orderID: 'test-order',
        amount: 100000,
        transactionID: 'test-transaction',
        createdAt: new Date().toISOString(), // Just created now for testing
        paymentStatus: 'pending'
      };
      setPaymentData(actualPaymentData);
    }
    
    if (actualPaymentData && (actualPaymentData.createdAt || actualPaymentData.paymentDate)) {
      console.log('✅ Payment data found for countdown:', actualPaymentData);
      
      // Use createdAt if available, fallback to paymentDate
      const paymentTimeStr = actualPaymentData.createdAt || actualPaymentData.paymentDate;
      if (!paymentTimeStr) {
        console.log('❌ No timestamp found in payment data');
        return;
      }
      
      const paymentTime = new Date(paymentTimeStr).getTime();
      const expiryTime = paymentTime + (10 * 60 * 1000); // 10 minutes
      
      console.log('📅 Payment time:', new Date(paymentTimeStr));
      console.log('⏰ Expiry time:', new Date(expiryTime));
      console.log('🔍 Current time:', new Date());
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const timeRemaining = expiryTime - now;
        
        console.log('⏱️ Time remaining (ms):', timeRemaining);
        console.log('⏱️ Time remaining (min:sec):', Math.floor(timeRemaining / 60000) + ':' + Math.floor((timeRemaining % 60000) / 1000));
        
        if (timeRemaining <= 0) {
          console.log('❌ Payment expired!');
          setTimeLeft(0);
          setIsExpired(true);
        } else {
          const secondsLeft = Math.floor(timeRemaining / 1000);
          setTimeLeft(secondsLeft);
          console.log('⏰ Setting timeLeft to:', secondsLeft);
        }
      };

      // Update immediately
      updateTimer();
      
      const timer = setInterval(updateTimer, 1000);
      return () => {
        console.log('🧹 Cleaning up timer');
        clearInterval(timer);
      };
    } else {
      console.log('❌ No payment data for countdown or missing timestamp fields');
      console.log('   paymentData:', actualPaymentData);
      console.log('   has createdAt:', actualPaymentData?.createdAt);
      console.log('   has paymentDate:', actualPaymentData?.paymentDate);
    }
  }, [paymentData, paymentStatus, state, isTestMode]);

  // Cleanup effect to clear any payment-related state when leaving the page
  useEffect(() => {
    return () => {
      // Clear any payment-related state that might cause redirect loops
      sessionStorage.removeItem('paymentState');
      localStorage.removeItem('pendingPayment');
      console.log('🧹 Cleaned up payment state on component unmount');
    };
  }, []);

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Redirect if no payment data
  if (!state?.snapToken && !paymentData?.midtransToken && !paymentData?.snapToken) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment information...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Information Missing</h2>
          <p className="text-gray-600 mb-4">Please start checkout process from cart or product page.</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors block mx-auto"
            >
              Browse Products
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors block mx-auto"
            >
              Go to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get the correct data based on source (cart vs instant)
  const snapToken = state?.snapToken || paymentData?.midtransToken || paymentData?.snapToken;
  const orderId = state?.orderId || paymentData?.orderID;
  const orderDetails = state?.orderDetails || orderData;

  // Debug logging
  console.log('PaymentPage Debug - Full State Analysis:', {
    hasState: !!state,
    state: state,
    hasPaymentData: !!paymentData,
    paymentData: paymentData,
    snapToken,
    orderId,
    orderDetails,
    searchParams: {
      paymentId: searchParams.get('paymentId'),
      orderId: searchParams.get('orderId')
    }
  });

  const handlePayment = () => {
    if (!window.snap || !snapLoaded) {
      alert('Payment system is not ready. Please wait and try again.');
      return;
    }

    if (!snapToken) {
      alert('Payment token is missing. Please try again.');
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      window.snap.pay(snapToken, {
        onSuccess: (result: MidtransResult) => {
          console.log('Payment success:', result);
          console.log('Payment Success - Full Debug:', {
            orderId: orderId,
            hasOrderId: !!orderId,
            orderIdType: typeof orderId,
            state: state,
            paymentData: paymentData
          });
          setPaymentStatus('success');
          setIsLoading(false);
          
          // Ensure we have orderId before navigation
          if (orderId) {
            console.log('Navigating to order detail with orderId:', orderId);
            // Immediately navigate to order detail page
            navigate(`/order/${orderId}`, {
              state: {
                paymentSuccess: true,
                transactionId: result.transaction_id
              }
            });
          } else {
            console.error('No orderId available for navigation');
            console.error('Full debug for missing orderId:', {
              stateOrderId: state?.orderId,
              paymentDataOrderId: paymentData?.orderID,
              allStateKeys: state ? Object.keys(state) : 'no state',
              allPaymentDataKeys: paymentData ? Object.keys(paymentData) : 'no payment data'
            });
            alert('Payment successful, but order ID missing. Please check your order history.');
          }
        },
        onPending: (result: MidtransResult) => {
          console.log('Payment pending:', result);
          console.log('OrderId for navigation:', orderId);
          setPaymentStatus('processing');
          setIsLoading(false);
          
          // Ensure we have orderId before navigation
          if (orderId) {
            // Navigate to order detail page with pending status
            navigate(`/order/${orderId}`, {
              state: {
                paymentPending: true,
                transactionId: result.transaction_id
              }
            });
          } else {
            console.error('No orderId available for navigation');
            alert('Payment pending, but order ID missing. Please check your order history.');
          }
        },
        onError: (result: MidtransResult) => {
          console.log('Payment error:', result);
          setPaymentStatus('failed');
          setIsLoading(false);
          alert('Payment failed. Please try again.');
        },
        onClose: () => {
          console.log('Payment popup closed');
          setPaymentStatus('cancelled');
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setIsLoading(false);
      alert('Payment failed. Please try again.');
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Clock className="w-8 h-8 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <CreditCard className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing your payment...';
      case 'success':
        return 'Payment successful! Redirecting to order details...';
      case 'failed':
        return 'Payment failed. Please try again.';
      case 'cancelled':
        return 'Payment was cancelled.';
      default:
        return 'Ready to process payment';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isLoading}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Cart</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Payment</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Payment Status */}
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <div className="mb-6">
              {getStatusIcon()}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {paymentStatus === 'idle' ? 'Complete Your Payment' : getStatusMessage()}
            </h2>
            <p className="text-gray-600 mb-6">
              {paymentStatus === 'idle' 
                ? 'Click the button below to proceed with payment'
                : 'Please wait while we process your payment'
              }
            </p>
            
            {paymentStatus === 'idle' && (
              <button
                onClick={handlePayment}
                disabled={isLoading || !snapLoaded}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay Now</span>
                  </>
                )}
              </button>
            )}
            
            {/* Debug Info */}
            {import.meta.env.DEV && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                <p>Debug: timeLeft = {timeLeft}, isExpired = {isExpired.toString()}</p>
                <p>Debug: paymentData = {JSON.stringify(paymentData, null, 2)}</p>
              </div>
            )}
            
            {/* Countdown Timer */}
            {paymentStatus === 'idle' && timeLeft > 0 && (
              <div className={`mt-4 p-4 rounded-lg border ${
                timeLeft <= 120 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className={`w-5 h-5 ${timeLeft <= 120 ? 'text-red-500' : 'text-yellow-600'}`} />
                  <span className={`font-semibold ${timeLeft <= 120 ? 'text-red-700' : 'text-yellow-700'}`}>
                    Waktu pembayaran tersisa: {formatTime(timeLeft)}
                  </span>
                </div>
                {timeLeft <= 120 && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    Segera selesaikan pembayaran sebelum waktu habis!
                  </p>
                )}
              </div>
            )}

            {isExpired && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center justify-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-red-700">
                    Waktu pembayaran telah habis
                  </span>
                </div>
                <p className="text-sm text-red-600 mt-2 text-center">
                  Silakan buat pesanan baru untuk melanjutkan.
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
            
            {orderDetails && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium">{orderDetails._id || orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold text-lg">Rp {orderDetails.totalAmount?.toLocaleString('id-ID') || '0'}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium text-gray-800">Midtrans Payment Gateway</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-800 mb-3">Payment Information</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <p>• Secure payment powered by Midtrans</p>
              <p>• Supports various payment methods (Credit Card, Bank Transfer, E-Wallet, etc.)</p>
              <p>• Your payment information is encrypted and secure</p>
              <p>• You will receive an email confirmation after successful payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
