import { apiMethods } from '../api';

/**
 * Get all gyms from the API
 */
export const getAllGyms = async () => {
  try {
    const response = await fetch('/api/gyms');
    const data = await response.json();
    return data;
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
    const response = await fetch(`/api/gyms/${gymId}`);
    const data = await response.json();
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
    const response = await fetch(`/api/gyms/${gymId}/stats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching gym stats for ${gymId}:`, error);
    throw error;
  }
};

const gymService = {
  getAllGyms,
  getGymById,
  getGymStats
};

export default gymService; 