import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Eye,
  Download,
  Shield,
  Truck,
  RotateCcw,
  CheckCircle,
  Zap,
} from "lucide-react";
import type { Product } from "../types";
import { apiService } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import InstantCheckoutModal from "../components/InstantCheckoutModal";
import VideoPreview from "../components/VideoPreview";
import ReviewList from "../components/ReviewList";
import { reviewService } from "../services/reviewService";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showInstantCheckout, setShowInstantCheckout] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  
  // Review statistics state
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await apiService.getProduct(id);
        setProduct(data);
        
        // Set review stats if available from product data
        if (data.averageRating !== undefined && data.totalReviews !== undefined) {
          setReviewStats({
            averageRating: data.averageRating,
            totalReviews: data.totalReviews
          });
        }
      } catch (err) {
        setError("Failed to load product");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch review statistics separately
  useEffect(() => {
    const fetchReviewStats = async () => {
      if (!id) return;

      try {
        // Fetch review statistics to get latest data
        const reviewResponse = await reviewService.getReviewsByProduct(id, { page: 1, limit: 1 });
        if (reviewResponse.success && reviewResponse.data.statistics) {
          setReviewStats({
            averageRating: reviewResponse.data.statistics.averageRating || 0,
            totalReviews: reviewResponse.data.statistics.totalReviews || 0
          });
        }
      } catch (error) {
        console.error('Error fetching review stats:', error);
      }
    };

    fetchReviewStats();
  }, [id]);

  const toggleFavorite = async () => {
    if (!product?._id || !isAuthenticated) {
      alert("Please login to add to favorites");
      return;
    }

    try {
      await apiService.toggleFavorite(product._id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorites");
    }
  };

  useEffect(() => {
    const checkUserReview = async () => {
      if (!isAuthenticated || !id) {
        setHasUserReviewed(false);
        return;
      }

      try {
        const result = await reviewService.hasUserReviewedProduct(id);
        setHasUserReviewed(result.hasReviewed);
      } catch (error) {
        console.error('Error checking user review status:', error);
        setHasUserReviewed(false);
      }
    };

    checkUserReview();
  }, [isAuthenticated, id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleBuyNow = () => {
    setShowInstantCheckout(true);
  };

  const handleAddToCart = async () => {
    try {
      if (!product?._id) return;
      await apiService.addToCart(product._id, 1);
      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please login first.");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Product not found"}</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Clean Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back to Products</span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="w-full" style={{ aspectRatio: '16/9' }}>
                  <img
                    src={
                      product.images[selectedImageIndex] ||
                      "/placeholder-image.png"
                    }
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Product Stats Badge */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-2 rounded-lg shadow-sm border">
                <div className="flex items-center space-x-3 text-sm">
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {Math.floor(Math.random() * 2000) + 1000}
                  </span>
                  <span className="flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    {Math.floor(Math.random() * 500) + 200}
                  </span>
                  <span className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                    {reviewStats.averageRating > 0 ? reviewStats.averageRating : 'No ratings'}
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-blue-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Video Preview */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <VideoPreview product={product} />
            </div>
          </div>

          {/* Right Column - Product Information */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="mb-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(reviewStats.averageRating || 0)
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-semibold text-lg">
                      {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : "0.0"}
                    </span>
                    <span className="text-sm ml-2">
                      ({reviewStats.totalReviews} reviews)
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Best Seller
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">
                  Special Price
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  Rp {product.price.toLocaleString("id-ID")}
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <span className="text-gray-500 line-through">
                    Rp {(product.price * 1.4).toLocaleString("id-ID")}
                  </span>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                    Save Rp {(product.price * 0.4).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Zap className="w-5 h-5 mr-2" />
                Buy Now - Instant Download
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center border border-gray-300"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
            </div>

            {/* Product Features */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">What's Included</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  Secure Payment
                </div>
                <div className="flex items-center text-gray-600">
                  <Truck className="w-4 h-4 mr-2 text-blue-600" />
                  Instant Delivery
                </div>
                <div className="flex items-center text-gray-600">
                  <RotateCcw className="w-4 h-4 mr-2 text-purple-600" />
                  Money Back
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  24/7 Support
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Content Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reviews Section */}
          <div>
            <ReviewList 
              productId={id!} 
              showAddReviewButton={isAuthenticated && !hasUserReviewed} 
              onAddReviewClick={() => {
                navigate(`/review/${id}/ORDER_ID_HERE`);
              }}
            />
          </div>

          {/* Similar Products */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-gray-600" />
              Similar Products
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      Premium Design {item}
                    </p>
                    <p className="text-xs text-gray-600">
                      Rp {(product.price + Math.floor(Math.random() * 10000)).toLocaleString("id-ID")}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-500 ml-1">
                        4.9 (127)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Instant Checkout Modal */}
      {product && (
        <InstantCheckoutModal
          product={product}
          isOpen={showInstantCheckout}
          onClose={() => setShowInstantCheckout(false)}
          isLoggedIn={isAuthenticated}
          userEmail={user?.email}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
