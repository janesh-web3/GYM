import { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary';

export interface MediaItem {
  _id?: string;
  type: 'photo' | 'video';
  url: string;
  public_id?: string;
  caption: string;
}

export interface MediaUploadResult {
  url: string;
  public_id: string;
  type: string;
  _id?: string;
  caption?: string;
}

/**
 * Validate media file before upload
 * @param file The file to validate
 * @param type The type of media (photo or video)
 * @returns Object with validation result and error message if invalid
 */
export const validateMediaFile = (
  file: File,
  type: 'photo' | 'video'
): { valid: boolean; error?: string } => {
  // Check file size (10MB limit for photos, 50MB for videos)
  const maxSize = type === 'photo' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${type === 'photo' ? '10MB' : '50MB'} limit`
    };
  }

  // Check file type
  const allowedTypes = type === 'photo' 
    ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] 
    : ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
    
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported format. Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`
    };
  }

  return { valid: true };
};

/**
 * Upload a single file to Cloudinary
 * @param file The file to upload
 * @param type The type of upload (photo, video)
 * @param entityId The ID of the entity (gym or branch)
 * @param entityType The type of entity (gym or branch)
 */
export const uploadMediaFile = async (
  file: File,
  type: 'photo' | 'video',
  entityId: string,
  entityType: 'gym' | 'branch' = 'gym'
): Promise<MediaItem> => {
  try {
    // Validate the file before uploading
    const validation = validateMediaFile(file, type);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }
    
    const result = await uploadToCloudinary(file, type, entityId, entityType);
    
    return {
      _id: (result as any)._id || Date.now().toString() + Math.random().toString(),
      type,
      url: result.url,
      public_id: result.public_id,
      caption: file.name
    };
  } catch (error) {
    console.error(`Error uploading file:`, error);
    // Enhance error message for network-related issues
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Network error: Please check your connection and ensure the server is running. (${error.message})`);
      } else if (error.message.includes('404')) {
        throw new Error(`Server endpoint not found: The upload endpoint doesn't exist or is not properly configured. Please check API routes.`);
      } else if (error.message.includes('401')) {
        throw new Error(`Authentication failed: Please log in again to upload files.`);
      }
    }
    throw error;
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param files Array of files to upload
 * @param type The type of upload (photo, video)
 * @param entityId The ID of the entity (gym or branch)
 * @param entityType The type of entity (gym or branch)
 */
export const uploadMultipleMediaFiles = async (
  files: File[],
  type: 'photo' | 'video',
  entityId: string,
  entityType: 'gym' | 'branch' = 'gym'
): Promise<MediaItem[]> => {
  try {
    // Validate files before uploading
    const invalidFiles = files.map(file => {
      const validation = validateMediaFile(file, type);
      return { file, validation };
    }).filter(item => !item.validation.valid);
    
    if (invalidFiles.length > 0) {
      throw new Error(`${invalidFiles.length} invalid file(s): ${invalidFiles.map(f => f.validation.error).join('; ')}`);
    }
    
    const results = await uploadMultipleToCloudinary(files, type, entityId, entityType);
    
    return results.map(result => ({
      _id: result._id || (Date.now().toString() + Math.random().toString()),
      type: type,
      url: result.url,
      public_id: result.public_id,
      caption: result.caption || ''
    }));
  } catch (error) {
    console.error(`Error uploading multiple files:`, error);
    // Enhance error message for network-related issues
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Network error: Please check your connection and ensure the server is running. (${error.message})`);
      } else if (error.message.includes('404')) {
        throw new Error(`Server endpoint not found: The upload endpoint doesn't exist or is not properly configured. Please check API routes.`);
      } else if (error.message.includes('401')) {
        throw new Error(`Authentication failed: Please log in again to upload files.`);
      }
    }
    throw error;
  }
};

/**
 * Delete a media item from Cloudinary
 * @param publicId The Cloudinary public ID of the file to delete
 * @param entityId The ID of the entity (gym or branch)
 * @param mediaId The ID of the media in the database
 * @param entityType The type of entity (gym or branch)
 */
export const deleteMedia = async (
  publicId: string,
  entityId: string,
  mediaId: string,
  entityType: 'gym' | 'branch' = 'gym'
): Promise<void> => {
  try {
    await deleteFromCloudinary(publicId, entityId, mediaId, entityType);
  } catch (error) {
    console.error(`Error deleting media:`, error);
    // Enhance error message for network-related issues
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Network error: Please check your connection and ensure the server is running.`);
      } else if (error.message.includes('404')) {
        throw new Error(`Server endpoint not found: The delete endpoint doesn't exist or is not properly configured.`);
      } else if (error.message.includes('401')) {
        throw new Error(`Authentication failed: Please log in again to delete files.`);
      }
    }
    throw error;
  }
};

const mediaService = {
  validateMediaFile,
  uploadMediaFile,
  uploadMultipleMediaFiles,
  deleteMedia
};

export default mediaService; 