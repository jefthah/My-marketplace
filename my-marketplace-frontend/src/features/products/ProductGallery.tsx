import React, { useEffect } from 'react';
import gsap from 'gsap';

interface Image {
  id: number;
  url: string;
  thumb: string;
  label: string;
}

interface ProductGalleryProps {
  images: Image[];
  selectedImage: number;
  setSelectedImage: (index: number) => void;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ 
  images, 
  selectedImage, 
  setSelectedImage 
}) => {
  useEffect(() => {
    gsap.fromTo('.main-image', 
      { opacity: 0.5, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.3 }
    );
  }, [selectedImage]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
            🔥 Best Seller
          </span>
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -30% OFF
          </span>
        </div>

        {/* Main Image */}
        <div className="overflow-hidden cursor-zoom-in">
          <img 
            className="main-image w-full hover:scale-110 transition-transform duration-300"
            src={images[selectedImage].url}
            alt={images[selectedImage].label}
          />
        </div>
      </div>

      {/* Thumbnails */}
      <div className="p-4 border-t">
        <div className="flex gap-4 overflow-x-auto">
          {images.map((image, index) => (
            <img
              key={image.id}
              src={image.thumb}
              alt={image.label}
              className={`w-24 h-16 object-cover rounded-lg cursor-pointer transition-all
                ${selectedImage === index 
                  ? 'border-2 border-blue-600' 
                  : 'border-2 border-transparent hover:border-blue-300'
                }`}
              onClick={() => setSelectedImage(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;