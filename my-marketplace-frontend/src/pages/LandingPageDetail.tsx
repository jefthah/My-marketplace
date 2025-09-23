import React, { useState } from 'react';
import Navigation from '../layouts/Navigation';
import Footer from '../layouts/Footer';
import ProductGallery from '../features/products/ProductGallery';
import ProductInfo from '../features/products/ProductInfo';
import PurchaseBox from '../features/products/PurchaseBox';

import { ChevronRight } from 'lucide-react';

import type { Product as ProductType } from '../types';

// Use Partial of Product to relax strict typing for this showcase page,
// then add showcase-only fields below
type ProductData = Omit<Partial<ProductType>, 'images'> & {
  designer: {
    name: string;
    avatar: string;
    level: string;
  };
  originalPrice: number;
  discount: number;
  sales: number;
  rating?: number;
  reviews?: number;
  images: {
    id: number;
    url: string;
    thumb: string;
    label: string;
  }[];
}

const LandingPageDetail: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('description');

  const productData: ProductData = {
    _id: '1',
    title: "Modern Business Landing Page",
    price: 45,
    originalPrice: 65,
    discount: 30,
    rating: 4.9,
    reviews: 24,
  totalReviews: 24,
    sales: 234,
  isActive: true,
    hasSourceCode: false,
    images: [
      { id: 1, url: "https://via.placeholder.com/800x500/3B82F6/ffffff?text=Desktop+View", thumb: "https://via.placeholder.com/150x100/3B82F6/ffffff?text=Desktop", label: "Desktop" },
      { id: 2, url: "https://via.placeholder.com/800x500/60A5FA/ffffff?text=Mobile+View", thumb: "https://via.placeholder.com/150x100/60A5FA/ffffff?text=Mobile", label: "Mobile" },
      { id: 3, url: "https://via.placeholder.com/800x500/1E40AF/ffffff?text=Tablet+View", thumb: "https://via.placeholder.com/150x100/1E40AF/ffffff?text=Tablet", label: "Tablet" },
      { id: 4, url: "https://via.placeholder.com/800x500/93C5FD/ffffff?text=Components", thumb: "https://via.placeholder.com/150x100/93C5FD/ffffff?text=Components", label: "Components" }
    ],
    designer: {
      name: "John Designer",
      avatar: "https://via.placeholder.com/50x50/3B82F6/ffffff?text=JD",
      level: "Elite Author"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
  <Navigation onCartClick={() => {}} />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm">
            <a href="/" className="text-gray-500 hover:text-blue-600">Home</a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <a href="/landing-page" className="text-gray-500 hover:text-blue-600">Landing Page</a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">{productData.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <ProductGallery 
              images={productData.images}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
            />
            
            <ProductInfo 
              product={productData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <PurchaseBox product={productData as any} />
          </div>
        </div>

        
      </div>

      <Footer />
    </div>
  );
};

export default LandingPageDetail;