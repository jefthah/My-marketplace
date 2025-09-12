import type React from "react"
import { useNavigate } from "react-router-dom"
import { Star, Eye, Download } from "lucide-react"
import FavoriteButton from "../../components/FavoriteButton"
import type { Design } from "../../types"

interface DesignCardProps {
  design: Design
}

const DesignCard: React.FC<DesignCardProps> = ({ design }) => {
  const navigate = useNavigate()
  
  const handleBuyClick = () => {
    navigate(`/product/${design.id}`)
  }

  return (
    <div className="design-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer">
      <div className="relative" onClick={handleBuyClick}>
        <img src={design.image || "/placeholder.svg"} alt={design.title} className="w-full h-48 object-cover" />
        <div className="absolute top-4 right-4">
          <FavoriteButton 
            productId={design.id.toString()} 
            className="bg-white/90 hover:bg-white transition-colors rounded-full p-2"
            size={20}
          />
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600 transition-colors" onClick={handleBuyClick}>{design.title}</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{design.rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{design.views}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-blue-600">{design.price}</p>
          <button 
            onClick={handleBuyClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Beli
          </button>
        </div>
      </div>
    </div>
  )
}

export default DesignCard
