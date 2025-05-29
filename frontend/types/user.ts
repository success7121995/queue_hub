export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
  settings?: UserSetting[];
}

export interface UserProfile {
  id: number;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  position?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSetting {
  id: number;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
} 