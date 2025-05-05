import axios from 'axios';
import { Branch, BranchMembership } from '../types/Role';

const API_URL = '/api/branches';

// Get a single branch by ID
export const getBranchDetails = async (branchId: string): Promise<Branch> => {
  const response = await axios.get(`${API_URL}/${branchId}`);
  return response.data;
};

// Join a branch
export const joinBranch = async (branchId: string, subscriptionId?: string): Promise<BranchMembership> => {
  const response = await axios.post(
    `${API_URL}/${branchId}/join`,
    { subscriptionId },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    }
  );
  return response.data.membership;
};

// Subscribe to a branch with payment
export const subscribeToBranch = async (
  branchId: string, 
  subscriptionId: string, 
  paymentMethodId?: string,
  autoRenew?: boolean
): Promise<{membership: BranchMembership, paymentIntent?: any}> => {
  const response = await axios.post(
    `${API_URL}/${branchId}/subscribe`,
    { 
      subscriptionId,
      paymentMethodId,
      autoRenew 
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    }
  );
  return response.data;
};

// Upload media to a branch
export const uploadBranchMedia = async (
  branchId: string,
  files: File[],
  type: 'photo' | 'video',
  caption?: string
): Promise<Branch> => {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  if (caption) {
    formData.append('caption', caption);
  }
  
  const response = await axios.post(
    `${API_URL}/${branchId}/media?type=${type}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    }
  );
  
  return response.data;
};

// Delete branch media
export const deleteBranchMedia = async (
  branchId: string,
  mediaId: string,
  type: 'photo' | 'video'
): Promise<{ message: string }> => {
  const response = await axios.delete(
    `${API_URL}/${branchId}/media/${mediaId}?type=${type}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    }
  );
  
  return response.data;
};

// Get branch members (for gym owners, managers, trainers)
export const getBranchMembers = async (
  branchId: string,
  page = 1,
  limit = 20,
  status?: string
): Promise<{
  memberships: Array<{
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
      profileImage?: string;
    };
    status: string;
    joinDate: string;
    subscriptionId?: {
      _id: string;
      planId: {
        name: string;
        price: number;
      };
    };
  }>;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}> => {
  const params: Record<string, string | number> = { page, limit };
  if (status) params.status = status;
  
  const response = await axios.get(`${API_URL}/${branchId}/members`, {
    params,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  return response.data;
};

// Activate a member (for gym owners)
export const activateMember = async (memberId: string): Promise<{
  success: boolean;
  data: BranchMembership;
  message: string;
}> => {
  const response = await axios.patch(
    `${API_URL}/members/${memberId}/activate`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    }
  );
  
  return response.data;
};

// Get branch statistics (for gym owners, managers)
export const getBranchStats = async (branchId: string): Promise<{
  totalMembers: number;
  activeMembers: number;
  statusCounts: Record<string, number>;
  checkInsToday: number;
  totalRevenue: number;
  subscriptionCount: number;
}> => {
  const response = await axios.get(`${API_URL}/${branchId}/stats`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  return response.data;
}; 