// Load environment variables
require('dotenv').config();

// Always export the main app. If it fails to load, return explicit 500.
try {
  module.exports = require('../src/app');
  // eslint-disable-next-line no-console
  console.log('✅ Main app loaded');
} catch (error) {
  const express = require('express');
  const app = express();
  app.get('*', (_req, res) => {
    res.status(500).json({
      success: false,
      message: 'Failed to load main application',
      error: error.message
    });
  });
  module.exports = app;
}
