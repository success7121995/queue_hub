import { Lang } from "@/constant/lang-provider";
import { z } from "zod";

export type Plan = "TRIAL" | "ESSENTIAL" | "GROWTH";
export type MerchantRole = "OWNER" | "MANAGER" | "FRONTLINE";
export type AdminRole = "SUPER_ADMIN" | "OPS_ADMIN" | "DEVELOPER" | "SUPPORT_AGENT";

export type CountryDialingCode =
  | '+1'    // US, Canada
  | '+44'   // United Kingdom
  | '+61'   // Australia
  | '+852'  // Hong Kong
  | '+853'  // Macau
  | '+886'  // Taiwan
  | '+65'   // Singapore
  | '+60'   // Malaysia
  | '+86'   // China
  | '+81';  // Japan

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
  staff_id: string;
  email: string;
  phone: string;
  position: string;
  image_url?: string;
}

export interface EmployeeInfo extends UserInfo {
  role: MerchantRole;
}

export interface AdminInfo extends UserInfo {
  role: AdminRole;
}

// ========================
// Main Form Schemas
// ========================
export const SignupSchema = z
  .object({
    signup: z.object({
      plan: z.enum(["TRIAL", "ESSENTIAL", "GROWTH"]),
      business_name: z.string(),
      fname: z.string(),
      lname: z.string(),
      username: z.string(),
      email: z.string().email(),
      phone: z.string(),
      password: z.string(),
      confirm_password: z.string(),
      lang: z.enum(["en", "es", "fr", "de", "it", "pt", "ru", "zh"]),
      use_same_address: z.boolean(),
    }),
    branchInfo: z.object({
      branch_name: z.string(),
      contact_person_id: z.string(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      description: z.string().optional(),
    }),
    address: z.object({
      country: z.string(),
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
      unit: z.string().optional(),
      floor: z.string().optional(),
    }),
    branchAddress: z.object({
      country: z.string().optional(),
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      unit: z.string().optional(),
      floor: z.string().optional(),
    }).optional(),
    payment: z.object({
      card_name: z.string(),
      card_number: z.string(),
      expiry_date: z.string(),
      cvv: z.string(),
      card_token: z.string().optional(),
      save_card: z.boolean(),
      auto_renewal: z.boolean(),
    }).optional(),
  });

export type SignupFormFields = z.infer<typeof SignupSchema>;

export interface AddBranchFormFields {
  branchInfo: ContactPerson & { branch_name: string };
  address: Address;
  payment?: Payment;
}

export interface AddAdminFormFields {
  userInfo: AdminInfo;
  accountSetup: AccountSetup;
}

export interface AddEmployeeFormFields {
  userInfo: EmployeeInfo;
  accountSetup: AccountSetup;
}

export const EditEmployeeSchema = z.object({
  fname: z.string().min(1, "First name is required"),
  lname: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  position: z.string().min(1, "Position is required"),
  role: z.enum(["OWNER", "MANAGER", "FRONTLINE"]),
  email: z.string().email().optional(),
  username: z.string().optional(),
});

export type EditEmployeeFormFields = z.infer<typeof EditEmployeeSchema>;


// export interface BranchDetails {
//   branch_name: string;
//   // ... existing code ...
// }
