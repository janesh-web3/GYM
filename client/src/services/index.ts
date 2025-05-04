import { 
  getActiveGyms, 
  getGymDetails, 
  joinGym, 
  checkMembershipStatus, 
  getUserGymMemberships,
  getFeaturedGyms,
  toggleFeaturedStatus,
  getAllGyms 
} from './gymService';
import adminService from './adminService';

export {
  // Gym Service methods
  getActiveGyms,
  getGymDetails,
  joinGym,
  checkMembershipStatus,
  getUserGymMemberships,
  getFeaturedGyms,
  toggleFeaturedStatus,
  getAllGyms,
  
  // Admin Service
  adminService
}; 