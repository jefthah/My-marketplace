const Product = require('../models/product');
const Review = require('../models/review');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const cloudinaryService = require('../services/cloudinaryService');

// Helper function to extract YouTube video ID
function extractYouTubeVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Helper function to calculate review statistics for products
async function calculateProductRatings(products) {
  const productIds = products.map(product => product._id);
  
  const reviewStats = await Review.aggregate([
    { $match: { product_id: { $in: productIds } } },
    {
      $group: {
        _id: '$product_id',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  // Create a map for easy lookup
  const statsMap = {};
  reviewStats.forEach(stat => {
    statsMap[stat._id.toString()] = {
      rating: Number((stat.averageRating || 0).toFixed(1)),
      totalReviews: stat.totalReviews || 0
    };
  });

  // Add rating and totalReviews to each product
  return products.map(product => {
    const productObj = product.toObject ? product.toObject() : product;
    const stats = statsMap[productObj._id.toString()] || { rating: 0, totalReviews: 0 };
    
    return {
      ...productObj,
      rating: stats.rating,
      totalReviews: stats.totalReviews
    };
  });
}

// Get all products with filters (Public)
exports.getProducts = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    minPrice,
    maxPrice,
    search,
    sort = '-createdAt'
  } = req.query;

  const query = { isActive: true };

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Search
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .populate('userID', 'username photo')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Calculate rating and total reviews for each product
  const productsWithRatings = await calculateProductRatings(products);

  const total = await Product.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      products: productsWithRatings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  );
});

// Get single product (Public)
exports.getProduct = asyncHandler(async (req, res, next) => {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ApiError('Invalid product ID format', 400));
  }

  const product = await Product.findById(req.params.id)
    .populate('userID', 'username photo email');

  if (!product) {
    return next(new ApiError('Product not found', 404));
  }

  // Check if user still exists (populate might return null if user was deleted)
  if (!product.userID) {
    return next(new ApiError('Product seller no longer exists', 404));
  }

  // Calculate rating and total reviews for this product
  const productsWithRatings = await calculateProductRatings([product]);
  const productWithRating = productsWithRatings[0];

  // Transform product data untuk frontend
  const transformedProduct = {
    ...productWithRating,
    seller: {
      id: product.userID._id,
      username: product.userID.username,
      email: product.userID.email,
      profileImage: product.userID.photo,
      verified: true, // Add verification logic as needed
      positiveRating: 98 // Add rating calculation as needed
    },
    hasPreviewVideo: !!product.previewVideo?.videoId,
    embedVideoUrl: product.previewVideo?.embedUrl || null,
    videoThumbnail: product.previewVideo?.thumbnail || null
  };

  res.status(200).json(new ApiResponse(200, transformedProduct));
});

// Get products by category (Public)
exports.getProductsByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const query = { 
    category: category.toLowerCase(), 
    isActive: true 
  };

  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .populate('userID', 'username photo')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      products,
      category,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  );
});

// ===== ADMIN ONLY ENDPOINTS =====

// Create product (Admin only)
exports.createProduct = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    price,
    category,
    benefit1,
    benefit2,
    benefit3,
    specifications,
    videoUrl,
    youtubePreviewUrl, // Add YouTube preview URL
    googleDriveUrl, // Add Google Drive URL
    sourceCodeDescription,
    sourceCodeVersion
  } = req.body;

  let productData = {
    title,
    description,
    price: Number(price),
    category: category.toLowerCase(),
    benefit1,
    benefit2,
    benefit3,
    userID: req.user.id, // Admin as seller
    images: [],
    videoUrl: videoUrl ? (Array.isArray(videoUrl) ? videoUrl : [videoUrl]) : [],
    hasSourceCode: false
  };

  // Add specifications if provided
  if (specifications) {
    productData.specifications = typeof specifications === 'string' 
      ? JSON.parse(specifications) 
      : specifications;
  }

  // Handle YouTube preview video
  if (youtubePreviewUrl) {
    const videoId = extractYouTubeVideoId(youtubePreviewUrl);
    if (videoId) {
      productData.previewVideo = {
        youtubeUrl: youtubePreviewUrl,
        videoId: videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      };
    }
  }

  // Handle image uploads
  if (req.files && req.files.images && req.files.images.length > 0) {
    try {
      const uploadedImages = await cloudinaryService.uploadMultipleImages(req.files.images, 'products');
      productData.images = uploadedImages.map(img => img.url);
    } catch (error) {
      return next(new ApiError('Failed to upload images', 500));
    }
  }

  // Handle Google Drive URL for source code
  if (googleDriveUrl && (typeof googleDriveUrl === 'string' ? googleDriveUrl.trim() : Array.isArray(googleDriveUrl) && googleDriveUrl[0]?.trim())) {
    const driveUrl = Array.isArray(googleDriveUrl) ? googleDriveUrl[0] : googleDriveUrl;
    console.log('Processing Google Drive URL for source code:', driveUrl);
    
    // Simple validation for Google Drive URL
    if (!driveUrl.includes('drive.google.com')) {
      return next(new ApiError('Please provide a valid Google Drive URL', 400));
    }
    
    // Extract file ID from Google Drive URL for direct download
    let fileId = '';
    const matches = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (matches) {
      fileId = matches[1];
    }
    
    productData.hasSourceCode = true;
    productData.sourceCode = {
      fileName: 'source-code.zip', // Generic filename for Google Drive
      originalName: 'source-code.zip',
      googleDriveUrl: driveUrl.trim(), // Store original URL
      googleDriveFileId: fileId, // Store file ID for direct download
      mimeType: 'application/zip',
      uploadDate: new Date(),
      description: sourceCodeDescription || '',
      version: sourceCodeVersion || '1.0',
      uploadedBy: req.user.id
    };
    
    console.log('Google Drive source code configured successfully');
  }

  // Legacy: Handle file upload for backward compatibility
  else if (req.files && req.files.sourceCode && req.files.sourceCode.length > 0) {
    const sourceCodeFile = req.files.sourceCode[0];
    
    console.log('Processing source code file:', sourceCodeFile.originalname);
    console.log('File buffer size:', sourceCodeFile.buffer.length);
    
    try {
      // Upload to Cloudinary instead of local storage
      const uploadResult = await cloudinaryService.uploadZipFile(
        sourceCodeFile.buffer,
        sourceCodeFile.originalname,
        {
          folder: 'marketplace-source-codes',
          public_id: `${Date.now()}_${Math.round(Math.random() * 1E9)}_${sourceCodeFile.originalname.replace(/\.zip$/i, '')}`
        }
      );

      productData.hasSourceCode = true;
      productData.sourceCode = {
        fileName: sourceCodeFile.originalname,
        originalName: sourceCodeFile.originalname,
        cloudinaryUrl: uploadResult.url, // Store Cloudinary URL
        cloudinaryPublicId: uploadResult.publicId,
        mimeType: sourceCodeFile.mimetype || 'application/zip',
        fileSize: uploadResult.fileSize || sourceCodeFile.size,
        uploadDate: new Date(),
        description: sourceCodeDescription || '',
        version: sourceCodeVersion || '1.0',
        uploadedBy: req.user.id
      };
      
      console.log('Source code uploaded to Cloudinary successfully:', uploadResult.url);
    } catch (error) {
      console.error('Failed to upload source code:', error);
      return next(new ApiError('Failed to upload source code file', 500));
    }
  }

  const product = await Product.create(productData);
  await product.populate('userID', 'username email');

  res.status(201).json(
    new ApiResponse(201, product, 'Product created successfully')
  );
});

// Update product (Admin only)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ApiError('Product not found', 404));
  }

  // Check if user is admin or product owner
  if (product.userID.toString() !== req.user.id && req.user.roleID.roleName !== 'admin') {
    return next(new ApiError('Not authorized to update this product', 403));
  }

  const {
    title,
    description,
    price,
    category,
    benefit1,
    benefit2,
    benefit3,
    specifications,
    videoUrl,
    isActive
  } = req.body;

  // Prepare update data
  let updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (price) updateData.price = Number(price);
  if (category) updateData.category = category.toLowerCase();
  if (benefit1) updateData.benefit1 = benefit1;
  if (benefit2) updateData.benefit2 = benefit2;
  if (benefit3) updateData.benefit3 = benefit3;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (videoUrl) {
    updateData.videoUrl = Array.isArray(videoUrl) ? videoUrl : [videoUrl];
  }

  // Handle specifications
  if (specifications) {
    updateData.specifications = typeof specifications === 'string' 
      ? JSON.parse(specifications) 
      : specifications;
  }

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    try {
      const uploadedImages = await cloudinaryService.uploadMultipleImages(req.files, 'products');
      // Add new images to existing ones
      updateData.images = [...(product.images || []), ...uploadedImages.map(img => img.url)];
    } catch (error) {
      return next(new ApiError('Failed to upload images', 500));
    }
  }

  product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate('userID', 'username email');

  res.status(200).json(
    new ApiResponse(200, product, 'Product updated successfully')
  );
});

// Delete product (Admin only)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ApiError('Product not found', 404));
  }

  // Check if user is admin or product owner
  if (product.userID.toString() !== req.user.id && req.user.roleID.roleName !== 'admin') {
    return next(new ApiError('Not authorized to delete this product', 403));
  }

  // Soft delete
  product.isActive = false;
  await product.save();

  res.status(200).json(
    new ApiResponse(200, {}, 'Product deleted successfully')
  );
});

// Hard delete product (Admin only)
exports.hardDeleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ApiError('Product not found', 404));
  }

  // Only admin can hard delete
  if (req.user.roleID.roleName !== 'admin') {
    return next(new ApiError('Only admin can permanently delete products', 403));
  }

  // Delete images from cloudinary if any
  if (product.images && product.images.length > 0) {
    try {
      // Extract public IDs from image URLs
      const publicIds = product.images.map(url => {
        const parts = url.split('/');
        const publicIdWithExt = parts[parts.length - 1];
        return publicIdWithExt.split('.')[0];
      });
      
      await cloudinaryService.deleteMultipleImages(publicIds);
    } catch (error) {
      console.error('Error deleting images from cloudinary:', error);
    }
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json(
    new ApiResponse(200, {}, 'Product permanently deleted')
  );
});

// Get admin products (Admin only)
exports.getAdminProducts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, sort = '-createdAt', includeInactive = false } = req.query;

  let query = {};
  
  // Admin can see their own products or all products
  if (req.user.roleID.roleName === 'admin') {
    // Show all products if admin, or just their own
    query = req.query.all === 'true' ? {} : { userID: req.user.id };
  } else {
    query.userID = req.user.id;
  }

  // Include inactive products if requested
  if (!includeInactive) {
    query.isActive = true;
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .populate('userID', 'username email')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  );
});

// Get product statistics (Admin only)
exports.getProductStats = asyncHandler(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
        inactiveProducts: { $sum: { $cond: ['$isActive', 0, 1] } },
        averagePrice: { $avg: '$price' },
        totalValue: { $sum: '$price' }
      }
    }
  ]);

  const categoryStats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      general: stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        averagePrice: 0,
        totalValue: 0
      },
      categories: categoryStats
    })
  );
});

// Remove specific images from product (Admin only)
exports.removeProductImages = asyncHandler(async (req, res, next) => {
  const { imageUrls } = req.body;
  
  if (!imageUrls || !Array.isArray(imageUrls)) {
    return next(new ApiError('Please provide array of image URLs to remove', 400));
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ApiError('Product not found', 404));
  }

  // Check authorization
  if (product.userID.toString() !== req.user.id && req.user.roleID.roleName !== 'admin') {
    return next(new ApiError('Not authorized to update this product', 403));
  }

  // Remove images from product
  const updatedImages = product.images.filter(img => !imageUrls.includes(img));
  
  product.images = updatedImages;
  await product.save();

  // Delete images from cloudinary
  try {
    const publicIds = imageUrls.map(url => {
      const parts = url.split('/');
      const publicIdWithExt = parts[parts.length - 1];
      return publicIdWithExt.split('.')[0];
    });
    
    await cloudinaryService.deleteMultipleImages(publicIds);
  } catch (error) {
    console.error('Error deleting images from cloudinary:', error);
  }

  res.status(200).json(
    new ApiResponse(200, product, 'Images removed successfully')
  );
});