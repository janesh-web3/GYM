import { removeTokens } from '../lib/api';

/**
 * Helper function to determine if a token is expired
 * @param token JWT token
 * @returns boolean indicating if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    // Get the expiration time from the token payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiration = payload.exp * 1000; // Convert to milliseconds
    
    // Check if token is expired (with a 10 second buffer)
    return Date.now() > expiration - 10000;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true; // If we can't parse the token, consider it expired
  }
};

/**
 * Triggers authentication expiry event from anywhere in the application
 * @param reason The reason for logout to display to the user
 */
export const forceLogout = (reason: string = 'You have been logged out'): void => {
  // Remove tokens first
  removeTokens();
  
  // Trigger auth expired event
  const event = new CustomEvent('auth-expired', { 
    detail: { reason } 
  });
  window.dispatchEvent(event);
};

/**
 * Check if user is authenticated by verifying token exists and is not expired
 * @returns boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  
  return !isTokenExpired(token);
};

/**
 * Get the role from the token's payload
 * @returns User's role or null if not authenticated
 */
export const getRoleFromToken = (): string | null => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (error) {
    console.error('Error extracting role from token:', error);
    return null;
  }
}; 