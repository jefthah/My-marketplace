const dotenv = require('dotenv');
dotenv.config();

const app = require('../src/app');
const connectDB = require('../src/config/database');

// Connect to database for serverless
connectDB().catch(err => {
  console.error('Database connection failed:', err);
});

// Export the real Express app for Vercel
module.exports = app;
