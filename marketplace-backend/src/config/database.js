const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached database connection');
    return cachedConnection;
  }
  
  try {
    console.log('🔄 Creating new database connection...');
    
    // Simple connection for both local and serverless
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    
    cachedConnection = connection;
    console.log('✅ Database connection established');
    return connection;
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    cachedConnection = null;
    throw error;
  }
};

module.exports = connectDB;