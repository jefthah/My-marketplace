import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Send, Loader2 } from 'lucide-react';
import { reviewService, type CreateReviewData } from '../services/reviewService';
import { useAuth } from '../hooks/useAuth';

interface LocationState {
  productName?: string;
  productImage?: string;
  productId?: string;
  orderId?: string;
}

interface ReviewFormData {
  rating: number;
  comment: string;
}

const ReviewPage = () => {
  const { productId, orderId } = useParams<{ productId: string; orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as LocationState;

  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    const checkReviewPermission = async () => {
      if (!productId || !orderId || !user) {
        setErrorMessage('Data tidak lengkap atau Anda belum login');
        setIsLoading(false);
        return;
      }

      try {
        const response = await reviewService.canUserReview(productId, orderId);
        console.log('CanReview response:', response); // Debug log
        
        if (response.canReview) {
          setCanReview(true);
        } else {
          // Backend mengembalikan reason sebagai string, bukan enum
          if (response.reason?.includes('sudah memberikan ulasan')) {
            setErrorMessage('Anda sudah memberikan ulasan untuk produk ini');
          } else if (response.reason?.includes('tidak ditemukan') || response.reason?.includes('belum confirmed')) {
            setErrorMessage('Order tidak valid atau belum confirmed');
          } else if (response.reason?.includes('tidak ditemukan dalam order')) {
            setErrorMessage('Produk tidak ditemukan dalam order ini');
          } else {
            setErrorMessage(response.reason || 'Anda tidak dapat memberikan ulasan untuk produk ini');
          }
        }
      } catch (error) {
        console.error('Error checking review permission:', error);
        setErrorMessage('Terjadi kesalahan saat mengecek permission');
      } finally {
        setIsLoading(false);
      }
    };

    checkReviewPermission();
  }, [productId, orderId, user]);

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rating) {
      setErrorMessage('Silakan berikan rating');
      return;
    }

    if (!productId || !orderId) {
      setErrorMessage('Data tidak lengkap');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const reviewData: CreateReviewData = {
        rating: formData.rating,
        comment: formData.comment.trim(),
        product_id: productId,
        order_id: orderId
      };

      await reviewService.createReview(reviewData);
      
      // Redirect ke order detail dengan success message
      navigate(`/order/${orderId}`, {
        state: { reviewSuccess: true }
      });
    } catch (error) {
      console.error('Error creating review:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Gagal mengirim ulasan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredRating || formData.rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = () => {
    const rating = hoveredRating || formData.rating;
    switch (rating) {
      case 1: return 'Sangat Buruk';
      case 2: return 'Buruk';
      case 3: return 'Cukup';
      case 4: return 'Baik';
      case 5: return 'Sangat Baik';
      default: return 'Berikan rating';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-gray-600">Memuat...</span>
        </div>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Tidak Dapat Memberikan Ulasan</h1>
              <p className="text-gray-600">{errorMessage}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Beri Ulasan</h1>
          <p className="text-gray-600 mt-2">Bagikan pengalaman Anda dengan produk ini</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Product Info */}
          {(state?.productName || state?.productImage) && (
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center space-x-4">
                {state.productImage && (
                  <img
                    src={state.productImage}
                    alt={state.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {state.productName || 'Produk'}
                  </h2>
                  <p className="text-sm text-gray-500">Ulasan untuk produk ini</p>
                </div>
              </div>
            </div>
          )}

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Rating Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rating *
              </label>
              <div className="flex items-center space-x-4">
                {renderStars()}
                <span className={`text-sm font-medium ${
                  formData.rating > 0 ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {getRatingText()}
                </span>
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-3">
                Ulasan (Opsional)
              </label>
              <textarea
                id="comment"
                value={formData.comment}
                onChange={handleCommentChange}
                rows={4}
                placeholder="Ceritakan pengalaman Anda dengan produk ini..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Berikan ulasan yang jujur dan membantu untuk pembeli lain
                </p>
                <span className="text-sm text-gray-400">
                  {formData.comment.length}/1000
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!formData.rating || isSubmitting}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Kirim Ulasan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-3">Tips Ulasan yang Baik:</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Berikan penilaian yang jujur berdasarkan pengalaman Anda</li>
            <li>• Sebutkan aspek yang Anda suka atau tidak suka dari produk</li>
            <li>• Bantu pembeli lain dengan memberikan detail yang berguna</li>
            <li>• Gunakan bahasa yang sopan dan konstruktif</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
