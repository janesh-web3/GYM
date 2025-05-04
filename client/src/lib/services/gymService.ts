import { apiMethods } from '../api';

/**
 * Get all gyms from the API
 * @param status Optional filter for gym status (active, pending, banned)
 */
export const getAllGyms = async (status?: string) => {
  try {
    const url = status ? `/api/gyms?status=${status}` : '/api/gyms';
    const data = await apiMethods.get(url, {});
    return { data };
  } catch (error) {
    console.error('Error fetching gyms:', error);
    throw error;
  }
};

/**
 * Get a specific gym by ID
 * @param gymId The ID of the gym to fetch
 */
export const getGymById = async (gymId: string) => {
  try {
    const data = await apiMethods.get(`/api/gyms/${gymId}`, {});
    return data;
  } catch (error) {
    console.error(`Error fetching gym ${gymId}:`, error);
    throw error;
  }
};

/**
 * Get gym statistics
 * @param gymId The ID of the gym to fetch stats for
 */
export const getGymStats = async (gymId: string) => {
  try {
    const data = await apiMethods.get(`/api/gyms/${gymId}/stats`, {});
    return data;
  } catch (error) {
    console.error(`Error fetching gym stats for ${gymId}:`, error);
    throw error;
  }
};

/**
 * Get all featured gyms
 * @param limit Optional limit for the number of gyms to fetch (default is 6)
 */
export const getFeaturedGyms = async (limit?: number) => {
  try {
    const url = limit ? `/api/gyms/featured?limit=${limit}` : '/api/gyms/featured';
    const data = await apiMethods.get(url, {});
    return data;
  } catch (error) {
    console.error('Error fetching featured gyms:', error);
    throw error;
  }
};

/**
 * Toggle the featured status of a gym (superadmin only)
 * @param gymId The ID of the gym to update
 * @param isFeatured Boolean indicating whether the gym should be featured
 */
export const toggleFeaturedStatus = async (gymId: string, isFeatured: boolean) => {
  try {
    const data = await apiMethods.patch(`/api/gyms/${gymId}/featured`, { isFeatured }, {});
    return data;
  } catch (error) {
    console.error(`Error updating featured status for gym ${gymId}:`, error);
    throw error;
  }
};

const gymService = {
  getAllGyms,
  getGymById,
  getGymStats,
  getFeaturedGyms,
  toggleFeaturedStatus
};

export default gymService; 