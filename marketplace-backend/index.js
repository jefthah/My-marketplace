require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/database');

// Connect to database
connectDB().catch(console.error);

// Export for Vercel
module.exports = app;