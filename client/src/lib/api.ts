// @ts-nocheck
import axios from 'axios';

// Define base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Types for authentication
interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

// API Response type
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Error response type
interface ErrorResponse {
  message: string;
  success: boolean;
  errors?: Record<string, string[]>;
}

// Token management
export const getTokens = (): AuthTokens | null => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!accessToken) return null;
  return { accessToken, refreshToken: refreshToken || undefined };
};

export const setTokens = (tokens: AuthTokens): void => {
  localStorage.setItem('accessToken', tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }
};

export const removeTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const tokens = getTokens();
    if (tokens?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized) - could be expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { 
            refreshToken 
          });
          
          const { token } = response.data;
          
          // Update stored tokens
          setTokens({ accessToken: token, refreshToken: token });
          
          // Update authorization header and retry request
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log out the user
          removeTokens();
          // Optional: Redirect to login
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available
        removeTokens();
        // Optional: Redirect to login
        window.location.href = '/login';
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// Generic request function with error handling
export const apiRequest = async (options) => {
  try {
    const response = await api(options);
    // Return the response data directly since the backend doesn't nest it inside a data property
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Extract error message from response
      const errorMessage = error.response.data?.message || error.message;
      throw new Error(errorMessage);
    }
    // Handle non-axios errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
};

// Helper methods for common HTTP methods
export const apiMethods = {
  get: (url, config) => 
    apiRequest({ ...config, method: 'GET', url }),
    
  post: (url, data, config) => 
    apiRequest({ ...config, method: 'POST', url, data }),
    
  put: (url, data, config) => 
    apiRequest({ ...config, method: 'PUT', url, data }),
    
  patch: (url, data, config) => 
    apiRequest({ ...config, method: 'PATCH', url, data }),
    
  delete: (url, config) => 
    apiRequest({ ...config, method: 'DELETE', url }),
};

export default api; 