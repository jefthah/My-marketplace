import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { LoginPage, Dashboard, SignupPage, OrderDetailPage, GuestCheckoutPage, PaymentPage, PaymentSuccessPage, FavoritesPage, ReviewPage, ReviewsPage, AllProductsPage, PrivacyPolicyPage } from "./pages"
import HomePage from "./pages/HomePage"
import ProductDetailPage from "./pages/ProductDetailPage"
import CartPage from "./features/cart/CartPage"
import AdminLoginPage from "./pages/AdminLoginPage"
import AdminProductPage from "./pages/AdminProductPage"
import ProtectedAdminRoute from "./components/ProtectedAdminRoute"
import WhatsAppButton from "./components/WhatsAppButton"

function CartPageWrapper() {
  const navigate = useNavigate()
  return <CartPage onBack={() => navigate('/products')} />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-white">
          <Routes>
            {/* Route untuk login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Route untuk signup */}
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Route untuk dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Route untuk produk detail */}
            <Route path="/product/:id" element={<ProductDetailPage />} />
            
            {/* Route untuk keranjang */}
            <Route path="/cart" element={<CartPageWrapper />} />
            
            {/* Route untuk pembayaran */}
            <Route path="/payment" element={<PaymentPage />} />
            
            {/* Route untuk sukses pembayaran (dua pola path) */}
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            
            {/* Route untuk guest checkout */}
            <Route path="/guest-checkout" element={<GuestCheckoutPage />} />
            
            {/* Route untuk semua produk */}
            <Route path="/products" element={<AllProductsPage />} />
            
            {/* Route untuk detail order */}
            <Route path="/order/:orderId" element={<OrderDetailPage />} />
            
            {/* Route untuk favorites */}
            <Route path="/favorites" element={<FavoritesPage />} />
            
            {/* Route untuk review */}
            <Route path="/review/:productId/:orderId" element={<ReviewPage />} />
            
            {/* Route untuk halaman reviews semua */}
            <Route path="/reviews" element={<ReviewsPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedAdminRoute>
                  <AdminProductPage />
                </ProtectedAdminRoute>
              } 
            />
            
            {/* Route untuk halaman utama */}
            <Route path="/" element={<HomePage />} />
            {/* Privacy Policy */}
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          </Routes>
          
          {/* WhatsApp Customer Service Button - muncul di semua halaman */}
          <WhatsAppButton />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App