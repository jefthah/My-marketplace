const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached database connection');
    return cachedConnection;
  }
  
  try {
    console.log('🔄 Creating new database connection...');
    
    // Sanitize connection string from deprecated/invalid options that may be present in env
    const rawUri = process.env.MONGODB_URI || '';
    let sanitizedUri = rawUri;
    try {
      // Remove known invalid/deprecated query params if they exist
      // Example: bufferMaxEntries, useNewUrlParser, useUnifiedTopology
      sanitizedUri = rawUri
        .replace(/([?&])(bufferMaxEntries|useNewUrlParser|useUnifiedTopology|poolSize|wtimeoutMS)=[^&]*&?/gi, '$1')
        // Remove trailing ? or & left behind
        .replace(/[?&]$/g, '');
      // As a last resort, drop the entire query string to avoid any invalid params
      if (/\?/.test(sanitizedUri)) {
        sanitizedUri = sanitizedUri.split('?')[0];
      }
      if (rawUri !== sanitizedUri) {
        console.log('⚠️  Detected and removed invalid MongoDB URI options from environment');
      }
    } catch (e) {
      // If anything goes wrong, fall back to raw URI
      sanitizedUri = rawUri;
    }

    // Simple connection for both local and serverless
    const connection = await mongoose.connect(sanitizedUri);
    
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