import { apiMethods } from '../lib/api';

// Helper to get the authentication token
const getAuthToken = () => localStorage.getItem('accessToken');

/**
 * Uploads a file to Cloudinary through the backend API
 * @param file The file to upload
 * @param type The type of upload (logo, photo, video)
 * @param entityId The ID of the entity (gym or branch)
 * @param entityType The type of entity (gym or branch)
 * @returns Promise with the upload result
 */
export const uploadToCloudinary = async (
  file: File,
  type: 'logo' | 'photo' | 'video',
  entityId: string,
  entityType: 'gym' | 'branch' = 'gym'
): Promise<{ url: string; public_id: string }> => {
  try {
    // Validate inputs
    if (!file) throw new Error('No file provided');
    if (!entityId) throw new Error('No entity ID provided');
    if (!type) throw new Error('No media type specified');
    
    // Create form data
    const formData = new FormData();
    formData.append('files', file);
    formData.append('type', type);

    // Define the endpoint based on the entity type
    const endpoint = entityType === 'gym' 
      ? `/api/gyms/${entityId}/media/upload?type=${type}` 
      : `/api/branches/${entityId}/media?type=${type}`;

    // Get auth token
    const token = getAuthToken();
    
    // Make the API call with proper headers for multipart form data
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });

    if (!response.ok) {
      let errorMessage = `Failed to upload ${type}. Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, keep the default message
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    // Handle different response structures between gym and branch endpoints
    if (entityType === 'branch') {
      const mediaArray = type === 'video' ? result.videos : result.photos;
      if (mediaArray && mediaArray.length > 0) {
        const latestMedia = mediaArray[mediaArray.length - 1];
        return {
          url: latestMedia.url,
          public_id: latestMedia.public_id
        };
      }
      throw new Error('No media found in response');
    }
    
    return result.data[0] || result.data; // Return the first result or the entire data if single item
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Uploads multiple files to Cloudinary through the backend API
 * @param files Array of files to upload
 * @param type The type of upload (photo, video)
 * @param entityId The ID of the entity (gym or branch)
 * @param entityType The type of entity (gym or branch)
 * @returns Promise with the upload results
 */
export const uploadMultipleToCloudinary = async (
  files: File[],
  type: 'photo' | 'video',
  entityId: string,
  entityType: 'gym' | 'branch' = 'gym'
): Promise<Array<{ 
  url: string; 
  public_id: string; 
  type: string;
  _id?: string;
  caption?: string;
}>> => {
  try {
    // Validate files before uploading
    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }
    
    if (!entityId) {
      throw new Error('No entity ID provided');
    }

    // Create form data
    const formData = new FormData();
    
    // Append each file to the formData
    files.forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('type', type);

    // Define the endpoint based on the entity type
    const endpoint = entityType === 'gym' 
      ? `/api/gyms/${entityId}/media/upload?type=${type}` 
      : `/api/branches/${entityId}/media?type=${type}`;

    // Get auth token
    const token = getAuthToken();
    
    // Make the API call with proper headers for multipart form data
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });

    if (!response.ok) {
      let errorMessage = `Failed to upload ${type}s. Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, keep the default message
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    // Handle different response structures between gym and branch endpoints
    if (entityType === 'branch') {
      // For branches, we get the full branch object back with photos/videos arrays
      const mediaArray = type === 'video' ? result.videos : result.photos;
      if (!mediaArray || mediaArray.length === 0) {
        throw new Error(`No ${type}s found in response`);
      }
      
      // Get the most recently added media items (equal to the number of files we uploaded)
      const startIndex = Math.max(0, mediaArray.length - files.length);
      const uploadedMedia = mediaArray.slice(startIndex);
      
      return uploadedMedia.map((item: any) => ({
        _id: item._id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: type,
        url: item.url,
        public_id: item.public_id,
        caption: item.caption || ''
      }));
    }
    
    if (!result.success) {
      throw new Error(result.message || `Failed to upload ${type}s`);
    }
    
    return result.data.map((item: any) => ({
      _id: item._id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: item.type || type,
      url: item.url,
      public_id: item.public_id,
      caption: item.caption || ''
    }));
  } catch (error) {
    console.error('Error uploading multiple files to Cloudinary:', error);
    throw error;
  }
};

/**
 * Deletes a file from Cloudinary through the backend API
 * @param publicId The Cloudinary public ID of the file to delete
 * @param entityId The ID of the entity (gym or branch)
 * @param mediaId The ID of the media in the database
 * @param entityType The type of entity (gym or branch)
 */
export const deleteFromCloudinary = async (
  publicId: string,
  entityId: string,
  mediaId: string,
  entityType: 'gym' | 'branch' = 'gym'
): Promise<void> => {
  try {
    // Define the endpoint based on the entity type
    const endpoint = entityType === 'gym' 
      ? `/api/gyms/${entityId}/media/${mediaId}` 
      : `/api/branches/${entityId}/media/${mediaId}`;

    // Get auth token
    const token = getAuthToken();

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ public_id: publicId }),
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMessage = `Failed to delete media. Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, keep the default message
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}; 