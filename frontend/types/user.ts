import { Lang } from "@/constant/lang-provider";

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
  created_at: string | Date;
  updated_at: string | Date;
  last_login?: string | Date;
  email_verified?: boolean;
  merchant?: Merchant;
  branches?: Branch[];
  branchId?: string;
  merchantRole?: string;
  message_received?: Message[];
}

export interface Merchant {
  merchant_id: string;
  business_name: string;
  phone: string;
  email: string;
  description?: string;
  subscription_status: string;
  approval_status: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface Branch {
  branch_id: string;
  branch_name: string;
  merchant_id: string;
  contact_person_id: string;
  phone?: string;
  email?: string;
  description?: string;
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
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