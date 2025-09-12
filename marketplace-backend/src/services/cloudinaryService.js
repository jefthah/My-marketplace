// src/services/cloudinaryService.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  // Upload single image from buffer
  async uploadImage(buffer, options = {}) {
    try {
      const uploadOptions = {
        folder: options.folder || 'marketplace',
        transformation: [
          { width: 800, height: 600, crop: 'limit', quality: 'auto' },
          { format: 'webp' }
        ],
        ...options
      };

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  // Upload multiple images
  async uploadMultipleImages(filesArray, folder = 'products') {
    try {
      const uploadPromises = filesArray.map((file, index) => 
        this.uploadImage(file.buffer, { 
          folder: `marketplace/${folder}`,
          public_id: `${Date.now()}_${index}` // Unique ID for each image
        })
      );

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Multiple images upload error:', error);
      throw new Error('Failed to upload images to Cloudinary');
    }
  }

  // Delete image by public ID
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete image from Cloudinary');
    }
  }

  // Delete multiple images
  async deleteMultipleImages(publicIds) {
    try {
      const deletePromises = publicIds.map(publicId => this.deleteImage(publicId));
      const results = await Promise.all(deletePromises);
      return results;
    } catch (error) {
      console.error('Multiple images delete error:', error);
      throw new Error('Failed to delete images from Cloudinary');
    }
  }

  // Get optimized image URL with transformations
  getOptimizedImageUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
      transformation: [
        { 
          width: options.width || 400, 
          height: options.height || 300, 
          crop: options.crop || 'fill',
          quality: 'auto',
          format: 'webp'
        }
      ]
    });
  }

  // Upload ZIP file (raw file upload for source code)
  async uploadZipFile(buffer, fileName, options = {}) {
    try {
      const uploadOptions = {
        folder: options.folder || 'source-codes',
        resource_type: 'raw', // For non-image files
        public_id: options.public_id || `${Date.now()}_${fileName.replace(/\.(zip|rar)$/i, '')}`,
        format: 'zip',
        ...options
      };

      console.log('Uploading ZIP file to Cloudinary:', fileName);
      console.log('Buffer size:', buffer.length);

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary ZIP upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });

      console.log('ZIP file uploaded successfully:', result.secure_url);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        fileName: fileName,
        fileSize: result.bytes,
        format: result.format
      };
    } catch (error) {
      console.error('Cloudinary ZIP upload error:', error);
      throw new Error('Failed to upload ZIP file to Cloudinary');
    }
  }

  // Delete file from Cloudinary
  async deleteFile(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete file from Cloudinary');
    }
  }

  // Generate different sizes for responsive images
  generateResponsiveUrls(publicId) {
    const sizes = [
      { name: 'thumbnail', width: 150, height: 150 },
      { name: 'small', width: 300, height: 200 },
      { name: 'medium', width: 600, height: 400 },
      { name: 'large', width: 1200, height: 800 }
    ];

    return sizes.reduce((acc, size) => {
      acc[size.name] = this.getOptimizedImageUrl(publicId, {
        width: size.width,
        height: size.height,
        crop: 'fill'
      });
      return acc;
    }, {});
  }
}

module.exports = new CloudinaryService();