import { Branch, Merchant } from "./merchant";
import { MerchantRole } from "./form";
import { QueueWithTags } from "./queue";

// Types
export type QueuesResponse = QueueWithTags[];

export interface CreateQueueResponse {
    success: boolean;
    result: QueueWithTags;
}

export interface UpdateQueueResponse {
    success: boolean;
    queue: QueueWithTags;
}[]

export interface DeleteQueueResponse {
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

export interface UpdateBranchResponse {
    success: boolean;
    branch: {
        branch_name?: string;
        phone?: string;
        email?: string;
        description?: string;
        is_active?: boolean;
    };
}