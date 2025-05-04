// @ts-nocheck
import axios from 'axios';

// Define base URL for API requests
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Utility function for delay (used in retries)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

// Event for session expiry
const dispatchAuthExpiredEvent = (reason = 'Your session has expired. Please log in again.') => {
  const event = new CustomEvent('auth-expired', { 
    detail: { reason } 
  });
  window.dispatchEvent(event);
};

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
    
    // Handle rate limiting (429 Too Many Requests)
    if (error.response?.status === 429 && !originalRequest._rateRetry) {
      // Get retry count or initialize it
      originalRequest._rateRetryCount = originalRequest._rateRetryCount || 0;
      
      // Only retry up to 3 times for rate limiting
      if (originalRequest._rateRetryCount < 3) {
        originalRequest._rateRetryCount++;
        
        // Exponential backoff: wait longer for each retry attempt
        const delayMs = 1000 * Math.pow(2, originalRequest._rateRetryCount - 1);
        console.log(`Rate limited. Retrying in ${delayMs}ms (attempt ${originalRequest._rateRetryCount}/3)...`);
        
        // Wait before retrying
        await sleep(delayMs);
        
        // Retry the request
        return api(originalRequest);
      }
    }
    
    // Handle 401 errors (unauthorized) - could be expired token
    if (error.response?.status === 401 && !originalRequest._authRetry) {
      // Mark this request as retried to prevent infinite retry loops
      originalRequest._authRetry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      const errorMsg = error.response?.data?.message || 'Session expired';
      
      // Don't attempt to refresh if it's a direct auth endpoint failure
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      
      if (refreshToken && !isAuthEndpoint) {
        try {
          console.log('Attempting to refresh token...');
          
          // Attempt to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { 
            refreshToken 
          });
          
          const { token } = response.data;
          
          if (!token) {
            throw new Error('No token received from refresh endpoint');
          }
          
          console.log('Token refreshed successfully');
          
          // Update stored tokens
          setTokens({ accessToken: token, refreshToken: token });
          
          // Update authorization header for this and future requests
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Retry the original request with new token
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          
          // Clear tokens
          removeTokens();
          
          // Dispatch auth expired event to trigger logout in auth context
          dispatchAuthExpiredEvent('Your session has expired. Please log in again.');
          
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token or auth endpoint failure
        // Clear tokens
        removeTokens();
        
        // For auth endpoints, just reject normally (don't redirect from login page)
        if (isAuthEndpoint) {
          return Promise.reject(error);
        }
        
        // Dispatch auth expired event to trigger logout in auth context
        dispatchAuthExpiredEvent(errorMsg);
        
        return Promise.reject(new Error(errorMsg));
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// Generic request function with error handling and retry for rate limiting
export const apiRequest = async (options, retryCount = 0, maxRetries = 3) => {
  try {
    const response = await api(options);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle rate limiting separately from the interceptor
      // This offers another layer of protection
      if (error.response?.status === 429 && retryCount < maxRetries) {
        const delayMs = 1000 * Math.pow(2, retryCount);
        console.log(`API request rate limited. Retrying in ${delayMs}ms (attempt ${retryCount + 1}/${maxRetries})...`);
        
        // Wait before retrying
        await sleep(delayMs);
        
        // Retry with incremented counter
        return apiRequest(options, retryCount + 1, maxRetries);
      }
      
      if (error.response) {
        // Extract error message from response
        const errorMessage = error.response.data?.message || error.message;
        throw new Error(errorMessage);
      }
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