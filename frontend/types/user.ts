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
  lang?: Lang;
  last_login?: string | Date | null;
  email_verified?: boolean;
  merchant?: Merchant;
  branches?: Branch[];
  branchId?: string;
  merchantRole?: string;
  message_received?: Message[];
  Avatar?: {
    image_url: string;
  } | null;
  UserMerchant?: UserMerchant;
  UserAdmin?: UserAdmin;
}

export interface UserMerchant {
  staff_id: string;
  user_id: string;
  merchant_id: string;
  position: string;
  role: string;
  join_at: string | Date;
  selected_branch_id?: string;
  created_at: string | Date;
  updated_at: string | Date;
  User?: {
    user_id: string;
    username: string;
    fname: string;
    lname: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    last_login: string | Date | null;
    Avatar?: {
      image_url: string;
    } | null;
  };
  UserMerchantOnBranch: Array<{
    staff_id: string;
    branch_id: string;
    assigned_at: string | Date;
    Branch: {
      branch_id: string;
      branch_name: string;
    };
  }>;
}

export interface UserAdmin {
  admin_id: string;
  role: string;
  position: string;
}

export interface UserProfile {
  username: string;
  lang?: Lang;
  fname?: string;
  lname?: string;
  phone?: string;
}

export interface UserSetting {
  id: number;
  key: string;
  value: string;
  created_at: string | Date;
  updated_at: string | Date;
} 

export interface Avatar {
  image_id: string;
  image_url: string;
}

export interface Message {
  message: {    
    message_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string | Date;
  },
  user: {
    user_id: string;
    username: string;
    Avatar?: {
      image_url: string;
    } | null;
  }
}