const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

let app;
let dbConnected = false;

const initializeApp = async () => {
  if (!app) {
    try {
      // Import app after env is loaded
      app = require('../src/app');
      
      // Connect to database if not connected
      if (!dbConnected) {
        const connectDB = require('../src/config/database');
        await connectDB();
        dbConnected = true;
        console.log('Database connected for API');
      }
      
      return app;
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  }
  return app;
};

module.exports = async (req, res) => {
  try {
    const expressApp = await initializeApp();
    return expressApp(req, res);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'API initialization failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};