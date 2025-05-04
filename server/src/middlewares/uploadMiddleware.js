import multer from 'multer';
import { getCloudinaryStorage } from '../utils/cloudinaryStorage.js';
import path from 'path';

/**
 * Validate file type and size
 * @param {object} req - Express request object
 * @param {object} file - File object from multer
 * @param {function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  // Get file type from the request body or detect it from mimetype
  const fileType = req.body.type || 
    (file.mimetype.startsWith('image/') ? 'photo' : 
     file.mimetype.startsWith('video/') ? 'video' : 'unknown');
  
  // Set the file type in the request for later use
  req.fileType = fileType;
  
  // Allowed mime types for images and videos
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
  
  // Check if the file type is allowed
  if (fileType === 'photo' && allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (fileType === 'video' && allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (fileType === 'logo' && allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type. Allowed types for ${fileType}: ${
      fileType === 'photo' || fileType === 'logo' 
        ? 'JPG, PNG, GIF, WEBP' 
        : 'MP4, MOV, WEBM, AVI'
    }`), false);
  }
};

/**
 * Create upload middleware for specific entity and media type
 * @param {string} entityType - Type of entity ('gym' or 'branch')
 * @returns {object} Configured multer middleware
 */
export const createUploadMiddleware = (entityType = 'gym') => {
  return {
    /**
     * Single file upload middleware
     * @param {string} fieldName - Form field name
     * @param {string} mediaType - Media type ('logo', 'photo', 'video')
     * @returns {function} Multer middleware
     */
    single: (fieldName = 'file', mediaType = 'photo') => {
      const isVideo = mediaType === 'video';
      const folder = `${entityType}-${mediaType === 'logo' ? 'logos' : isVideo ? 'videos' : 'photos'}`;
      
      return multer({
        storage: getCloudinaryStorage(folder, isVideo),
        fileFilter,
        limits: {
          fileSize: isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024, // 50MB for videos, 10MB for images
        }
      }).single(fieldName);
    },
    
    /**
     * Multiple files upload middleware
     * @param {string} fieldName - Form field name
     * @param {string} mediaType - Media type ('photo', 'video')
     * @param {number} maxCount - Maximum number of files
     * @returns {function} Multer middleware
     */
    array: (fieldName = 'files', mediaType = 'photo', maxCount = 10) => {
      const isVideo = mediaType === 'video';
      const folder = `${entityType}-${isVideo ? 'videos' : 'photos'}`;
      
      return multer({
        storage: getCloudinaryStorage(folder, isVideo),
        fileFilter,
        limits: {
          fileSize: isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024, // 50MB for videos, 10MB for images
        }
      }).array(fieldName, maxCount);
    },
    
    /**
     * Error handler middleware for multer errors
     * @param {Error} err - Error object
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     * @param {function} next - Next middleware function
     */
    errorHandler: (err, req, res, next) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            success: false, 
            message: 'File too large. Maximum size is 10MB for images and 50MB for videos.' 
          });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ 
            success: false, 
            message: 'Too many files uploaded. Please try again with fewer files.' 
          });
        }
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        // Custom errors from fileFilter
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    }
  };
};

// Default middlewares for gym and branch uploads
export const gymUpload = createUploadMiddleware('gym');
export const branchUpload = createUploadMiddleware('branch'); 