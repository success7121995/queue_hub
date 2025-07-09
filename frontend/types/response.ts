import { Branch, BranchFeature, BranchImage, BranchOpeningHour, Logo, Merchant } from "./merchant";
import { Address, MerchantRole, Plan } from "./form";
import { QueueWithTags, Tag } from "./queue";
import { Avatar, Message, User, UserAdmin, UserMerchant } from "./user";
import { MessagePreview } from "./message";
import { Ticket } from "@/components/dashboard/admin/ticket/tickets";
import { Notification } from "./notification";

// Types
export type QueuesResponse = QueueWithTags[];

export interface AuthResponse {
    success: boolean;
    user: {
        user_id: string;
        username?: string;
        fname?: string;
        lname?: string;
        email: string;
        phone?: string;
        created_at?: string;
        UserMerchant?: UserMerchant;
        UserAdmin?: UserAdmin;
        merchant?: Merchant;
        branches?: Branch[];
        role?: string;
        merchant_id?: string;
        branch_id?: string;
        availableBranches?: string[];
        message_received?: any[];
        lang?: string;
        Avatar?: Avatar;
    };
    sessionId?: string;
}

export interface EmployeesResponse {
    success: boolean;
    result: UserMerchant[];
}

export interface LogoutResponse {
    success: boolean;
    message?: string;
}

export interface QueueResponse {
    success: boolean;
    result: QueueWithTags;
}

export interface QueueResponse {
    success: boolean;
    message: string;
}

export interface MerchantResponse {
    success: boolean;
    merchant: Merchant;
}

export interface BranchesResponse {
    success: boolean;
    branches: Branch[];
    contact_person_map: Record<string, {
        user_id: string;
        lname: string;
        fname: string;
        email: string;
        phone: string;
        UserMerchant: { role: MerchantRole; position: string } | null;
    }>;
}   

export interface UserMerchantResponse {
    success: boolean;
    user_merchants: UserMerchant[];
}

export interface BranchResponse {
    success: boolean;
    branch: {
        branch_name?: string;
        phone?: string;
        email?: string;
        description?: string;
        is_active?: boolean;
    };
}

export interface BranchAddressResponse {
    success: boolean;
    address: Address;
}

export interface BranchFeatureResponse {
    success: boolean;
    feature: BranchFeature;
}

export interface BranchTagResponse {
    success: boolean;
    tag: Tag;
}

export interface BranchOpeningHourResponse {
    success: boolean;
    opening_hours: BranchOpeningHour;
}

export interface BranchImagesResponse {
    success: boolean;
    images: BranchImage[];
}

export interface LogoResponse {
    success: boolean;
    logo: Logo;
}

export interface ChangePasswordResponse {
    success: boolean;
}

export interface MessageResponse {
    success: boolean;
    message: Message;
}

export interface MessagePreviewResponse {
    success: boolean;
    messagePreviews: MessagePreview[];
}

export interface CreateTicketResponse {
    success: boolean;
    ticket: Ticket;
}

export interface NotificationResponse {
    success: boolean;
    notifications: Notification[];
}