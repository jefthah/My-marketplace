const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: false, // Optional - will be input from frontend
    trim: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return this.images.length >= 1 && this.images.length <= 2;
      },
      message: 'Minimum 1 image required, maximum 2 images allowed'
    }
  }],
  videoUrl: [{
    type: String,
    validate: {
      validator: function(v) {
        return this.videoUrl.length <= 3;
      },
      message: 'Maximum 3 videos allowed'
    }
  }],
  // YouTube Preview Video
  previewVideo: {
    youtubeUrl: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
          return youtubeRegex.test(v);
        },
        message: 'Please provide a valid YouTube URL'
      }
    },
    videoId: {
      type: String
    },
    embedUrl: {
      type: String
    },
    thumbnail: {
      type: String
    },
    title: {
      type: String
    },
    duration: {
      type: String
    }
  },
  // Benefits instead of tags
  benefit1: {
    type: String,
    required: [true, 'Benefit 1 is required'],
    trim: true,
    maxlength: [100, 'Benefit 1 cannot exceed 100 characters']
  },
  benefit2: {
    type: String,
    required: [true, 'Benefit 2 is required'],
    trim: true,
    maxlength: [100, 'Benefit 2 cannot exceed 100 characters']
  },
  benefit3: {
    type: String,
    required: [true, 'Benefit 3 is required'],
    trim: true,
    maxlength: [100, 'Benefit 3 cannot exceed 100 characters']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  specifications: {
    type: Map,
    of: String
  },
  // Source Code Information (for digital products)
  hasSourceCode: {
    type: Boolean,
    default: false
  },
  sourceCode: {
    fileName: {
      type: String
    },
    originalName: {
      type: String
    },
    // Google Drive approach
    googleDriveUrl: {
      type: String // Store Google Drive download link
    },
    googleDriveFileId: {
      type: String // Store Google Drive file ID for future use
    },
    // Cloud storage (Cloudinary - keep for backward compatibility)
    cloudinaryUrl: {
      type: String // Store Cloudinary URL
    },
    cloudinaryPublicId: {
      type: String // For deletion if needed
    },
    // Database storage (keep for backward compatibility)
    fileData: {
      type: Buffer // Keep for backward compatibility
    },
    mimeType: {
      type: String
    },
    filePath: {
      type: String // Keep for backward compatibility
    },
    fileSize: {
      type: Number
    },
    uploadDate: {
      type: Date
    },
    description: {
      type: String,
      maxlength: [500, 'Source code description cannot exceed 500 characters']
    },
    version: {
      type: String,
      default: '1.0'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ userID: 1, isActive: 1 });

// Methods for YouTube video handling
productSchema.methods.setYouTubeVideo = function(youtubeUrl) {
  if (youtubeUrl) {
    const videoId = this.extractYouTubeVideoId(youtubeUrl);
    if (videoId) {
      this.previewVideo = {
        youtubeUrl: youtubeUrl,
        videoId: videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      };
    }
  }
};

productSchema.methods.extractYouTubeVideoId = function(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Pre-save middleware to process YouTube URL
productSchema.pre('save', function(next) {
  if (this.previewVideo && this.previewVideo.youtubeUrl && !this.previewVideo.videoId) {
    this.setYouTubeVideo(this.previewVideo.youtubeUrl);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);