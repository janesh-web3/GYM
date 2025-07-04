export type Role = 'superadmin' | 'admin' | 'gymOwner' | 'member' | 'trainer';

export interface Branch {
  _id: string;
  branchName: string;
  gymId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  description: string;
  photos: Array<{
    url: string;
    public_id: string;
    caption?: string;
  }>;
  videos: Array<{
    url: string;
    public_id: string;
    caption?: string;
  }>;
  status: 'active' | 'inactive' | 'maintenance';
  memberCount: number;
  phoneNumber?: string;
  email?: string;
  workingHours?: {
    openTime: string;
    closeTime: string;
  };
}

export interface Gym {
  _id: string;
  gymName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  description: string;
  services: Array<{
    name: string;
    description?: string;
    price?: number;
  }>;
  logo?: {
    url: string;
    public_id: string;
  };
  photos: Array<{
    url: string;
    public_id: string;
    caption?: string;
  }>;
  videos: Array<{
    url: string;
    public_id: string;
    caption?: string;
  }>;
  status: 'pending' | 'active' | 'banned';
  isFeatured?: boolean;
  isApproved?: boolean;
  phoneNumber?: string;
  email?: string;
  website?: string;
  workingHours?: {
    openTime: string;
    closeTime: string;
  };
  branches?: Branch[];
  totalMembers?: number;
  totalSubscriptions?: number;
  activeSubscriptions?: number;
}

export interface GymMembership {
  _id: string;
  userId: string;
  gymId: Gym | string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchMembership {
  _id: string;
  userId: string;
  branchId: Branch | string;
  gymId: Gym | string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastCheckIn?: string;
  totalCheckIns: number;
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
} 