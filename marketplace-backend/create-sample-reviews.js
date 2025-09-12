// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const Review = require('./src/models/reviewSimple');
const Product = require('./src/models/product');
const User = require('./src/models/user');
const Order = require('./src/models/order');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const createSampleReviews = async () => {
  console.log('=== CREATING SAMPLE REVIEWS ===');
  
  try {
    // Get a sample product
    const product = await Product.findOne();
    if (!product) {
      console.log('❌ No product found');
      return;
    }

    // Get a sample user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No user found');
      return;
    }

    // Create a sample confirmed order first
    let order = await Order.findOne({ 
      userID: user._id, 
      productID: product._id,
      status: 'confirmed' 
    });

    if (!order) {
      order = await Order.create({
        userID: user._id,
        productID: product._id,
        unitPrice: product.price,
        quantity: 1,
        totalAmount: product.price,
        status: 'confirmed',
        orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      });
      console.log(`✅ Created sample order: ${order._id}`);
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user_id: user._id,
      product_id: product._id,
      order_id: order._id
    });

    if (existingReview) {
      console.log('❌ Review already exists for this product');
      return;
    }

    // Create sample reviews
    const sampleReviews = [
      {
        user_id: user._id,
        product_id: product._id,
        order_id: order._id,
        rating: 5,
        comment: "Amazing quality and lightning-fast delivery. The design exceeded my expectations! Perfect for my business website.",
        is_verified_purchase: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }
    ];

    // Try to get another user for diversity
    const allUsers = await User.find().limit(3);
    
    if (allUsers.length > 1) {
      // Create another order for second user
      const secondUser = allUsers[1];
      let secondOrder = await Order.findOne({ 
        userID: secondUser._id, 
        productID: product._id,
        status: 'confirmed' 
      });

      if (!secondOrder) {
        secondOrder = await Order.create({
          userID: secondUser._id,
          productID: product._id,
          unitPrice: product.price,
          quantity: 1,
          totalAmount: product.price,
          status: 'confirmed',
          orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        });
      }

      sampleReviews.push({
        user_id: secondUser._id,
        product_id: product._id,
        order_id: secondOrder._id,
        rating: 5,
        comment: "Perfect design, exactly what I needed for my business. Professional quality and great customer service!",
        is_verified_purchase: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      });
    }

    if (allUsers.length > 2) {
      // Create third review
      const thirdUser = allUsers[2];
      let thirdOrder = await Order.findOne({ 
        userID: thirdUser._id, 
        productID: product._id,
        status: 'confirmed' 
      });

      if (!thirdOrder) {
        thirdOrder = await Order.create({
          userID: thirdUser._id,
          productID: product._id,
          unitPrice: product.price,
          quantity: 1,
          totalAmount: product.price,
          status: 'confirmed',
          orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        });
      }

      sampleReviews.push({
        user_id: thirdUser._id,
        product_id: product._id,
        order_id: thirdOrder._id,
        rating: 4,
        comment: "Great product with excellent features. Very satisfied with the purchase. Highly recommended!",
        is_verified_purchase: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      });
    }

    // Create the reviews
    for (let i = 0; i < sampleReviews.length; i++) {
      try {
        const review = await Review.create(sampleReviews[i]);
        console.log(`✅ Created review ${i + 1}: ${review._id} (Rating: ${review.rating})`);
      } catch (error) {
        console.log(`❌ Failed to create review ${i + 1}:`, error.message);
      }
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`Product: ${product.title} (${product._id})`);
    console.log(`Total reviews for this product: ${await Review.countDocuments({ product_id: product._id })}`);

  } catch (error) {
    console.error('Error creating sample reviews:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await createSampleReviews();
};

main();
