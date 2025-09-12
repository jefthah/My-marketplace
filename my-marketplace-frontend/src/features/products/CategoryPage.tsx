"use client"

import { ArrowLeft, Filter, Grid, List } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DesignCard } from "../../shared/components"
import { designs, categories } from "../../constants"
import type { Design } from "../../types"

interface CategoryPageProps {
  categoryId: string
  onBack: () => void
}

export default function CategoryPage({ categoryId, onBack }: CategoryPageProps) {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("popular")

  // Get category info
  const category = categories.find(cat => cat.id === categoryId)
  
  // Filter designs by category
  const categoryDesigns = designs.filter(design => design.category === categoryId)
  
  // Sort designs
  const sortedDesigns = [...categoryDesigns].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseInt(a.price.replace("$", "")) - parseInt(b.price.replace("$", ""))
      case "price-high":
        return parseInt(b.price.replace("$", "")) - parseInt(a.price.replace("$", ""))
      case "rating":
        return b.rating - a.rating
      case "views":
        return b.views - a.views
      default: // popular
        return b.downloadCount! - a.downloadCount!
    }
  })

  const getCategoryDescription = (catId: string) => {
    switch (catId) {
      case "landing":
        return "Koleksi template landing page yang modern, responsif, dan conversion-focused untuk berbagai kebutuhan bisnis Anda."
      case "logo":
        return "Desain logo profesional dan kreatif yang siap pakai untuk membangun identitas brand yang kuat dan memorable."
      case "portfolio":
        return "Template portfolio yang elegan dan interaktif untuk menampilkan karya dan kemampuan Anda secara profesional."
      case "web":
        return "Template website lengkap dengan desain modern dan fungsionalitas yang komprehensif untuk berbagai industri."
      case "business":
        return "Solusi template bisnis yang profesional dan corporate untuk meningkatkan kredibilitas perusahaan Anda."
      case "creative":
        return "Desain kreatif dan artistik yang unik untuk proyek-proyek yang membutuhkan sentuhan inovatif dan out-of-the-box."
      default:
        return "Kumpulan desain berkualitas tinggi yang dipilih khusus untuk kategori ini."
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Kembali ke Home</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-600"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-600"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Terpopuler</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="views">Paling Dilihat</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Category Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{category?.icon}</div>
            <h1 className="text-4xl font-bold mb-4">{category?.name}</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {getCategoryDescription(categoryId)}
            </p>
            <div className="mt-6 flex justify-center items-center gap-6 text-blue-100">
              <span>{categoryDesigns.length} Design Tersedia</span>
              <span>•</span>
              <span>Mulai dari ${Math.min(...categoryDesigns.map(d => parseInt(d.price.replace("$", ""))))}</span>
              <span>•</span>
              <span>Rating Rata-rata {(categoryDesigns.reduce((sum, d) => sum + d.rating, 0) / categoryDesigns.length).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {sortedDesigns.length} Design Ditemukan
          </h2>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter Lanjutan
          </button>
        </div>

        {sortedDesigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Design</h3>
            <p className="text-gray-600">Design untuk kategori ini akan segera tersedia.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {sortedDesigns.map((design: Design) => (
              <div 
                key={design.id} 
                className={viewMode === "list" ? "flex bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow" : ""}
              >
                {viewMode === "list" ? (
                  <>
                    <div className="w-64 flex-shrink-0">
                      <img src={design.image} alt={design.title} className="w-full h-48 object-cover" />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600 transition-colors" 
                            onClick={() => navigate(`/product/${design.id}`)}>
                          {design.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{design.description}</p>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-sm text-gray-500">⭐ {design.rating}</span>
                          <span className="text-sm text-gray-500">👁️ {design.views}</span>
                          <span className="text-sm text-gray-500">⬇️ {design.downloadCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">{design.price}</span>
                        <button 
                          onClick={() => navigate(`/product/${design.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <DesignCard design={design} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
