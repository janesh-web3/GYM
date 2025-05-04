import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Create Cloudinary storage configuration for Multer
 * @param {string} folder - The folder in Cloudinary to store uploads
 * @param {boolean} isVideo - Whether to handle videos (true) or images (false)
 * @returns {CloudinaryStorage} Configured storage for Multer
 */
export const getCloudinaryStorage = (folder = 'gym-management', isVideo = false) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      resource_type: isVideo ? 'video' : 'auto',
      allowed_formats: isVideo 
        ? ['mp4', 'mov', 'avi', 'webm'] 
        : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: isVideo ? [{ quality: 'auto' }] : [{ quality: 'auto:good' }]
    }
  });
};

export default {
  cloudinary,
  getCloudinaryStorage
}; 