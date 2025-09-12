import { useState } from "react"
import { Navigation, Footer } from "../layouts"
import { 
  HeroSection, 
  CategoriesSection, 
  FeaturedDesigns, 
  ReviewsSection, 
  AboutSection, 
  CTASection 
} from "../features/home"
import { ProductDetail, CategoryPage } from "../features/products"
import { CartPage } from "../features/cart"
import { designs } from "../constants"
import type { Design } from "../types"

const MainPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentView, setCurrentView] = useState<"home" | "product" | "category" | "cart">("home")
  const [selectedProduct, setSelectedProduct] = useState<Design | null>(null)
  const [selectedCategoryPage, setSelectedCategoryPage] = useState<string>("")
  const [cartItemCount] = useState(3) // Dummy count for demo

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleCategoryPageSelect = (categoryId: string) => {
    setSelectedCategoryPage(categoryId)
    setCurrentView("category")
  }

  const handleBackToHome = () => {
    setCurrentView("home")
    setSelectedProduct(null)
    setSelectedCategoryPage("")
  }

  const handleCartClick = () => {
    setCurrentView("cart")
  }

  // Handle back from cart
  const handleBackFromCart = () => {
    setCurrentView("home")
  }

  // Render Cart Page (special case - tanpa Navigation wrapper)
  if (currentView === "cart") {
    return <CartPage onBack={handleBackFromCart} />
  }

  // Render content berdasarkan view
  const renderContent = () => {
    // Product view
    if (currentView === "product" && selectedProduct) {
      const productExists = designs.find(design => design.id === selectedProduct.id)
      if (!productExists) {
        // Produk sudah dihapus, kembali ke home
        setTimeout(() => handleBackToHome(), 0)
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Produk tidak ditemukan</h2>
              <p className="text-gray-600">Mengalihkan ke halaman utama...</p>
            </div>
          </div>
        )
      }
      // PASTIKAN ProductDetail tidak memiliki Navigation internal
      return <ProductDetail design={selectedProduct} onBack={handleBackToHome} />
    }

    // Category view
    if (currentView === "category" && selectedCategoryPage) {
      // PASTIKAN CategoryPage tidak memiliki Navigation internal
      return (
        <CategoryPage 
          categoryId={selectedCategoryPage} 
          onBack={handleBackToHome}
        />
      )
    }

    // Default: Home view
    return (
      <>
        <HeroSection />
        <CategoriesSection 
          selectedCategory={selectedCategory} 
          onCategorySelect={handleCategorySelect}
          onCategoryPageSelect={handleCategoryPageSelect}
        />
        <FeaturedDesigns selectedCategory={selectedCategory} />
        <ReviewsSection />
        <AboutSection />
        <CTASection />
        <Footer />
      </>
    )
  }

  // Main render dengan Navigation hanya sekali
  return (
    <div className="bg-white">
      <Navigation onCartClick={handleCartClick} cartItemCount={cartItemCount} />
      {renderContent()}
    </div>
  )
}

export default MainPage
