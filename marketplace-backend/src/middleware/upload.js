const multer = require('multer');
const path = require('path');
const fs = require('fs');

// On serverless (e.g., Vercel) the filesystem is read-only except for /tmp
// Use /tmp for any disk operations; images already use memory storage
const baseDir = process.env.VERCEL ? '/tmp' : '.';
// Ensure upload directories exist (only for disk usage)
const uploadDirs = [`${baseDir}/uploads/images`, `${baseDir}/uploads/source-codes`];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage for product images (memory storage for Cloudinary)
const imageStorage = multer.memoryStorage();

// Storage for source code files (disk storage)
const sourceCodeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${baseDir}/uploads/source-codes`);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1E9)}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// File filter for source code
const sourceCodeFilter = (req, file, cb) => {
  if (file.mimetype === 'application/zip' || 
      file.mimetype === 'application/x-zip-compressed' ||
      path.extname(file.originalname).toLowerCase() === '.zip') {
    cb(null, true);
  } else {
    cb(new Error('Source code must be a ZIP file'), false);
  }
};

// Upload middleware for product images only
const uploadProductImages = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 2
  },
  fileFilter: imageFilter
}).array('images', 2);

// Upload middleware for source code only
const uploadSourceCode = multer({
  storage: sourceCodeStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for source code
    files: 1
  },
  fileFilter: sourceCodeFilter
}).single('sourceCode');

// Combined upload middleware for products with source code
const uploadProductWithSourceCode = multer({
  storage: multer.memoryStorage(), // Use memory for all files initially
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'images') {
      // Validate images
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for images field'), false);
      }
    } else if (file.fieldname === 'sourceCode') {
      // Validate source code ZIP files
      if (file.mimetype === 'application/zip' || 
          file.mimetype === 'application/x-zip-compressed' ||
          path.extname(file.originalname).toLowerCase() === '.zip') {
        cb(null, true);
      } else {
        cb(new Error('Source code must be a ZIP file'), false);
      }
    } else {
      cb(new Error(`Unexpected field: ${file.fieldname}`), false);
    }
  }
}).fields([
  { name: 'images', maxCount: 2 },
  { name: 'sourceCode', maxCount: 1 }
]);

// Simple photo upload for user profiles
const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: imageFilter
}).single('photo');

module.exports = {
  uploadProductImages,
  uploadSourceCode,
  uploadProductWithSourceCode,
  uploadPhoto
};
