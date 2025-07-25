import { User } from "./user";
import { Plan } from "./form";


export interface Merchant {
  merchant_id: string;
  business_name: string;
  phone: string;
  email: string;
  description?: string;
  subscription_status: Plan;
  subscription_start: string;
  subscription_end: string;
  auto_renewal: boolean;
  approved_at: string;
  approval_status: string;
  created_at: string;
  updated_at: string;
  user: User;
  Logo?: Logo;
  Address?: Address;
}

export interface Address {
  address_id: string;
  merchant_id?: string | null;
  branch_id?: string | null;
  street: string;
  unit?: string | null;
  floor?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface BranchFeature {
  feature_id: string;
  branch_id: string;
  label: string;
  is_positive: boolean;
  created_at: string;
  updated_at: string;
}

export interface BranchImage {
  image_id: string;
  branch_id: string;
  image_url: string;
  image_type: string; // ImageType enum
  uploaded_at: string;
}

export interface BranchOpeningHour {
  id: string;
  branch_id: string;
  day_of_week: string; // DayOfWeek enum
  open_time: string;
  close_time: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMerchantOnBranch {
  staff_id: string;
  branch_id: string;
  assigned_at: string;
}

export interface Tag {
  tag_id: string;
  tag_name: string;
  entity_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  branch_id: string;
  merchant_id: string;
  branch_name: string;
  contact_person: {
    staff_id: string;
    user_id: string;
    role: string;
    position: string;
    User: {
      lname: string;
      fname: string;
      email: string;
      phone: string;
    } | null;
  } | null;
  contact_person_id: string | null;
  phone?: string;
  email?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  BranchFeature: BranchFeature[] | [];
  BranchImage: BranchImage[] | [];
  BranchOpeningHour: BranchOpeningHour[] | [];
  Address: Address | null;
  UserMerchantOnBranch: UserMerchantOnBranch[] | [];
  Tag: Tag[] | [];
}

export interface Logo {
  logo_id: string;
  merchant_id: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";