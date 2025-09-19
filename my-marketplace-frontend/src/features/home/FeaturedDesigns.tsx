"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Filter } from "lucide-react"
import type { Product } from "../../types"
import { apiService } from "../../services/api"

interface FeaturedDesignsProps {
  selectedCategory: string
}

const FeaturedDesigns: React.FC<FeaturedDesignsProps> = ({ selectedCategory }) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let response;
        if (selectedCategory === "all") {
          response = await apiService.getProducts(1, 20) // Get more products for display
        } else {
          response = await apiService.getProductsByCategory(selectedCategory, 1, 20)
        }
        
        setProducts(response.data.products)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory])

  // Animation effect when products change
  useEffect(() => {
    if (gridRef.current && !loading) {
      const cards = gridRef.current.querySelectorAll(".design-card")
      cards.forEach((card, index) => {
        const element = card as HTMLElement
        element.style.opacity = '0'
        element.style.transform = 'scale(0.9)'
        setTimeout(() => {
          element.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
          element.style.opacity = '1'
          element.style.transform = 'scale(1)'
        }, index * 100)
      })
    }
  }, [products, loading])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900">Design Unggulan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900">Design Unggulan</h2>
          </div>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">Design Unggulan</h2>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Lihat Semua Produk
            </button>
            <button className="flex items-center justify-center sm:justify-start text-blue-600 hover:text-blue-700 px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Filter</span>
            </button>
          </div>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product: Product) => (
            <div key={product._id} className="design-card bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative">
                <img 
                  src={product.images[0] || '/placeholder-image.png'} 
                  alt={product.title}
                  className="w-full h-40 sm:h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-lg mb-2 text-gray-800 line-clamp-2 h-10 sm:h-auto">
                  {product.title}
                </h3>
                
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs sm:text-sm text-gray-600 ml-1">({product.totalReviews})</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  <button 
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="w-full sm:w-auto bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base hover:bg-blue-700 transition-colors"
                  >
                    Beli
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Tidak ada produk ditemukan untuk kategori ini.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedDesigns
