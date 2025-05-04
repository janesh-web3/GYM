import axios from 'axios';

const API_URL = '/api/subscriptions';

interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: {
    value: number;
    unit: string;
  };
  features: string[];
  services: Array<{
    name: string;
    description?: string;
    included: boolean;
  }>;
  gymId: string;
  branchId?: string;
  isActive: boolean;
}

interface SubscriptionCreateData {
  planId: string;
  branchId?: string;
  paymentMethod: string;
  autoRenew: boolean;
}

interface UserSubscription {
  _id: string;
  userId: string;
  planId: {
    _id: string;
    name: string;
    price: number;
  };
  gymId: {
    _id: string;
    gymName: string;
  };
  branchId?: {
    _id: string;
    branchName: string;
  };
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  autoRenew: boolean;
}

// Create a new subscription
export const createSubscription = async (data: SubscriptionCreateData): Promise<UserSubscription> => {
  const response = await axios.post(API_URL, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  return response.data;
};

// Get user's subscriptions
export const getUserSubscriptions = async (status?: string): Promise<UserSubscription[]> => {
  const url = status ? `/api/users/subscriptions?status=${status}` : '/api/users/subscriptions';
  
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  return response.data;
};

// Get subscription details
export const getSubscription = async (id: string): Promise<UserSubscription> => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  return response.data;
};

// Cancel a subscription
export const cancelSubscription = async (id: string): Promise<UserSubscription> => {
  const response = await axios.patch(
    `${API_URL}/${id}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    }
  );
  return response.data;
};

// Export types
export type { SubscriptionPlan, UserSubscription, SubscriptionCreateData }; 