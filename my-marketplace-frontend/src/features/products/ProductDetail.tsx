import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Share2, 
  Download, 
  ShoppingCart, 
  Eye, 
  Check,
  Shield,
  ChevronRight
} from 'lucide-react';
// REMOVED: Navigation and Footer imports
import { ProductGallery, ProductInfo, PurchaseBox } from './';
import FavoriteButton from '../../components/FavoriteButton';
import type { Design } from '../../types';

interface ProductDetailProps {
  design: Design;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ design, onBack }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Parse price dari string ke number (hapus Rp dan konversi)
  const getNumericPrice = (priceStr: string): number => {
    if (typeof priceStr === 'number') return priceStr;
    return parseInt(priceStr.replace('Rp ', '').replace(/\./g, '')) || 0;
  };

  // Transform Design data ke format yang dibutuhkan komponen
  const productData = {
    _id: design.id.toString(), // Convert to string as required by Product type
    id: design.id,
    title: design.title,
    price: getNumericPrice(design.price),
    originalPrice: 0, // Tidak ada di Design type
    discount: 0, // Tidak ada di Design type
    rating: design.rating,
    reviews: Math.floor(design.views / 100), // Estimasi dari views
    totalReviews: Math.floor(design.views / 100), // Required by Product type
    sales: design.downloadCount || 0,
    isActive: true, // Required by Product type
    hasSourceCode: true, // Required by Product type
    images: design.preview?.map((url, index) => ({
      id: index + 1,
      url: url,
      thumb: url,
      label: `Preview ${index + 1}`
    })) || [
      { id: 1, url: design.image, thumb: design.image, label: "Main Preview" }
    ],
    designer: {
      name: design.author || 'Unknown Designer',
      avatar: `https://via.placeholder.com/50x50/3B82F6/ffffff?text=${(design.author || 'U').charAt(0)}`,
      level: 'Elite Author'
    },
    description: design.description,
    features: design.features,
    tags: design.tags,
    category: design.category,
    views: design.views,
    downloadCount: design.downloadCount
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  // Check if this is the Creative Logo Pack (id 2 or 999)
  const isCreativeLogoPack = design.id === 2 || design.id === 999 || design.title === "Creative Logo Pack";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* REMOVED: Navigation component */}
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm">
            <button onClick={onBack} className="text-gray-500 hover:text-blue-600">Home</button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">{productData.category}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">{productData.title}</span>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button 
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Kembali</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <FavoriteButton 
                productId={design.id.toString()} 
                size={18}
                className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100"
              />
              <button className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Product Gallery */}
            <ProductGallery 
              images={productData.images}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
            />
            
            {/* Product Info - Special style for Creative Logo Pack */}
            {isCreativeLogoPack ? (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {productData.category}
                    </span>
                    <span className="text-gray-500 text-sm">
                      by {productData.designer.name}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{productData.title}</h1>
                  
                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm mb-6">
                    <div className="flex items-center space-x-1">
                      {renderStars(productData.rating)}
                      <span className="font-medium ml-2">{productData.rating}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span>{productData.views?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Download className="w-4 h-4" />
                      <span>{productData.downloadCount?.toLocaleString()} downloads</span>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    {productData.description}
                  </p>
                </div>

                {/* What's Included Section for Creative Logo Pack */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Yang Anda Dapatkan:</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productData.features?.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Regular Product Info for other products */
              <ProductInfo 
                product={productData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}

            {/* Tags */}
            {productData.tags && productData.tags.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tags:</h2>
                <div className="flex flex-wrap gap-2">
                  {productData.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Purchase Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 sm:top-24 lg:top-40">
              {isCreativeLogoPack ? (
                /* Custom Purchase Box for Creative Logo Pack */
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  {/* Price */}
                  <div className="mb-4 sm:mb-6">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {formatPrice(productData.price)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">sekali bayar</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 sm:space-y-3">
                    <button className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Beli Sekarang</span>
                    </button>
                    
                    <button className="w-full border border-gray-300 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base">
                      Tambah ke Keranjang
                    </button>
                  </div>

                  {/* Payment Info */}
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
                        <span className="text-base sm:text-lg">💳</span>
                        <span>Pembayaran aman</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
                        <span className="text-base sm:text-lg">⚡</span>
                        <span>Download instan</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
                        <span className="text-base sm:text-lg">✅</span>
                        <span>Lisensi komersial</span>
                      </div>
                    </div>
                  </div>

                  {/* License Info */}
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-blue-900">Lisensi Komersial</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Dapat digunakan untuk proyek komersial tanpa batasan
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Author Info */}
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {productData.designer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{productData.designer.name}</p>
                        <p className="text-xs text-gray-500">{productData.designer.level}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular Purchase Box for other products */
                <PurchaseBox product={productData} />
              )}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">Produk Serupa</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg sm:rounded-t-xl flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl lg:text-4xl">
                    {productData.category === 'logo' ? '🎨' : '🚀'}
                  </span>
                </div>
                <div className="p-2 sm:p-3 lg:p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base line-clamp-2">
                    {productData.category === 'logo' ? `Logo Pack ${num}` : `Template ${num}`}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base lg:text-lg font-bold text-blue-600">$79</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <span className="text-xs sm:text-sm text-gray-600">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REMOVED: Footer component */}
    </div>
  );
};

export default ProductDetail;