import { User } from "./user";

export interface Merchant {
  merchantId: number;
  name: string;
  logo?: string;
  featureImage?: string;
  user: User;
  description?: string;
  address?: string;
  subscription?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  autoRenewal?: boolean;
  registrationDate?: string;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  features?: MerchantFeature[];
  galleries?: MerchantGallery[];
  settings?: MerchantSetting[];
  tags?: MerchantTag[];
  openingHours?: MerchantOpeningHour[];
}

export interface MerchantFeature {
  id: number;
  featureId: number;
  value?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantGallery {
  id: number;
  imageUrl: string;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantSetting {
  id: number;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantTag {
  tagId: number;
  tagName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantOpeningHour {
  id: number;
  dayOfWeek: number | string;
  openTime: string;
  closeTime: string;
  closed?: boolean;
}