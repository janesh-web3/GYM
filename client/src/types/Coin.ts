export interface CoinPurchase {
  _id?: string;
  date: Date;
  coins: number;
  amount: number;
  transactionId: string;
}

export interface CoinTransaction {
  _id: string;
  memberId: string;
  gymId?: {
    _id: string;
    gymName: string;
    address: {
      city: string;
      state: string;
    };
  };
  coins: number;
  transactionType: 'purchase' | 'usage';
  date: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface UserCoinData {
  coinBalance: number;
  purchaseHistory: CoinPurchase[];
  transactions: CoinTransaction[];
}

export interface GymCoinData {
  coinBalance: number;
  transactions: CoinTransaction[];
  monthlyTotals: Record<string, number>; // Format: 'YYYY-MM': coinCount
}

export interface AdminCoinData {
  totalCoinsCirculating: number;
  totalCoinsHeldByGyms: number;
  gyms: {
    _id: string;
    gymName: string;
    coinBalance: number;
    monthlyStats: Record<string, number>; // Format: 'YYYY-MM': coinCount
  }[];
}

export interface QRCodeData {
  qrCode: string;
}

export interface PremiumFeature {
  name: string;
  description: string;
  icon: string;
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  bestValue?: boolean;
}

export const DEFAULT_COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'basic',
    name: 'Basic Pack',
    coins: 5,
    price: 4.99
  },
  {
    id: 'standard',
    name: 'Standard Pack',
    coins: 10,
    price: 8.99
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    coins: 20,
    price: 15.99,
    bestValue: true
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    coins: 50,
    price: 34.99
  }
];

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    name: 'Cross-Gym Access',
    description: 'Visit any registered gym with just 1 coin per day',
    icon: 'building'
  },
  {
    name: 'QR Code Entry',
    description: 'Quick and easy access with just a scan',
    icon: 'qrcode'
  },
  {
    name: 'No Monthly Commitments',
    description: 'Pay per visit with coins that never expire',
    icon: 'calendar'
  },
  {
    name: 'Exclusive Perks',
    description: 'Special discounts at partner establishments',
    icon: 'gift'
  }
]; 