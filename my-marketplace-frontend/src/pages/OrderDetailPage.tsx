import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Mail, CheckCircle, Clock, Package, User, CreditCard, Copy, ExternalLink, FileText, Star } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  downloadUrl?: string;
  image: string;
  category: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: 'pending' | 'completed' | 'processing' | 'cancelled' | 'confirmed' | 'failed';
  customerEmail: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  createdAt: string;
  paymentMethod?: string;
  isGuestOrder?: boolean;
  payment?: {
    status: 'pending' | 'success' | 'failed' | 'expired';
    createdAt: string;
  };
}

interface LocationState {
  order?: OrderDetail;
  paymentSuccess?: boolean;
  paymentPending?: boolean;
  transactionId?: string;
  reviewSuccess?: boolean;
}

interface BackendOrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  downloadUrl?: string;
  image?: string;
  category?: string;
}

interface BackendOrderData {
  _id: string;
  orderNumber?: string;
  status: 'pending' | 'completed' | 'processing' | 'cancelled' | 'failed';
  customerEmail: string;
  guestEmail?: string;
  customerName?: string;
  items?: BackendOrderItem[];
  totalAmount: number;
  createdAt: string;
  paymentMethod?: string;
  isGuestOrder?: boolean;
  userID?: {
    email: string;
    name?: string;
  };
}

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [countdownInterval, setCountdownInterval] = useState<number | null>(null);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  // Check for review success message
  useEffect(() => {
    if (state?.reviewSuccess) {
      setShowReviewSuccess(true);
      // Clear message after 5 seconds
      setTimeout(() => setShowReviewSuccess(false), 5000);
    }
  }, [state?.reviewSuccess]);

  // Function to calculate time remaining for pending orders
  const calculateTimeRemaining = (createdAt: string): number => {
    console.log('🧮 Calculating time remaining for:', createdAt);
    const createdTime = new Date(createdAt).getTime();
    const currentTime = Date.now();
    const elapsedTime = currentTime - createdTime;
    const tenMinutesInMs = 10 * 60 * 1000; // 10 minutes for payment timeout
    const remainingTime = tenMinutesInMs - elapsedTime;
    
    console.log('⏰ Payment created at:', new Date(createdAt));
    console.log('⏰ Current time:', new Date());
    console.log('⏰ Elapsed time (ms):', elapsedTime);
    console.log('⏰ Remaining time (ms):', remainingTime);
    
    return Math.max(0, remainingTime);
  };

  // Function to format time remaining
  const formatTimeRemaining = (milliseconds: number): string => {
    if (milliseconds <= 0) return '0:00';
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Function to start countdown timer
  const startCountdown = useCallback((createdAt: string) => {
    console.log('🚀 Starting countdown for:', createdAt);
    
    // Calculate initial time remaining
    const initialTime = calculateTimeRemaining(createdAt);
    console.log('⏰ Initial time remaining:', initialTime, 'ms');
    setTimeRemaining(initialTime);

    // If already expired, update status and don't start countdown
    if (initialTime <= 0) {
      console.log('❌ Payment already expired, updating status to failed');
      
      // Update order status to expired locally for immediate UI feedback
      setOrder((currentOrder) => {
        console.log('🔄 Updating order status from:', currentOrder?.status, 'to: failed');
        if (currentOrder) {
          const updatedOrder = {
            ...currentOrder,
            status: 'failed' as const,
            payment: {
              status: 'expired' as const,
              createdAt: currentOrder.payment?.createdAt || createdAt
            }
          };
          console.log('✅ Updated order:', updatedOrder);
          return updatedOrder;
        }
        return currentOrder;
      });
      
      return;
    }

    console.log('✅ Starting countdown timer...');
    // Start new countdown
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(createdAt);
      setTimeRemaining(remaining);

      // If time is up, clear interval and update order status
      if (remaining <= 0) {
        console.log('⏰ Time expired! Clearing interval and updating status');
        clearInterval(interval);
        
        // Update order status to expired locally first for immediate UI feedback
        setOrder((currentOrder) => {
          if (currentOrder) {
            return {
              ...currentOrder,
              status: 'failed',
              payment: {
                ...currentOrder.payment!,
                status: 'expired'
              }
            };
          }
          return currentOrder;
        });
        
        // Update order status to failed in backend first
        setTimeout(async () => {
          try {
            console.log('📡 Updating order status to failed in backend...');
            
            // Update order status via API
            const updateResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/status`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
              },
              body: JSON.stringify({
                status: 'failed'
              })
            });
            
            if (updateResponse.ok) {
              console.log('✅ Order status updated to failed in backend');
            } else {
              console.log('⚠️ Failed to update order status in backend, trying payment expired endpoint...');
              
              // If auth fails, try calling the expired payment endpoint
              const expiredResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/check-expired`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              
              if (expiredResponse.ok) {
                console.log('✅ Backend expired payment check completed');
              }
            }
            
            // Fetch fresh order data to confirm update
            setTimeout(async () => {
              try {
                const orderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/guest/${orderId}`);
                if (orderResponse.ok) {
                  const freshOrderData = await orderResponse.json();
                  console.log('🔄 Fetched fresh order data after status update:', freshOrderData);
                  
                  // Transform fresh order data (same logic as in fetchOrderDetail)
                  const transformedOrder: OrderDetail = {
                    id: freshOrderData._id,
                    orderNumber: freshOrderData.orderNumber,
                    status: freshOrderData.status,
                    customerEmail: freshOrderData.customerEmail,
                    customerName: freshOrderData.customerName,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    items: freshOrderData.orderItems.map((item: any) => ({
                      id: typeof item.productId === 'object' ? item.productId._id : item.productId,
                      name: typeof item.productId === 'object' ? item.productId.name : item.name,
                      image: typeof item.productId === 'object' ? item.productId.image : undefined,
                      sourceCode: typeof item.productId === 'object' ? item.productId.sourceCode : undefined,
                      downloadUrl: typeof item.productId === 'object' ? item.productId.downloadUrl : undefined,
                      unitPrice: item.unitPrice,
                      quantity: item.quantity,
                      subtotal: item.unitPrice * item.quantity
                    })),
                    subtotal: freshOrderData.totalAmount,
                    total: freshOrderData.totalAmount,
                    createdAt: freshOrderData.createdAt,
                    paymentMethod: freshOrderData.paymentMethod || 'Midtrans',
                    isGuestOrder: freshOrderData.isGuestOrder || false
                  };
                  
                  console.log('✅ Updating UI with fresh order data');
                  setOrder(transformedOrder);
                } else {
                  console.log('⚠️ Failed to fetch fresh order data');
                }
              } catch (error) {
                console.error('❌ Error fetching fresh order data:', error);
              }
            }, 1000);
            
          } catch (error) {
            console.error('❌ Error updating order status:', error);
          }
        }, 500);
      }
    }, 1000);

    setCountdownInterval(interval);
    console.log('✅ Countdown timer started');
  }, [orderId]); // Include orderId dependency

  // Cleanup countdown on unmount or status change
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up countdown on component unmount or status change');
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

  // Stop countdown if order status is no longer pending
  useEffect(() => {
    if (order && order.status !== 'pending' && countdownInterval) {
      console.log('🛑 Stopping countdown because order status is no longer pending:', order.status);
      clearInterval(countdownInterval);
      setCountdownInterval(null);
      setTimeRemaining(null);
    }
  }, [order, countdownInterval]);

  const copyOrderUrl = async () => {
    try {
      const orderUrl = `${window.location.origin}/order/${orderId}`;
      await navigator.clipboard.writeText(orderUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback untuk browser lama
      const textArea = document.createElement('textarea');
      textArea.value = `${window.location.origin}/order/${orderId}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const openSourceCode = () => {
    // Get Google Drive URL from the first item's downloadUrl
    const firstItem = order?.items?.[0];
    if (firstItem?.downloadUrl) {
      console.log('Opening Google Drive URL:', firstItem.downloadUrl);
      window.open(firstItem.downloadUrl, '_blank');
    } else {
      console.warn('No Google Drive URL available for this order');
      alert('Source code not available for this order');
    }
  };

  const retryPayment = async () => {
    if (!order || !orderId) return;
    
    console.log('Order data:', order);
    console.log('Customer email:', order.customerEmail);
    console.log('Order ID:', orderId);
    
    if (!order.customerEmail) {
      alert('Email not found. Please refresh the page and try again.');
      return;
    }
    
    setIsRetrying(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/retry/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: order.customerEmail,
          paymentMethod: 'midtrans'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const { paymentUrl } = result.data;
        
        // Redirect to Midtrans payment page
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          console.error('No payment URL received');
          alert('Failed to create retry payment. Please try again.');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to retry payment. Please try again.');
      }
    } catch (error) {
      console.error('Error retrying payment:', error);
      alert('Failed to retry payment. Please check your connection and try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setIsLoading(true);
        
        // If order data is passed via state, use it
        if (state?.order) {
          setOrder(state.order);
          setIsLoading(false);
          return;
        }
        
        // Call actual API to get order details
        if (orderId) {
          try {
            // Try guest endpoint first (no auth required)
            let response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/guest/${orderId}`);
            
            // If guest endpoint fails, try authenticated endpoint
            if (!response.ok && response.status === 404) {
              response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
            }
            
            if (response.ok) {
              const apiResponse = await response.json();
              const orderData: BackendOrderData = apiResponse.data;
              
              console.log('✅ Order fetched successfully!');
              console.log('📧 Raw order data:', orderData);
              console.log('📧 customerEmail field:', orderData.customerEmail);
              console.log('📧 guestEmail field:', orderData.guestEmail);
              console.log('📧 userID field:', orderData.userID);
              
              // Transform backend data to frontend format
              const transformedOrder: OrderDetail = {
                id: orderData._id,
                orderNumber: orderData.orderNumber || `ORD-${orderData._id.slice(-6)}`,
                status: orderData.status,
                customerEmail: orderData.customerEmail || orderData.guestEmail || (orderData.userID?.email) || '',
                customerName: orderData.customerName || orderData.userID?.name,
                items: orderData.items?.map((item: BackendOrderItem) => ({
                  id: item.productId,
                  name: item.name,
                  price: item.unitPrice,
                  quantity: item.quantity,
                  downloadUrl: item.downloadUrl,
                  image: item.image || '/api/placeholder/80/80',
                  category: item.category || 'digital'
                })) || [],
                subtotal: orderData.totalAmount,
                total: orderData.totalAmount,
                createdAt: orderData.createdAt,
                paymentMethod: orderData.paymentMethod || 'Midtrans',
                isGuestOrder: orderData.isGuestOrder || false
              };
              
              console.log('🔄 Transformed order data:', transformedOrder);
              console.log('📧 Final customerEmail:', transformedOrder.customerEmail);
              
              setOrder(transformedOrder);
              
              // Remove startCountdown from here - will be handled by separate useEffect
            } else {
              console.log('❌ API response not ok, status:', response.status);
              const errorText = await response.text();
              console.log('❌ Error response:', errorText);
              throw new Error('Order not found');
            }
          } catch (apiError) {
            console.error('💥 API Error:', apiError);
            console.log('🔄 Falling back to mock data...');
            
            // Get user email from localStorage if available
            let userEmail = 'customer@example.com';
            try {
              const savedUser = localStorage.getItem('user');
              if (savedUser) {
                const userData = JSON.parse(savedUser);
                userEmail = userData.email || userEmail;
              }
            } catch {
              console.warn('Could not parse user data from localStorage');
            }
            
            // Fallback to mock data if API fails
            const mockOrder: OrderDetail = {
              id: orderId || '1',
              orderNumber: `ORD-${Date.now()}`,
              status: state?.paymentSuccess ? 'completed' : 'pending',
              customerEmail: userEmail, // Use actual user email
              customerName: userEmail === 'customer@example.com' ? 'Guest User' : 'Customer',
              items: [
                {
                  id: '1',
                  name: 'Responsive web porto',
                  price: 10000,
                  quantity: 1,
                  downloadUrl: 'https://example.com/download/porto.zip',
                  image: '/api/placeholder/80/80',
                  category: 'website'
                }
              ],
              subtotal: 10000,
              total: 10000,
              createdAt: new Date().toISOString(),
              paymentMethod: 'Midtrans',
              isGuestOrder: userEmail === 'customer@example.com'
            };
            
            console.log('🎭 Created mock order:', mockOrder);
            setOrder(mockOrder);
            
            // Remove startCountdown from here - will be handled by separate useEffect
          }
        } else {
          console.log('❌ No orderId provided');
        }
        
        setIsLoading(false);
        
      } catch (error) {
        console.error('💥 Error fetching order:', error);
        setError('Failed to load order details');
        setIsLoading(false);
      }
    };

    console.log('🚀 fetchOrderDetail useEffect triggered');
    fetchOrderDetail();
  }, [orderId, state]);

  // Separate useEffect to handle countdown when order changes
  useEffect(() => {
    console.log('🔍 Countdown useEffect triggered - order:', order);
    
    if (order && order.status === 'pending') {
      console.log('📋 Order status is pending, checking payment...');
      
      // Use order.createdAt or payment.createdAt
      const paymentCreatedAt = order.payment?.createdAt || order.createdAt;
      console.log('📅 Payment created at:', paymentCreatedAt);
      
      if (paymentCreatedAt) {
        console.log('⏰ Starting countdown for pending order...');
        startCountdown(paymentCreatedAt);
      } else {
        console.log('❌ No payment creation time found');
      }
    } else {
      console.log(`⚠️ Order status is not pending: ${order?.status || 'no order'}`);
    }
  }, [order, startCountdown]); // Include both dependencies

  const handleDownload = (downloadUrl: string, itemName: string) => {
    if (downloadUrl) {
      // Create a temporary anchor to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = itemName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'failed':
        return <Clock className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Order Details</h1>
            <div></div>
          </div>
        </div>
      </div>

      {/* Payment Status Notification */}
      {(state?.paymentSuccess || state?.paymentPending || showReviewSuccess) && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          {state?.paymentSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <h3 className="text-green-800 font-medium">Payment Successful!</h3>
                  <p className="text-green-700 text-sm">
                    Your payment has been processed successfully. 
                    {state.transactionId && ` Transaction ID: ${state.transactionId}`}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {showReviewSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <h3 className="text-green-800 font-medium">Ulasan Berhasil Dikirim!</h3>
                  <p className="text-green-700 text-sm">
                    Terima kasih atas ulasan Anda. Ulasan akan membantu pembeli lain.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {state?.paymentPending && order?.status !== 'failed' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-yellow-800 font-medium">Payment Pending</h3>
                  <p className="text-yellow-700 text-sm">
                    Your payment is being processed. You will receive an email confirmation shortly.
                    {state?.transactionId && ` Transaction ID: ${state.transactionId}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Order #{order.orderNumber}</h2>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-medium capitalize">{order.status}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{order.customerEmail}</p>
                  </div>
                </div>
                {order.customerName && (
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium text-gray-800">{order.customerName}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                        <div className="mt-2 flex flex-col space-y-2">
                          {item.downloadUrl && order.status === 'completed' && (
                            <button
                              onClick={() => handleDownload(item.downloadUrl!, item.name)}
                              className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                          )}
                          {(order.status === 'completed' || order.status === 'confirmed') && (
                            <button
                              onClick={() => navigate(`/review/${item.id}/${order.id}`, {
                                state: {
                                  productName: item.name,
                                  productImage: item.image,
                                  productId: item.id,
                                  orderId: order.id
                                }
                              })}
                              className="flex items-center space-x-1 bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-yellow-600 transition-colors"
                            >
                              <Star className="w-4 h-4" />
                              <span>Beri Ulasan</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Download Section - Show if order is confirmed/completed AND payment successful */}
            {(order.status === 'completed' || order.status === 'confirmed') && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 rounded-full p-2">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Access Your Files</h3>
                      <p className="text-sm text-gray-600">Your source code is ready to access</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-100 rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">Ready</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div>
                            <h4 className="font-medium text-gray-800">{item.name}</h4>
                            <p className="text-sm text-gray-500">Source Code Package</p>
                          </div>
                        </div>
                        <button
                          onClick={() => openSourceCode()}
                          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open Source Code</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start space-x-2">
                    <Mail className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Also sent to your email!</p>
                      <p>Check your inbox at <span className="font-medium">{order.customerEmail}</span> for the access link.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Share Order Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Share Order</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Order URL</p>
                    <p className="text-xs text-gray-500 truncate max-w-48">
                      {window.location.origin}/order/{orderId}
                    </p>
                  </div>
                  <button
                    onClick={copyOrderUrl}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      copySuccess 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/order/${orderId}`;
                      window.open(`https://wa.me/?text=Check my order: ${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    Share via WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/order/${orderId}`;
                      window.open(`mailto:?subject=Order Details&body=Check my order: ${encodeURIComponent(url)}`, '_blank');
                    }}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    Share via Email
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rp {order.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>Rp {order.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Payment Information</h3>
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-800">{order.paymentMethod || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Retry Payment Button for Failed/Pending Orders */}
              {(order.status === 'pending' || order.status === 'failed') && (
                <div className="space-y-3">
                  <button
                    onClick={retryPayment}
                    disabled={isRetrying}
                    className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    {isRetrying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>{order.status === 'failed' ? 'Retry Payment' : 'Continue Payment'}</span>
                      </>
                    )}
                  </button>
                  
                  {order.status === 'failed' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-red-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium text-sm">Payment Expired</span>
                      </div>
                      <p className="text-red-600 text-sm">
                        This payment has expired due to timeout (10 minutes limit). You can retry the payment to complete your order.
                      </p>
                    </div>
                  )}
                  
                  {order.status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-yellow-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium text-sm">Payment Pending</span>
                        {timeRemaining !== null && timeRemaining > 0 && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                            {formatTimeRemaining(timeRemaining)} remaining
                          </span>
                        )}
                      </div>
                      <p className="text-yellow-600 text-sm">
                        Your payment is still pending. Please complete the payment to access your source code.
                        {timeRemaining !== null && timeRemaining > 0 && (
                          <> Payment will expire in {formatTimeRemaining(timeRemaining)}.</>
                        )}
                        {timeRemaining !== null && timeRemaining <= 0 && (
                          <> Payment has expired. Please retry payment.</>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => {
                  // Clear any payment-related state that might cause redirect loops
                  sessionStorage.removeItem('paymentState');
                  localStorage.removeItem('pendingPayment');
                  // Navigate to products page for shopping
                  navigate('/products');
                }}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Continue Shopping
              </button>
              
              {order.status === 'completed' && (
                <button
                  onClick={() => window.print()}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Print Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
