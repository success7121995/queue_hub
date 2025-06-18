import { QueueWithTags } from "./queue";
import { Branch, Merchant } from "./user";

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
}   