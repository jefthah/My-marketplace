const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/cart');
const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (User login required)
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { productId, quantity, unitPrice } = req.body;
  const userID = req.user._id;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError('Product not found', 404));
  }

  // Check stock availability
  if (product.stock < quantity) {
    return next(new ApiError(`Insufficient stock. Available: ${product.stock}, Required: ${quantity}`, 400));
  }

  // Calculate total amount
  const totalAmount = unitPrice * quantity;

  // Create order
  const order = await Order.create({
    userID,
    productID: productId,  // Database field masih productID
    unitPrice,
    quantity,
    totalAmount
  });

  // Update product stock
  await Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: -quantity } }
  );

  // Remove item from cart if exists
  await Cart.findOneAndDelete({ userID, productID: productId });

  // Populate product details
  await order.populate('productID', 'title images category');
  await order.populate('userID', 'username email');

  res.status(201).json(
    new ApiResponse(201, order, 'Order created successfully')
  );
});

// @desc    Create order from cart
// @route   POST /api/orders/from-cart
// @access  Private (User login required)
exports.createOrderFromCart = asyncHandler(async (req, res, next) => {
  const userID = req.user._id;

  // Get user's cart items from database
  const cartItems = await Cart.find({ userID }).populate('productID');
  
  if (!cartItems || cartItems.length === 0) {
    return next(new ApiError('Cart is empty', 400));
  }

  const orders = [];

  // Create orders for each cart item
  for (const item of cartItems) {
    const product = item.productID;
    if (!product) {
      return next(new ApiError(`Product not found in cart item`, 404));
    }

    // Check stock availability
    if (product.stock < item.quantity) {
      return next(new ApiError(`Insufficient stock for ${product.title}. Available: ${product.stock}, Required: ${item.quantity}`, 400));
    }

    const unitPrice = product.price;
    const totalAmount = unitPrice * item.quantity;

    const order = await Order.create({
      userID,
      productID: product._id,
      unitPrice,
      quantity: item.quantity,
      totalAmount
    });

    // Update product stock
    await Product.findByIdAndUpdate(
      product._id,
      { $inc: { stock: -item.quantity } }
    );

    await order.populate('productID', 'title images category');
    orders.push(order);
  }

  // Clear cart after successful order creation
  await Cart.deleteMany({ userID });

  res.status(201).json(
    new ApiResponse(201, orders, 'Orders created successfully from cart')
  );
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private (User login required)
exports.getUserOrders = asyncHandler(async (req, res) => {
  const userID = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { userID };
  if (status) {
    query.status = status;
  }

  // Pagination
  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('productID', 'title images category price')
    .sort({ orderDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalOrders = await Order.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page * limit < totalOrders,
        hasPrev: page > 1
      }
    }, 'Orders retrieved successfully')
  );
});

// @desc    Get single order (supports both guest and user orders)
// @route   GET /api/orders/:id
// @access  Public (no authentication required for guest orders)
exports.getOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  // Find order by ID
  const order = await Order.findById(id)
    .populate('productID', 'title images category price description sourceCode')
    .populate('userID', 'username email name');

  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  // If there's a user in the request (logged in user), check authorization
  if (req.user) {
    const userRole = req.user.roleID?.roleName || req.user.role;
    const userID = req.user._id;
    
    // Admin can view any order
    if (userRole === 'admin') {
      // Allow admin to view
    } 
    // Regular user can only view their own orders
    else if (order.userID && order.userID._id.toString() !== userID.toString()) {
      return next(new ApiError('You are not authorized to view this order', 403));
    }
  }
  // If no user in request (guest access), allow viewing of guest orders
  // No additional checks needed for guest orders

  // Transform order data to include required fields
  const transformedOrder = {
    _id: order._id,
    orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-6)}`,
    status: order.status,
    customerEmail: order.guestEmail || (order.userID ? order.userID.email : 'customer@example.com'),
    customerName: order.userID ? (order.userID.name || order.userID.username) : 'Guest User',
    items: [{
      productId: order.productID._id,
      name: order.productID.title,
      unitPrice: order.unitPrice,
      quantity: order.quantity,
      downloadUrl: order.productID.sourceCode?.googleDriveUrl || order.productID.downloadUrl,
      image: order.productID.images?.[0] || '/api/placeholder/80/80',
      category: order.productID.category || 'digital'
    }],
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    paymentMethod: 'Midtrans',
    isGuestOrder: !order.userID
  };

  res.json(
    new ApiResponse(200, transformedOrder, 'Order retrieved successfully')
  );
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (User login required)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const userID = req.user._id;

  const order = await Order.findOne({ _id: id, userID });
  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  // Only allow certain status updates by user
  const allowedUserUpdates = ['cancelled'];
  if (!allowedUserUpdates.includes(status)) {
    return next(new ApiError('You can only cancel orders', 403));
  }

  // Don't allow cancellation of delivered orders
  if (order.status === 'delivered' && status === 'cancelled') {
    return next(new ApiError('Cannot cancel delivered orders', 400));
  }

  order.status = status;
  await order.save();

  await order.populate('productID', 'title images category');

  res.json(
    new ApiResponse(200, order, 'Order status updated successfully')
  );
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private (User login required)
exports.getOrderStats = asyncHandler(async (req, res) => {
  const userID = req.user._id;

  const stats = await Order.aggregate([
    { $match: { userID: userID } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  const totalOrders = await Order.countDocuments({ userID });
  const totalSpent = await Order.aggregate([
    { $match: { userID: userID, status: { $in: ['delivered', 'processing', 'shipped'] } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  res.json(
    new ApiResponse(200, {
      totalOrders,
      totalSpent: totalSpent[0]?.total || 0,
      statusBreakdown: stats
    }, 'Order statistics retrieved successfully')
  );
});

// ===== ADMIN ROUTES =====

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private (Admin only)
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;

  // Build query
  const query = {};
  if (status) {
    query.status = status;
  }

  // Pagination
  const skip = (page - 1) * limit;

  let orders = Order.find(query)
    .populate('productID', 'title images category price')
    .populate('userID', 'username email')
    .sort({ orderDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  if (search) {
    orders = orders.find({
      $or: [
        { 'userID.username': { $regex: search, $options: 'i' } },
        { 'userID.email': { $regex: search, $options: 'i' } },
        { 'productID.title': { $regex: search, $options: 'i' } }
      ]
    });
  }

  const result = await orders;
  const totalOrders = await Order.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      orders: result,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page * limit < totalOrders,
        hasPrev: page > 1
      }
    }, 'All orders retrieved successfully')
  );
});

// @desc    Get guest order by ID (no authentication required)
// @route   GET /api/orders/guest/:id
// @access  Public
exports.getGuestOrder = asyncHandler(async (req, res, next) => {
  console.log('🚀 GET GUEST ORDER CALLED!');
  const { id } = req.params;
  console.log('📋 Order ID:', id);

  const order = await Order.findById(id)
    .populate('productID', 'title images category price sourceCode')
    .populate('userID', 'name username email');

  if (!order) {
    console.log('❌ Order not found');
    return next(new ApiError('Order not found', 404));
  }

  console.log('=== GET GUEST ORDER ===');
  console.log('Order data:', {
    _id: order._id,
    guestEmail: order.guestEmail,
    userID: order.userID,
    isGuestOrder: order.isGuestOrder
  });

  // Transform order data to include required fields
  const transformedOrder = {
    _id: order._id,
    orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-6)}`,
    status: order.status,
    customerEmail: order.guestEmail || (order.userID ? order.userID.email : 'customer@example.com'),
    customerName: order.userID ? (order.userID.name || order.userID.username) : 'Guest User',
    items: [{
      productId: order.productID._id,
      name: order.productID.title,
      unitPrice: order.unitPrice,
      quantity: order.quantity,
      downloadUrl: order.productID.sourceCode?.googleDriveUrl || order.productID.downloadUrl,
      image: order.productID.images?.[0],
      category: order.productID.category
    }],
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    paymentMethod: order.paymentMethod || 'Midtrans',
    isGuestOrder: order.isGuestOrder || false
  };

  res.json(
    new ApiResponse(200, transformedOrder, 'Guest order retrieved successfully')
  );
});

// @desc    Update order status (User)
// @route   PUT /api/orders/:id/status
// @access  Private (User or Admin)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const userID = req.user._id;
  const userRole = req.user.role;

  // Validate status
  const allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed'];
  if (!allowedStatuses.includes(status)) {
    return next(new ApiError(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`, 400));
  }

  const order = await Order.findById(id);
  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  // Check if user has permission to update this order
  if (userRole !== 'admin' && order.userID?.toString() !== userID.toString()) {
    return next(new ApiError('You are not authorized to update this order', 403));
  }

  // Update order status
  order.status = status;
  await order.save();

  await order.populate('productID userID');

  res.json(
    new ApiResponse(200, order, 'Order status updated successfully')
  );
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/admin/:id/status
// @access  Private (Admin only)
exports.adminUpdateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, trackingNumber, estimatedDelivery } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

  await order.save();
  await order.populate('productID userID');

  res.json(
    new ApiResponse(200, order, 'Order status updated successfully')
  );
});

// @desc    Create instant order (for guest and logged users)
// @route   POST /api/orders/instant
// @access  Public/Private
exports.createInstantOrder = asyncHandler(async (req, res, next) => {
  const { productId, email, isGuest = false } = req.body;

  // Validate required fields
  if (!productId || !email) {
    return next(new ApiError('Product ID and email are required', 400));
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ApiError('Please provide a valid email address', 400));
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError('Product not found', 404));
  }

  if (!product.isActive) {
    return next(new ApiError('Product is not available', 400));
  }

  let userID = null;
  let guestEmail = email;

  // Handle authenticated users - check if user data is available from middleware
  // Since this is a public route, req.user might not be available even if token is sent
  if (!isGuest) {
    // Try to find user by email if not guest
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      userID = existingUser._id;
      guestEmail = null;
    }
  }

  // For guest users, check if we have a user with this email
  if (isGuest) {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      userID = existingUser._id;
      guestEmail = null;
    }
  }

  // Generate unique order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create instant order
  const orderData = {
    orderNumber,
    productID: product._id,
    unitPrice: product.price,
    quantity: 1,
    totalAmount: product.price,
    status: 'pending',
    paymentStatus: 'pending',
    isInstantOrder: true,
    guestEmail: guestEmail
  };

  // Add userID if available
  if (userID) {
    orderData.userID = userID;
  }

  const order = await Order.create(orderData);
  await order.populate('productID');

  res.status(201).json(
    new ApiResponse(201, order, 'Instant order created successfully')
  );
});

// @desc    Get download URL for order
// @route   GET /api/orders/:id/download-url
// @access  Public
exports.getOrderDownloadUrl = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find order
  const order = await Order.findById(id).populate('productID');
  console.log('Order found:', !!order);
  
  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  // Check if order is completed or confirmed
  if (order.status !== 'completed' && order.status !== 'confirmed') {
    return next(new ApiError('Order is not ready for download yet', 400));
  }

  // Check if product has source code file
  const product = order.productID;
  if (!product || !product.sourceCode) {
    return next(new ApiError('Source code file not found for this product', 404));
  }

  // Return download info instead of redirecting
  let downloadData = {
    orderId: order._id,
    productName: product.title,
    status: order.status
  };

  // Priority: Google Drive URL > Cloudinary URL > Database Buffer > Error
  if (product.sourceCode.googleDriveUrl) {
    // Convert Google Drive view URL to direct download URL
    let downloadUrl = product.sourceCode.googleDriveUrl;
    
    // Convert sharing URL to direct download URL
    if (downloadUrl.includes('/file/d/') && downloadUrl.includes('/view')) {
      const fileId = product.sourceCode.googleDriveFileId || downloadUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }
    
    downloadData.downloadUrl = downloadUrl;
    downloadData.downloadType = 'google-drive';
    downloadData.fileName = product.sourceCode.originalName || 'source-code.zip';
    console.log('Providing Google Drive URL for download:', downloadUrl);
  }
  else if (product.sourceCode.cloudinaryUrl) {
    // Use backend proxy URL instead of direct Cloudinary URL to avoid CORS issues
    downloadData.downloadUrl = `${req.protocol}://${req.get('host')}/api/orders/${id}/download`;
    downloadData.downloadType = 'api';
    downloadData.fileName = product.sourceCode.originalName || 'source-code.zip';
    downloadData.cloudinaryUrl = product.sourceCode.cloudinaryUrl; // Keep for reference
    console.log('Providing API proxy for Cloudinary URL:', product.sourceCode.cloudinaryUrl);
  } 
  else if (product.sourceCode.fileData) {
    downloadData.downloadUrl = `${req.protocol}://${req.get('host')}/api/orders/${id}/download`;
    downloadData.downloadType = 'api';
    downloadData.fileName = product.sourceCode.originalName || 'source-code.zip';
    console.log('Providing API endpoint for database download');
  } 
  else {
    return next(new ApiError('Source code file not available', 404));
  }

  res.status(200).json({
    success: true,
    data: downloadData
  });
});

// @desc    Download order file
// @route   GET /api/orders/:id/download
// @access  Public (No authentication required - but must be completed order)
exports.downloadOrderFile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find order
  const order = await Order.findById(id).populate('productID');
  
  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  // Check if order is completed or confirmed
  if (order.status !== 'completed' && order.status !== 'confirmed') {
    return next(new ApiError('Order is not ready for download yet', 400));
  }

  // Check if product has source code file
  const product = order.productID;
  if (!product || !product.sourceCode) {
    return next(new ApiError('Source code file not found for this product', 404));
  }

  // Priority: Google Drive URL > Cloudinary URL > Database Buffer > Error
  if (product.sourceCode.googleDriveUrl) {
    // Convert Google Drive view URL to direct download URL
    let downloadUrl = product.sourceCode.googleDriveUrl;
    
    // Convert sharing URL to direct download URL
    if (downloadUrl.includes('/file/d/') && downloadUrl.includes('/view')) {
      const fileId = product.sourceCode.googleDriveFileId || downloadUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }
    
    console.log('Redirecting to Google Drive URL:', downloadUrl);
    return res.redirect(downloadUrl);
  }
  else if (product.sourceCode.cloudinaryUrl) {
    // Redirect to Cloudinary URL for direct download
    console.log('Redirecting to Cloudinary URL:', product.sourceCode.cloudinaryUrl);
    return res.redirect(product.sourceCode.cloudinaryUrl);
  } 
  else if (product.sourceCode.fileData) {
    // Fallback to database buffer (for old products)
    console.log('Serving from database buffer');
    const fileData = product.sourceCode.fileData;
    const fileName = product.sourceCode.originalName || product.sourceCode.fileName || 'source-code.zip';
    const mimeType = product.sourceCode.mimeType || 'application/zip';
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', fileData.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    return res.end(fileData, 'binary');
  } 
  else {
    return next(new ApiError('Source code file not available', 404));
  }
});
