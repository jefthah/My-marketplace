const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = require('../src/app');
const connectDB = require('../src/config/database');

// Connect to database
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await connectDB();
    isConnected = true;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    // Ensure database is connected
    await connectToDatabase();
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};