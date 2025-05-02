// @ts-nocheck
import { apiMethods } from './api';
import { 
  UserCoinData, 
  GymCoinData, 
  AdminCoinData, 
  QRCodeData 
} from '../types/Coin';

// Premium Coin Service
export const coinService = {
  // QR Code Generation
  getMemberQR: async (memberId: string): Promise<QRCodeData> => {
    return apiMethods.get(`/coins/qr/member/${memberId}`);
  },
  
  getGymQR: async (gymId: string): Promise<QRCodeData> => {
    return apiMethods.get(`/coins/qr/gym/${gymId}`);
  },
  
  // Coin Purchase
  purchaseCoins: async (userId: string, coins: number, amount: number) => {
    return apiMethods.post('/coins/purchase', { 
      userId, 
      coins, 
      amount 
    });
  },
  
  // Coin Usage
  useCoin: async (memberId: string, gymId: string) => {
    return apiMethods.post('/coins/use', { 
      memberId, 
      gymId 
    });
  },
  
  // QR Code Scanning
  scanGymQR: async (memberId: string, gymId: string) => {
    return apiMethods.post('/coins/scan', { 
      memberId, 
      gymId 
    });
  },
  
  // User Coin History
  getUserCoinHistory: async (userId: string): Promise<UserCoinData> => {
    return apiMethods.get(`/coins/user/${userId}`);
  },
  
  // Gym Coin History
  getGymCoinHistory: async (gymId: string): Promise<GymCoinData> => {
    return apiMethods.get(`/coins/gym/${gymId}`);
  },
  
  // Admin Dashboard
  getAdminCoinData: async (): Promise<AdminCoinData> => {
    return apiMethods.get('/coins/admin/dashboard');
  },
  
  // Simulate Payout
  simulateGymPayout: async (gymId: string, amount: number, coins: number) => {
    return apiMethods.post('/coins/admin/payout', {
      gymId,
      amount,
      coins
    });
  },
  
  // Update User Subscription Type
  updateSubscriptionType: async (userId: string, subscriptionType: 'basic' | 'premium') => {
    return apiMethods.post('/auth/update-subscription', {
      userId,
      subscriptionType
    });
  }
}; 