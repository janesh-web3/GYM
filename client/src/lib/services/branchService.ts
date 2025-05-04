import { apiMethods } from '../api';

/**
 * Get all branches from the API
 */
export const getAllBranches = async () => {
  try {
    const response = await fetch('/api/branches');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }
};

/**
 * Get a specific branch by ID
 * @param branchId The ID of the branch to fetch
 */
export const getBranchById = async (branchId: string) => {
  try {
    const response = await fetch(`/api/branches/${branchId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching branch ${branchId}:`, error);
    throw error;
  }
};

/**
 * Create a new branch
 * @param branchData The branch data to create
 */
export const createBranch = async (branchData: any) => {
  try {
    const response = await fetch('/api/branches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(branchData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating branch:', error);
    throw error;
  }
};

/**
 * Update an existing branch
 * @param branchId The ID of the branch to update
 * @param branchData The updated branch data
 */
export const updateBranch = async (branchId: string, branchData: any) => {
  try {
    const response = await fetch(`/api/branches/${branchId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(branchData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating branch ${branchId}:`, error);
    throw error;
  }
};

/**
 * Delete a branch
 * @param branchId The ID of the branch to delete
 */
export const deleteBranch = async (branchId: string) => {
  try {
    const response = await fetch(`/api/branches/${branchId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error deleting branch ${branchId}:`, error);
    throw error;
  }
};

const branchService = {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch
};

export default branchService; 