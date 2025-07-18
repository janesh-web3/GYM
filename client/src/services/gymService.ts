import axios from 'axios';
import { Gym, GymMembership } from '../types/Role';
import { SubscriptionPlan } from './subscriptionService';

const API_URL = '/api/gyms';

// Get active gyms with optional pagination and filters
export const getActiveGyms = async (page = 1, limit = 20, search = '', city = '') => {
  const response = await axios.get(`${API_URL}/active`, {
    params: { page, limit, search, city }
  });
  return response.data;
};

// Get single gym details
export const getGymDetails = async (gymId: string) => {
  const response = await axios.get(`${API_URL}/${gymId}`);
  return response.data;
};

// Join a gym (requires authentication)
export const joinGym = async (gymId: string) => {
  const response = await axios.post(
    `${API_URL}/${gymId}/join`,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    }
  );
  return response.data;
};

// Check gym membership status (requires authentication)
export const checkMembershipStatus = async (gymId: string) => {
  const response = await axios.get(
    `${API_URL}/${gymId}/membership-status`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    }
  );
  return response.data;
};

// Get user's gym memberships (requires authentication)
export const getUserGymMemberships = async () => {
  const response = await axios.get(
    `${API_URL}/memberships`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    }
  );
  return response.data;
};

// Get featured gyms
export const getFeaturedGyms = async (limit = 6) => {
  const response = await axios.get(`${API_URL}/featured`, {
    params: { limit }
  });
  return response.data;
};

// Toggle featured status (requires superadmin authentication)
export const toggleFeaturedStatus = async (gymId: string, isFeatured: boolean) => {
  const response = await axios.patch(
    `${API_URL}/${gymId}/featured`,
    { isFeatured },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    }
  );
  return response.data;
};

// Get all gyms (needed for owner dashboard)
export const getAllGyms = async (status = '') => {
  const response = await axios.get(`${API_URL}`, {
    params: { status },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  return response.data;
};

// Get gym members (requires gym owner authentication)
export const getGymMembers = async (
  gymId: string,
  page = 1,
  limit = 20,
  status?: string
) => {
  const params: Record<string, string | number> = { page, limit };
  if (status) params.status = status;
  
  const response = await axios.get(`${API_URL}/${gymId}/members`, {
    params,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  return response.data;
};

// Get a gym's branches
export const getGymBranches = async (gymId: string) => {
  const response = await axios.get(`${API_URL}/${gymId}/branches`);
  return response.data;
};

// Get a gym's subscription plans
export const getGymSubscriptionPlans = async (gymId: string, branchId?: string) => {
  const url = `${API_URL}/${gymId}/subscription-plans`;
  const params = branchId ? { branchId } : {};
  
  const response = await axios.get(url, { params });
  return response.data as SubscriptionPlan[];
}; 