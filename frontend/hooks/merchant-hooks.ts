import { useMutation, useQuery, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import type { Queue, QueueStatus, Tag } from "@/types/queue";
import type {
    QueuesResponse,
    QueueResponse,
    MerchantResponse,
    BranchesResponse,
    BranchResponse,
    BranchImagesResponse,
    BranchAddressResponse,
    UserMerchantResponse,
    BranchFeatureResponse,
    BranchTagResponse,
} from "@/types/response";
import type { Address, Branch, BranchFeature, BranchImage } from "@/types/merchant";

// Query Keys
export const queueKeys = {
    all: ['queues'] as const,
    lists: () => [...queueKeys.all, 'list'] as const,
    list: (branchId: string) => [...queueKeys.lists(), branchId] as const,
    details: () => [...queueKeys.all, 'detail'] as const,
    detail: (id: string) => [...queueKeys.details(), id] as const,
} as const;

export const merchantKeys = {
    all: ['merchant'] as const,
    details: () => [...merchantKeys.all, 'detail'] as const,
    detail: (id: string) => [...merchantKeys.details(), id] as const,
} as const;

export const branchKeys = {
    all: ['branch'] as const,
    details: () => [...branchKeys.all, 'detail'] as const,
    detail: (id: string) => [...branchKeys.details(), id] as const,
} as const;

export const userMerchantKeys = {
    all: ['userMerchant'] as const,
    details: () => [...userMerchantKeys.all, 'detail'] as const,
    detail: (id: string) => [...userMerchantKeys.details(), id] as const,
} as const;

/**
 * Fetch queues
 * @param branchId 
 * @returns 
 */
export const fetchQueues = async (branchId: string): Promise<QueuesResponse> => {
    if (!branchId) {
        throw new Error('No branch ID available');
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/queues/${branchId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch queues');
    }

    const responseData = await res.json();
    return responseData.result.queues;
};

/**
 * Fetch create queue
 * @param data 
 * @returns 
 */
export const fetchCreateQueue = async (data: Queue): Promise<QueueResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/queues/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    const responseData = await res.json();

    if (!res.ok) {
        throw new Error('Failed to create queue');
    }

    return responseData;
};

/**
 * Fetch update queue
 * @param queue_id 
 * @param data 
 * @returns 
 */
export const fetchUpdateQueue = async ({ queue_id, data }: { queue_id: string; data: Queue}): Promise<QueueResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/queues/${queue_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        throw new Error('Failed to update queue');
    }

    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch delete queue
 * @param queue_id 
 * @returns 
 */
export const fetchDeleteQueue = async (queue_id: string): Promise<QueueResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/queues/${queue_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    });
    
    if (!res.ok) {
        throw new Error('Failed to delete queue');
    }
    
    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch update queue status
 * @param queue_id 
 * @param queue_status 
 * @returns 
 */
export const fetchUpdateQueueStatus = async ({ queue_id, queue_status }: { queue_id: string; queue_status: QueueStatus }): Promise<QueueResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/queues/${queue_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ queue_status }),
    });
    
    if (!res.ok) {
        throw new Error('Failed to update queue status');
    }
    
    return res.json();
};

/**
 * Fetch merchant
 * @param merchantId 
 * @returns 
 */
export const fetchMerchant = async (merchantId: string): Promise<MerchantResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/${merchantId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch merchant');
    }

    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch branches
 * @param merchantId 
 * @returns 
 */
export const fetchBranches = async (merchantId: string, prefetch: boolean = false): Promise<BranchesResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/${merchantId}?prefetch=${prefetch}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch branches');
    }

    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch user merchants
 * @param merchant_id 
 * @returns 
 */
export const fetchUserMerchants = async (merchant_id: string): Promise<UserMerchantResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/user-merchants/${merchant_id}`, {   
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch user merchants');
    }

    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch update branch
 * @param branch_id 
 * @param data 
 * @returns 
 */
export const fetchUpdateBranch = async ({ branch_id, data }: { branch_id: string; data: Partial<Branch> }): Promise<BranchResponse> => {
    console.log('Frontend sending data:', data);
    console.log('Branch ID:', branch_id);
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/${branch_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to update branch');
    }
    
    
    return res.json();
};

/**
 * Fetch update branch address
 * @param branch_id 
 * @param data 
 * @returns 
 */
export const fetchUpdateBranchAddress = async ({ branch_id, data }: { branch_id: string; data: Partial<Address> }): Promise<BranchAddressResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/${branch_id}/address`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to update branch address');
    }

    return res.json();
};

/**
 * Fetch update branch features
 * @param branch_id 
 * @param data 
 * @returns 
 */
export const fetchCreateBranchFeatures = async ({ branch_id, data }: { branch_id: string; data: { feature_name: string } }): Promise<BranchFeatureResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/${branch_id}/features`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to update branch features');
    }

    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch delete branch feature
 * @param branch_id 
 * @param feature_id 
 * @returns 
 */
export const fetchDeleteBranchFeature = async ({ branch_id, feature_id }: { branch_id: string; feature_id: string }): Promise<BranchFeatureResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/features/${feature_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to delete branch feature');
    }

    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch create branch tag
 * @param branch_id 
 * @param data 
 * @returns 
 */
export const fetchCreateBranchTag = async ({ branch_id, data }: { branch_id: string; data: { tag_name: string } }): Promise<BranchTagResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/${branch_id}/tags`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to create branch tag');
    }

    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch update branch images
 * @param branch_id         
 * @param data 
 * @returns 
 */
export const fetchUpdateBranchImages = async ({ branch_id, data }: { branch_id: string; data: BranchImage[] }): Promise<BranchImagesResponse> => {

    console.log('data', data);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/${branch_id}/images`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to update branch images');
    }
    
    return res.json();
};

/**
 * Fetch delete branch tag
 * @param branch_id
 * @param tag_id
 * @returns
 */
export const fetchDeleteBranchTag = async ({ branch_id, tag_id }: { branch_id: string; tag_id: string }): Promise<BranchTagResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/tags/${tag_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete branch tag');
    return res.json();
};

/********************************* Hooks *********************************/

/**
 * Use queues
 * @param branchId 
 * @param options 
 * @returns 
 */
export const useQueues = (branchId: string, options?: Omit<UseQueryOptions<QueuesResponse, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: queueKeys.list(branchId),
        queryFn: () => fetchQueues(branchId),
        enabled: !!branchId,
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes
        ...options,
    });
};

/**
 * Use create queue
 * @param options 
 * @returns 
 */
export const useCreateQueue = (options?: Omit<UseMutationOptions<QueueResponse, Error, Queue>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchCreateQueue,
        ...options,
    });
};

/**
 * Use update queue
 * @param options 
 * @returns 
 */
export const useUpdateQueue = (options?: Omit<UseMutationOptions<QueueResponse, Error, { queue_id: string; data: Queue }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchUpdateQueue,
        ...options,
    });
};

/**
 * Use delete queue
 * @param options 
 * @returns 
 */
export const useDeleteQueue = (options?: Omit<UseMutationOptions<QueueResponse, Error, string>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchDeleteQueue,
        ...options,
    });
};

/**
 * Use update queue status
 * @param options 
 * @returns 
 */
export const useUpdateQueueStatus = (options?: Omit<UseMutationOptions<QueueResponse, Error, { queue_id: string; queue_status: QueueStatus }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchUpdateQueueStatus,
        ...options,
    });
};

/**
 * Use merchant
 * @param merchantId 
 * @param options 
 * @returns 
 */
export const useMerchant = (merchantId: string, options?: Omit<UseQueryOptions<MerchantResponse, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: merchantKeys.detail(merchantId),
        queryFn: () => fetchMerchant(merchantId),
        enabled: !!merchantId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        ...options,
    });
};

/**
 * Use user merchants
 * @param merchantId 
 * @param options 
 * @returns 
 */
export const useUserMerchants = (merchantId: string, options?: Omit<UseQueryOptions<UserMerchantResponse, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: userMerchantKeys.all,
        queryFn: () => fetchUserMerchants(merchantId),
        enabled: !!merchantId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        ...options,
    });
};

/**
 * Use branches
 * @param merchantId 
 * @param options 
 * @returns 
 */
export const useBranches = (merchantId: string, options?: Omit<UseQueryOptions<BranchesResponse, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: branchKeys.detail(merchantId),
        queryFn: () => fetchBranches(merchantId),
        enabled: !!merchantId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        ...options,
    });
};

/**
 * Use update branch
 * @param options 
 * @returns 
 */
export const useUpdateBranch = (options?: Omit<UseMutationOptions<BranchResponse, Error, { branch_id: string; data: Partial<Branch> }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchUpdateBranch,
        ...options,
    });
};

/**
 * Use update branch address
 * @param options 
 * @returns 
 */
export const useUpdateBranchAddress = (options?: Omit<UseMutationOptions<BranchAddressResponse, Error, { branch_id: string; data: Partial<Address> }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchUpdateBranchAddress,
        ...options,
    });
};

/**
 * Use update branch features
 * @param options 
 * @returns 
 */
export const useCreateBranchFeature = (options?: Omit<UseMutationOptions<BranchFeatureResponse, Error, { branch_id: string; data: { feature_name: string } }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchCreateBranchFeatures,
        ...options,
    });
};

/**
 * Use create branch tag
 * @param options 
 * @returns 
 */
export const useCreateBranchTag = (options?: Omit<UseMutationOptions<BranchTagResponse, Error, { branch_id: string; data: { tag_name: string } }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchCreateBranchTag,
        ...options,
    });
};

/**
 * Use update branch images
 * @param options 
 * @returns 
 */
export const useUpdateBranchImages = (options?: Omit<UseMutationOptions<BranchImagesResponse, Error, { branch_id: string; data: BranchImage[] }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchUpdateBranchImages,
        ...options,
    });
};

/**
 * useDeleteBranchTag hook
 */
export const useDeleteBranchTag = (options?: Omit<UseMutationOptions<BranchTagResponse, Error, { branch_id: string; tag_id: string }>, 'mutationFn'>) => {
    return useMutation({ mutationFn: fetchDeleteBranchTag, ...options });
};

/**
 * useDeleteBranchFeature hook
 */
export const useDeleteBranchFeature = (options?: Omit<UseMutationOptions<BranchFeatureResponse, Error, { branch_id: string; feature_id: string }>, 'mutationFn'>) => {
    return useMutation({ mutationFn: fetchDeleteBranchFeature, ...options });
};

/********************************* Prefetch Functions *********************************/

/**
 * Prefetch queues
 * @param queryClient 
 * @param branchId 
 * @returns 
 */
export const prefetchQueues = async (queryClient: any, branchId: string) => {
    await queryClient.prefetchQuery({
        queryKey: queueKeys.list(branchId),
        queryFn: () => fetchQueues(branchId),
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
    });

    return queryClient.getQueryData(queueKeys.list(branchId));
};

/**
 * Prefetch merchant
 * @param queryClient 
 * @param merchantId 
 * @returns 
 */
export const prefetchMerchant = async (queryClient: any, merchantId: string) => {
    await queryClient.prefetchQuery({
        queryKey: merchantKeys.detail(merchantId),
        queryFn: () => fetchMerchant(merchantId),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });

    return queryClient.getQueryData(merchantKeys.detail(merchantId));
};

/**
 * Prefetch branches
 * @param queryClient 
 * @param merchantId 
 * @returns 
 */
export const prefetchBranches = async (queryClient: any, merchantId: string) => {
    await queryClient.prefetchQuery({
        queryKey: branchKeys.detail(merchantId),
        queryFn: () => fetchBranches(merchantId, true),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });

    return queryClient.getQueryData(branchKeys.detail(merchantId));
};