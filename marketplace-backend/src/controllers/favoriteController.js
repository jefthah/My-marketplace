const Favorite = require('../models/favorite');
const Product = require('../models/product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Add product to favorites
// @route   POST /api/favorites/:productId
// @access  Private
exports.addToFavorites = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError('Product not found', 404));
  }

  // Check if already in favorites
  const existingFavorite = await Favorite.findOne({
    userID: userId,
    productID: productId
  });

  if (existingFavorite) {
    return next(new ApiError('Product already in favorites', 400));
  }

  // Add to favorites
  const favorite = await Favorite.create({
    userID: userId,
    productID: productId
  });

  res.status(201).json(
    new ApiResponse(201, { favorite }, 'Product added to favorites successfully')
  );
});

// @desc    Remove product from favorites
// @route   DELETE /api/favorites/:productId
// @access  Private
exports.removeFromFavorites = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const favorite = await Favorite.findOneAndDelete({
    userID: userId,
    productID: productId
  });

  if (!favorite) {
    return next(new ApiError('Product not in favorites', 404));
  }

  res.json(
    new ApiResponse(200, null, 'Product removed from favorites successfully')
  );
});

// @desc    Get user's favorite products
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const favorites = await Favorite.find({ userID: userId })
    .populate({
      path: 'productID',
      select: 'title description price images category rating totalReviews isActive',
      match: { isActive: true }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Filter out favorites where product was deleted or inactive
  const validFavorites = favorites.filter(fav => fav.productID);

  const totalFavorites = await Favorite.countDocuments({ 
    userID: userId,
    productID: { $in: await Product.find({ isActive: true }).distinct('_id') }
  });

  const favoriteProducts = validFavorites.map(favorite => ({
    id: favorite.productID._id,
    title: favorite.productID.title,
    description: favorite.productID.description,
    price: favorite.productID.price,
    image: favorite.productID.images?.[0] || 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image',
    category: favorite.productID.category,
    rating: favorite.productID.rating || 0,
    totalReviews: favorite.productID.totalReviews || 0,
    addedAt: favorite.createdAt
  }));

  res.json(
    new ApiResponse(200, {
      favorites: favoriteProducts,
      pagination: {
        page,
        limit,
        total: totalFavorites,
        pages: Math.ceil(totalFavorites / limit)
      }
    }, 'Favorites retrieved successfully')
  );
});

// @desc    Check if product is in user's favorites
// @route   GET /api/favorites/check/:productId
// @access  Private
exports.checkFavorite = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const favorite = await Favorite.findOne({
    userID: userId,
    productID: productId
  });

  res.json(
    new ApiResponse(200, { isFavorite: !!favorite }, 'Favorite status checked')
  );
});

// @desc    Toggle favorite status
// @route   POST /api/favorites/toggle/:productId
// @access  Private
exports.toggleFavorite = asyncHandler(async (req, res, next) => {
  console.log('=== TOGGLE FAVORITE REQUEST ===');
  console.log('User ID:', req.user.id);
  console.log('Product ID:', req.params.productId);
  
  const { productId } = req.params;
  const userId = req.user.id;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    console.log('Product not found:', productId);
    return next(new ApiError('Product not found', 404));
  }

  console.log('Product found:', product.name);

  // Check if already in favorites
  const existingFavorite = await Favorite.findOne({
    userID: userId,
    productID: productId
  });

  console.log('Existing favorite:', existingFavorite);

  if (existingFavorite) {
    // Remove from favorites
    console.log('Removing from favorites');
    await Favorite.findByIdAndDelete(existingFavorite._id);
    res.json(
      new ApiResponse(200, { isFavorite: false }, 'Product removed from favorites')
    );
  } else {
    // Add to favorites
    console.log('Adding to favorites');
    await Favorite.create({
      userID: userId,
      productID: productId
    });
    res.json(
      new ApiResponse(201, { isFavorite: true }, 'Product added to favorites')
    );
  }
});
