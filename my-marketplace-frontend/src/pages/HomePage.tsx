import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Navigation, Footer } from "../layouts"
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
