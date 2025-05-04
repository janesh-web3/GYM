import axios from 'axios';
import { Gym } from '../types/Role';

// Define interfaces for response types
interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface GymResponseData {
  gyms?: Gym[];
  pagination?: PaginationData;
}

interface AdminResponse {
  success: boolean;
  data: GymResponseData | Gym[] | Gym | null;
  message?: string;
}

// Base URL for admin API
const API_URL = '/api';

// Get all gyms with filtering options
export const getAllGyms = async (options: {
  status?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AdminResponse> => {
  try {
    // Get the token directly before making the request
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.error('Authentication token is missing');
      return {
        success: false,
        data: null,
        message: 'Authentication token is missing. Please log in again.'
      };
    }
    
    const response = await axios.get(`${API_URL}/gyms`, {
      params: options,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Normalize the response to ensure it has a consistent structure
    const responseData = response.data as any;
    
    // Handle different possible response structures
    if (Array.isArray(responseData)) {
      // If the response is directly an array of gyms
      return { 
        success: true, 
        data: responseData as Gym[]
      };
    } else if (responseData && responseData.gyms && Array.isArray(responseData.gyms)) {
      // If the response has a gyms property that is an array
      return {
        success: true,
        data: {
          gyms: responseData.gyms as Gym[],
          pagination: responseData.pagination as PaginationData || {
            total: responseData.gyms.length,
            page: options.page || 1,
            limit: options.limit || 10,
            pages: Math.ceil(responseData.gyms.length / (options.limit || 10))
          }
        }
      };
    } else {
      // If the response has some other structure
      return { 
        success: true, 
        data: { 
          gyms: [],
          pagination: {
            total: 0,
            page: options.page || 1,
            limit: options.limit || 10,
            pages: 0
          }
        } 
      };
    }
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error fetching all gyms:', error);
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      if (error.response.status === 401) {
        // Handle token expiration or invalid token
        const authExpiredEvent = new CustomEvent('auth-expired', {
          detail: { reason: 'Your session has expired. Please log in again.' }
        });
        window.dispatchEvent(authExpiredEvent);
      }
      
      return { 
        success: false, 
        data: null,
        message: error.response.data?.message || 'Failed to fetch gyms'
      };
    } else if (error.request) {
      console.error('No response received:', error.request);
      return {
        success: false,
        data: null,
        message: 'No response received from server. Please check your connection.'
      };
    } else {
      return { 
        success: false, 
        data: null,
        message: error.message || 'Failed to fetch gyms'
      };
    }
  }
};

// Update gym status (active, pending, banned)
export const updateGymStatus = async (gymId: string, status: 'active' | 'pending' | 'banned', reason?: string): Promise<AdminResponse> => {
  try {
    // Get the token directly before making the request
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.error('Authentication token is missing');
      return {
        success: false,
        data: null,
        message: 'Authentication token is missing. Please log in again.'
      };
    }
    
    const response = await axios.patch(
      `${API_URL}/gyms/${gymId}/status`,
      { status, reason },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return { 
      success: true, 
      data: response.data as Gym 
    };
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error updating gym status:', error);
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      if (error.response.status === 401) {
        // Handle token expiration or invalid token
        const authExpiredEvent = new CustomEvent('auth-expired', {
          detail: { reason: 'Your session has expired. Please log in again.' }
        });
        window.dispatchEvent(authExpiredEvent);
      }
      
      if (error.response.status === 403) {
        return {
          success: false,
          data: null,
          message: 'You do not have permission to perform this action. Superadmin role required.'
        };
      }
      
      return { 
        success: false, 
        data: null,
        message: error.response.data?.message || 'Failed to update gym status'
      };
    } else if (error.request) {
      console.error('No response received:', error.request);
      return {
        success: false,
        data: null,
        message: 'No response received from server. Please check your connection.'
      };
    } else {
      return { 
        success: false, 
        data: null,
        message: error.message || 'Failed to update gym status'
      };
    }
  }
};

// Toggle gym featured status
export const toggleFeaturedStatus = async (gymId: string, isFeatured: boolean): Promise<AdminResponse> => {
  try {
    // Get the token directly before making the request
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.error('Authentication token is missing');
      return {
        success: false,
        data: null,
        message: 'Authentication token is missing. Please log in again.'
      };
    }
    
    console.log(`Sending request to toggle featured status for gym ${gymId} to ${isFeatured}`);
    console.log(`Using authorization token: Bearer ${token.substring(0, 15)}...`);
    
    const response = await axios.patch(
      `${API_URL}/gyms/${gymId}/featured`,
      { isFeatured },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Featured status update response:', response.data);
    
    return { 
      success: true, 
      data: response.data as Gym
    };
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error toggling featured status:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      
      if (error.response.status === 401) {
        // Handle token expiration or invalid token
        // Optionally trigger a custom auth-expired event to refresh token or log out
        const authExpiredEvent = new CustomEvent('auth-expired', {
          detail: { reason: 'Your session has expired. Please log in again.' }
        });
        window.dispatchEvent(authExpiredEvent);
      }
      
      if (error.response.status === 403) {
        return {
          success: false,
          data: null,
          message: 'You do not have permission to perform this action. Superadmin role required.'
        };
      }
      
      return { 
        success: false, 
        data: null,
        message: error.response.data?.message || 'Failed to update featured status'
      };
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return {
        success: false,
        data: null,
        message: 'No response received from server. Please check your connection.'
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return { 
        success: false, 
        data: null,
        message: error.message || 'Failed to update featured status'
      };
    }
  }
};

// Get gym details for admin use (more detailed than public view)
export const getGymDetails = async (gymId: string): Promise<AdminResponse> => {
  try {
    // Get the token directly before making the request
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.error('Authentication token is missing');
      return {
        success: false,
        data: null,
        message: 'Authentication token is missing. Please log in again.'
      };
    }
    
    const response = await axios.get(`${API_URL}/gyms/${gymId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return { 
      success: true, 
      data: response.data as Gym
    };
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error fetching gym details:', error);
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      if (error.response.status === 401) {
        // Handle token expiration or invalid token
        const authExpiredEvent = new CustomEvent('auth-expired', {
          detail: { reason: 'Your session has expired. Please log in again.' }
        });
        window.dispatchEvent(authExpiredEvent);
      }
      
      return { 
        success: false, 
        data: null,
        message: error.response.data?.message || 'Failed to fetch gym details'
      };
    } else if (error.request) {
      console.error('No response received:', error.request);
      return {
        success: false,
        data: null,
        message: 'No response received from server. Please check your connection.'
      };
    } else {
      return { 
        success: false, 
        data: null,
        message: error.message || 'Failed to fetch gym details'
      };
    }
  }
};

const adminService = {
  getAllGyms,
  updateGymStatus,
  toggleFeaturedStatus,
  getGymDetails
};

export default adminService; 