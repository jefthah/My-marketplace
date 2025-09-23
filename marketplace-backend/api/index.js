// Load environment variables
require('dotenv').config();

// Import app and DB connector
const app = require('../src/app');
const connectDB = require('../src/config/database');

// Vercel handler: ensure DB is connected before delegating to Express
module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not ready',
      error: error.message
    });
  }
  return app(req, res);
};
