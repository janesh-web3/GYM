export type Role = 'admin' | 'gymOwner' | 'member' | 'trainer';

export interface Gym {
  id: string;
  name: string;
  location: string;
  services: string[];
  image: string;
  description: string;
} 