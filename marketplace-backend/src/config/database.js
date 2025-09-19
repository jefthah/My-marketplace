const mongoose = require('mongoose');

// Configure mongoose for serverless
mongoose.set('bufferCommands', false);

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached database connection');
    return cachedConnection;
  }
  
  try {
    console.log('🔄 Creating new database connection...');
    
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 0, // No timeout
      maxPoolSize: 1, // Single connection for serverless
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
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