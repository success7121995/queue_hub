import { Lang } from "@/constant/lang-provider";

export type Plan = "TRIAL" | "ESSENTIAL" | "GROWTH";
export type MerchantRole = "OWNER" | "MANAGER" | "FRONTLINE";

export interface Address {
  country: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  unit?: string;
  floor?: string;
}

export interface Payment {
  card_name: string;
  card_number: string;
  expiry_date: string;
  cvv: string;
  card_token?: string;
  save_card: boolean;
  auto_renewal: boolean;
}

export interface OpeningHour {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface ContactPerson {
  contact_person_id: string;
  phone?: string;
  email?: string;
  description?: string;
  opening_hours?: OpeningHour[];
}

export interface AccountSetup {
  username: string;
  password: string;
  confirm_password: string;
  lang: Lang;
}

export interface UserInfo {
  fname: string;
  lname: string;
  email: string;
  phone: string;
  position: string;
  role: MerchantRole;
}

// ========================
// Main Form Schemas
// ========================
export interface SignupFormFields {
  signup: {
    plan: Plan;
    business_name: string;
    fname: string;
    lname: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    confirm_password: string;
    lang: Lang;
    use_same_address: boolean;
  };
  branchInfo: ContactPerson & { branch_name: string };
  address: Address;
  branchAddress?: Address;
  payment?: Payment;
}

export interface AddBranchFormFields {
  branchInfo: ContactPerson & { branch_name: string };
  address: Address;
  payment?: Payment;
}

export interface AddAdminFormFields {
  userInfo: UserInfo;
  accountSetup: AccountSetup;
}

export interface AddEmployeeFormFields {
  userInfo: UserInfo;
  accountSetup: AccountSetup;
}
