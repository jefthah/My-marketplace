// Load environment variables
require('dotenv').config();

// Import main application
const app = require('../src/app');

// Export for Vercel
module.exports = app;
