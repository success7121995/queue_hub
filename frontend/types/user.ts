import { Lang } from "@/constant/lang-provider";
import { Branch, Merchant } from "@/types/merchant";

export interface User {
  user_id: string;
  username: string;
  email: string;
  fname: string;
  lname: string;
  phone: string;
  role: string;
  status: string;
  lang: Lang;
  last_login?: string | Date;
  email_verified?: boolean;
  merchant?: Merchant;
  branches?: Branch[];
  branchId?: string;
  merchantRole?: string;
  message_received?: Message[];
}

export interface UserMerchant {
  staff_id: string;
  user_id: string;
  merchant_id: string;
  role: string;
  position: string;
  User?: {
    user_id: string;
    fname: string;
    lname: string;
    email: string;
    phone: string;
  };
}

export interface UserAdmin {
  admin_id: string;
  role: string;
  position: string;
}

export interface Message {
  id: string;
  title: string;
  content: string;
  created_at: string | Date;
}

export interface UserProfile {
  user_id: string;
  lang?: Lang;
  fname?: string;
  lname?: string;
  avatarUrl?: string;
  position?: string;
  phone?: string;
  address?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface UserSetting {
  id: number;
  key: string;
  value: string;
  created_at: string | Date;
  updated_at: string | Date;
} 