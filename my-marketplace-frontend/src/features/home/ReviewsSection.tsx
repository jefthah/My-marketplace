"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Star, Quote } from "lucide-react"
import { reviewService } from "../../services/reviewService"

interface Review {
  _id: string
  rating: number
  comment: string
  user_id: {
    username: string
    profileImage?: string
  }
  product_id: {
    title: string
  }
  createdAt: string
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  rating5: number
  rating4: number
  rating3: number
  rating2: number
  rating1: number
}

const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch latest reviews for display
        const response = await reviewService.getAllReviews({
          page: 1,
          limit: 3,
          sort: 'newest'
        })

        if (response.success) {
          setReviews(response.data.reviews as unknown as Review[])
          setStats(response.data.statistics || null)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 hari yang lalu'
    if (diffDays < 7) return `${diffDays} hari yang lalu`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} minggu yang lalu`
    return `${Math.ceil(diffDays / 30)} bulan yang lalu`
  }

  const getAvatarUrl = (username: string, profileImage?: string) => {
    if (profileImage) {
      // If it's already a base64 data URL from backend, use it directly
      if (profileImage.startsWith('data:image/')) {
        return profileImage;
      }
      // If it's a file path, construct URL (though this shouldn't happen with Buffer storage)
      return profileImage;
    }
    // Default avatar using ui-avatars.com
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=3B82F6&color=fff`;
  }



  return (
    <section id="reviews" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">
            Apa Kata <span className="text-blue-600">Pelanggan Kami</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ribuan bisnis telah mempercayai kami untuk kebutuhan design mereka
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats ? stats.totalReviews : '0'}
            </div>
            <div className="text-gray-600">Total Reviews</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <span className="text-3xl font-bold text-blue-600 mr-2">
                {stats ? stats.averageRating.toFixed(1) : '0.0'}
              </span>
              <Star className="w-8 h-8 text-yellow-400 fill-current" />
            </div>
            <div className="text-gray-600">Rating Rata-rata</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats ? Math.round(((stats.rating4 + stats.rating5) / stats.totalReviews) * 100) : 0}%
            </div>
            <div className="text-gray-600">Kepuasan Pelanggan</div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded mb-4"></div>
                <div className="flex mb-4 space-x-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-5 h-5 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            reviews.map((review) => {
              return (
                <div key={review._id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <Quote className="w-8 h-8 text-blue-200 mb-4" />
                  
                  {/* Rating */}
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 mb-6 italic">"{review.comment}"</p>

                  {/* User Info */}
                  <div className="flex items-center">
                    <img
                      src={getAvatarUrl(review.user_id.username, review.user_id.profileImage)}
                      alt={review.user_id.username}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getAvatarUrl(review.user_id.username);
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-blue-900">{review.user_id.username}</h4>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/reviews" className="btn-primary text-white px-8 py-3 rounded-full">
            Lihat Semua Reviews
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ReviewsSection