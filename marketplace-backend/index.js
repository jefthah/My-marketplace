// Simple serverless function for Vercel
module.exports = (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Simple response for testing
    res.status(200).json({
      success: true,
      message: 'Marketplace Backend API is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production'
    });
    
  } catch (error) {
    console.error('Error in serverless function:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};