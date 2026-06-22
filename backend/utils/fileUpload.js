/**
 * File Upload Utility
 * 
 * Handles file uploads to Cloudinary
 * Supports:
 * - Images (listings, profiles, messages)
 * - Videos (listing media)
 * - File validation and compression
 */

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload single image to Cloudinary
 */
const uploadImage = async (fileBuffer, folder = 'rental-marketplace') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
        width: 800,
        crop: 'limit'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          size: result.bytes
        });
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * Upload multiple images
 */
const uploadMultipleImages = async (fileBuffers, folder = 'rental-marketplace') => {
  try {
    const uploadPromises = fileBuffers.map(buffer => uploadImage(buffer, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Upload video to Cloudinary
 */
const uploadVideo = async (fileBuffer, folder = 'rental-marketplace') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'video',
        chunk_size: 6000000, // 6MB chunks for large videos
        quality: 'auto',
        fetch_format: 'auto'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result.secure_url,
          publicId: result.public_id,
          duration: result.duration,
          size: result.bytes
        });
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * Validate image file
 */
const validateImageFile = (file) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Invalid image format. Allowed: JPEG, PNG, WebP, GIF');
  }

  if (file.size > maxSize) {
    throw new Error('Image size exceeds 5MB limit');
  }

  return true;
};

/**
 * Validate video file
 */
const validateVideoFile = (file) => {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Invalid video format. Allowed: MP4, WebM, MOV');
  }

  if (file.size > maxSize) {
    throw new Error('Video size exceeds 100MB limit');
  }

  return true;
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  uploadVideo,
  validateImageFile,
  validateVideoFile
};
