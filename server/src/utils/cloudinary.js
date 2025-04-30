import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload media (image/video) to Cloudinary
 * @param {string} file - File path or base64 string
 * @param {string} folder - Cloudinary folder to upload to
 * @param {boolean} isVideo - Whether the media is a video
 * @returns {Promise<object>} - Cloudinary upload response
 */
export const uploadMedia = async (file, folder = 'gym-management', isVideo = false) => {
  try {
    const options = {
      folder,
      resource_type: isVideo ? 'video' : 'image'
    };
    
    const result = await cloudinary.uploader.upload(file, options);
    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload media to Cloudinary');
  }
};

/**
 * Delete media (image/video) from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the media
 * @param {boolean} isVideo - Whether the media is a video
 * @returns {Promise<object>} - Cloudinary deletion response
 */
export const deleteMedia = async (publicId, isVideo = false) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: isVideo ? 'video' : 'image'
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete media from Cloudinary');
  }
};

export default {
  uploadMedia,
  deleteMedia
}; 