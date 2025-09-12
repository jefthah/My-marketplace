"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag,
  CheckCircle,
} from "lucide-react"
import { apiService, type CartItem as ApiCartItem } from "../../services/api"

interface PaymentData {
  payment: {
    _id: string;
    orderID: string;
    userID: string;
    paymentMethod: string;
    transactionID: string;
    amount: number;
    paymentStatus: string;
  };
  snapToken: string;
  paymentUrl: string;
}

interface CartPageProps {
  onBack?: () => void
}

const CartPage: React.FC<CartPageProps> = (props) => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<ApiCartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState("")
  const [isPromoApplied, setIsPromoApplied] = useState(false)

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Check if user is logged in
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please login to view your cart')
          setLoading(false)
          return
        }

        const response = await apiService.getCartItems()
        
        // Handle the nested response structure
        if (response.data?.cartItems) {
          setCartItems(response.data.cartItems)
        } else if (Array.isArray(response.data)) {
          setCartItems(response.data)
        } else {
          setCartItems([])
        }
      } catch (err) {
        console.error('Error fetching cart items:', err)
        const error = err instanceof Error ? err : new Error(String(err))
        if (error.message.includes('login')) {
          setError('Please login to view your cart')
        } else {
          setError('Failed to load cart items. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCartItems()
  }, [])

  const handleBack = () => {
    // use onBack prop when provided (for wrapper components)
    const p = props as CartPageProps
    if (p.onBack) return p.onBack()
    // Always navigate to products page instead of browser back to avoid payment page redirect
    navigate('/products')
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    // Ensure productID exists and has price
    if (item.productID && item.productID.price) {
      return sum + (item.productID.price * item.quantity)
    }
    return sum
  }, 0)
  
  const discount = isPromoApplied ? subtotal * 0.1 : 0
  const total = subtotal - discount

  // Handle quantity change
  const updateQuantity = async (productID: string, change: number) => {
    try {
      const item = cartItems.find(item => item.productID._id === productID)
      if (!item) return
      
      const newQuantity = Math.max(1, item.quantity + change)
      await apiService.updateCartItem(productID, newQuantity)
      
      // Update local state
      setCartItems(prevItems =>
        prevItems.map(item => 
          item.productID._id === productID 
            ? { ...item, quantity: newQuantity }
            : item
        )
      )
    } catch (err) {
      console.error('Error updating quantity:', err)
      const error = err instanceof Error ? err : new Error(String(err))
      if (error.message.includes('login')) {
        alert('Session expired. Please login again.')
        navigate('/login')
      } else {
        alert('Failed to update quantity')
      }
    }
  }

  // Remove item from cart
  const removeItem = async (productID: string) => {
    try {
      await apiService.removeCartItem(productID)
      setCartItems(prevItems => prevItems.filter(item => item.productID._id !== productID))
    } catch (err) {
      console.error('Error removing item:', err)
      const error = err instanceof Error ? err : new Error(String(err))
      if (error.message.includes('login')) {
        alert('Session expired. Please login again.')
        navigate('/login')
      } else {
        alert('Failed to remove item')
      }
    }
  }

  // Apply promo code
  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "DESIGN10") {
      setIsPromoApplied(true)
      alert('Promo code applied successfully!')
    } else {
      alert('Invalid promo code')
    }
  }

  // Handle checkout
  const handleCheckout = async () => {
    const isLoggedIn = localStorage.getItem('token');
    
    if (isLoggedIn) {
      // User is logged in, create order from cart using backend API
      try {
        setLoading(true);
        
        // Create orders from cart
        const orderResponse = await apiService.createOrderFromCart();
        
        if (orderResponse.success && orderResponse.data) {
          const orders = Array.isArray(orderResponse.data) ? orderResponse.data : [orderResponse.data];
          
          // If multiple orders, handle first one for now
          const firstOrder = orders[0];
          
          // Create payment for the order
          const paymentResponse = await apiService.createPayment(firstOrder._id, 'midtrans');
          
          if (paymentResponse.success && paymentResponse.data) {
            const paymentData = paymentResponse.data as PaymentData;
            const { payment, snapToken } = paymentData;
            
            // Navigate to payment page with snap token
            navigate('/payment', {
              state: {
                orderId: firstOrder._id,
                paymentId: payment._id,
                snapToken: snapToken,
                orderDetails: firstOrder
              }
            });
          } else {
            throw new Error('Failed to create payment');
          }
        } else {
          throw new Error('Failed to create order');
        }
        
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Failed to proceed to checkout. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // User is not logged in, show options
      const shouldLoginFirst = confirm(
        'You can checkout as a guest or login to your account.\n\n' +
        'Click OK to login to your account\n' +
        'Click Cancel to continue as guest'
      );
      
      if (shouldLoginFirst) {
        navigate('/login');
      } else {
        // Proceed to guest checkout
        navigate('/checkout/guest', {
          state: {
            cartItems: cartItems.map(item => ({
              id: item.productID._id,
              name: item.productID.title,
              price: item.productID.price,
              quantity: item.quantity,
              image: item.productID.images?.[0] || '/api/placeholder/80/80',
              category: item.productID.category
            })),
            total: total
          }
        });
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          {error.includes('login') ? (
            <button 
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
            >
              Go to Login
            </button>
          ) : null}
          <button 
            onClick={handleBack}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/products')}
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Products
            </button>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Start shopping and find the best designs for your needs</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/products')}
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Products
            </button>
            <h1 className="text-xl font-bold text-blue-900">Shopping Cart</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Items ({cartItems.length})
                </h2>
              </div>

              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item._id} className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Product Image */}
                      <img
                        src={item.productID?.images?.[0] || 'https://via.placeholder.com/300'}
                        alt={item.productID?.title || 'Product'}
                        className="w-full md:w-32 h-32 object-cover rounded-lg"
                      />

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.productID?.title || 'Product Name'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.productID?.category || 'Category'}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Digital Product
                          </span>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-gray-600">Instant Download</span>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Control */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productID._id, -1)}
                              className="w-8 h-8 rounded-lg border hover:bg-gray-100 flex items-center justify-center"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productID._id, 1)}
                              className="w-8 h-8 rounded-lg border hover:bg-gray-100 flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="font-bold text-lg text-blue-600">
                              Rp {((item.productID?.price || 0) * item.quantity).toLocaleString('id-ID')}
                            </div>
                            <div className="text-sm text-gray-500">
                              Rp {(item.productID?.price || 0).toLocaleString('id-ID')} each
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.productID._id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              {/* Promo Code */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Apply
                  </button>
                </div>
                {isPromoApplied && (
                  <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Promo code applied!
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                
                {isPromoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (10%)</span>
                    <span>-Rp {discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Proceed to Checkout
                </button>
                <button 
                  onClick={() => navigate('/products')}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Service Info */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium mb-3">Shopping Benefits</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Instant Download
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Secure Payment
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Best Price Guarantee
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage