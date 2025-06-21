import { Branch, BranchFeature, BranchImage, BranchOpeningHour, Merchant } from "./merchant";
import { Address, MerchantRole } from "./form";
import { QueueWithTags, Tag } from "./queue";
import { UserMerchant } from "./user";

// Types
export type QueuesResponse = QueueWithTags[];

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