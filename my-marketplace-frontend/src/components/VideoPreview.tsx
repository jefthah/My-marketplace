import React, { useState } from 'react'
import { PlayCircle, Video, Youtube, ExternalLink } from 'lucide-react'
import './VideoPreview.css'

interface VideoPreviewProps {
  product: {
    hasPreviewVideo?: boolean
    embedVideoUrl?: string | null
    videoThumbnail?: string | null
    videoUrl?: string[] // Field yang sudah ada di data
    previewVideo?: {
      youtubeUrl?: string
      videoId?: string
      embedUrl?: string
      thumbnail?: string
    }
  }
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ product }) => {
  const [showVideo, setShowVideo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Helper function to extract YouTube video ID
  const extractYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // Helper function to convert YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  // Helper function to get thumbnail URL with 1920x1080 resolution
  const getThumbnailUrl = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      // Try maxresdefault first (1920x1080), fallback to hqdefault (480x360) if not available
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  }

  // Check if video is available - prioritize existing videoUrl field
  const hasVideo = (product.videoUrl && product.videoUrl.length > 0) || 
    product.hasPreviewVideo || 
    (product.previewVideo && product.previewVideo.videoId) ||
    product.embedVideoUrl

  // Get video data - prioritize existing videoUrl field
  let embedUrl, thumbnail, youtubeUrl;
  
  if (product.videoUrl && product.videoUrl.length > 0) {
    // Use existing videoUrl field
    youtubeUrl = product.videoUrl[0];
    embedUrl = getEmbedUrl(youtubeUrl);
    thumbnail = getThumbnailUrl(youtubeUrl);
  } else {
    // Fallback to previewVideo fields
    embedUrl = product.embedVideoUrl || product.previewVideo?.embedUrl;
    thumbnail = product.videoThumbnail || product.previewVideo?.thumbnail;
    youtubeUrl = product.previewVideo?.youtubeUrl;
  }

  if (!hasVideo) {
    return (
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center shadow-xl">
        <Video className="h-16 w-16 mx-auto mb-4 opacity-80" />
        <h3 className="text-xl font-bold mb-2">Preview Video</h3>
        <p className="text-sm opacity-90">No preview video available</p>
        <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-3">
          <p className="text-xs">Video preview will be shown here when available</p>
        </div>
      </div>
    )
  }

  const handlePlayVideo = () => {
    setIsLoading(true)
    setShowVideo(true)
    // Simulate loading time
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-3">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <Youtube className="h-5 w-5 mr-2" />
            <h3 className="font-semibold text-base">Video Preview</h3>
          </div>
          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-white/80 hover:text-white transition-colors text-sm"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              YouTube
            </a>
          )}
        </div>
      </div>
      
      {/* Video Content Container */}
      <div className="relative w-full bg-gray-100" style={{ aspectRatio: '16/9' }}>
        {showVideo && embedUrl ? (
          <div className="w-full h-full">
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-full bg-blue-900">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent mb-3"></div>
                  <p className="text-white text-sm">Loading video...</p>
                </div>
              </div>
            ) : (
              <iframe
                src={`${embedUrl}?autoplay=1&rel=0&modestbranding=1`}
                title="Product Preview Video"
                className="w-full h-full"
                style={{ border: 'none' }}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        ) : (
          <div 
            className="relative w-full h-full cursor-pointer group overflow-hidden"
            onClick={handlePlayVideo}
          >
            {/* Thumbnail Background */}
            {thumbnail ? (
              <>
                <img 
                  src={thumbnail}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.includes('maxresdefault')) {
                      const videoId = extractYouTubeVideoId(youtubeUrl || '');
                      if (videoId) {
                        target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      }
                    }
                  }}
                />
                <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-blue-900/30 transition-all duration-300" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700" />
            )}
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/95 hover:bg-white rounded-full p-3 shadow-lg transform group-hover:scale-110 transition-all duration-300 backdrop-blur-sm">
                <PlayCircle className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            
            {/* Info text */}
            <div className="absolute bottom-3 left-3">
              <p className="text-sm text-white bg-blue-900/50 px-2 py-1 rounded backdrop-blur-sm">
                Click to play
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video Info Footer */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Youtube className="h-4 w-4 mr-2 text-blue-600" />
            <span className="font-medium">Hosted on YouTube</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full">
              <PlayCircle className="h-3 w-3 mr-1" />
              HD Quality
            </span>
          </div>
        </div>
        
        {showVideo && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => setShowVideo(false)}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              ← Close video
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoPreview
