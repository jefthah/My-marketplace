import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Navigation, Footer } from "../layouts"
import SEOHead from "../components/SEOHead"
import StructuredData from "../components/StructuredData"
import { 
  HeroSection, 
  CategoriesSection, 
  FeaturedDesigns, 
  ReviewsSection, 
  AboutSection, 
  CTASection 
} from "../features/home"

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const navigate = useNavigate()

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleCartClick = () => {
    navigate('/cart')
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="JD'SIGN Marketplace - Jual Beli Template Design Premium & Source Code Terpercaya"
        description="Marketplace terpercaya untuk jual beli template design premium, source code aplikasi, dan aset digital berkualitas tinggi. Dapatkan template website, mobile app, dan design assets dengan harga terjangkau di Indonesia."
        keywords="marketplace design, template premium, source code, jual beli template, design assets, template website, mobile app template, UI/UX design, marketplace Indonesia, template responsive, source code aplikasi"
        url="https://my-marketplace-sigma.vercel.app"
      />
      <StructuredData type="website" data={{}} />
      <StructuredData type="organization" data={{}} />
      
      <Navigation onCartClick={handleCartClick} />
      
      <main>
        <HeroSection />
        <div id="kategori-populer">
          <CategoriesSection 
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
          />
        </div>
        <FeaturedDesigns selectedCategory={selectedCategory} />
        <ReviewsSection />
        <AboutSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  )
}

export default HomePage
