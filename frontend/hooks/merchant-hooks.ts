import { useMutation, useQuery, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import type { Queue, QueueStatus } from "@/types/queue";
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
    BranchOpeningHourResponse,
    LogoResponse,
} from "@/types/response";
import type { Address, Branch, BranchOpeningHour, Merchant } from "@/types/merchant";

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
    merchants: () => [...merchantKeys.all, 'merchants'] as const,
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
 * @param branchId - The branch ID to fetch queues for
 * @returns 
 */
export const fetchQueues = async (branchId: string): Promise<QueuesResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/queues?branch_id=${branchId}`, {
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
 * Fetch get merchants
 * @returns 
 */
export const fetchGetMerchants = async (): Promise<{ success: boolean; result: Merchant[] }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get merchants');
    }
    const responseData = await res.json();
    return responseData;
};


/**
 * Fetch branches
 * @param merchantId 
 * @param prefetch 
 * @param userId - Optional user ID for role-based filtering
 * @returns 
 */
export const fetchBranches = async (merchantId: string, prefetch: boolean = false, userId?: string): Promise<BranchesResponse> => {
    const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/${merchantId}`);
    url.searchParams.set('prefetch', prefetch.toString());
    if (userId) {
        url.searchParams.set('user_id', userId);
    }

    const res = await fetch(url.toString(), {
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
 * Fetch update merchant address
 * @param merchant_id 
 * @param data 
 * @returns 
 */
export const fetchUpdateMerchantAddress = async ({ merchant_id, data }: { merchant_id: string; data: Partial<Address> }): Promise<{ success: boolean; result: { address: Address } }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/${merchant_id}/address`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to update merchant address');
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

/**
 * Fetch update branch opening hours
 * @param branch_id 
 * @param data 
 * @returns 
 */
export const fetchUpdateBranchOpeningHours = async ({ branch_id, data }: { branch_id: string; data: Partial<BranchOpeningHour> }): Promise<BranchOpeningHourResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/${branch_id}/opening-hours`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    }); 

    if (!res.ok) {
        throw new Error('Failed to update branch opening hours');
    }
    
    return res.json();
};

/**
 * Fetch create branch images
 * @param branch_id 
 * @param data 
 * @returns 
 */
export const fetchUploadBranchImages = async ({ branch_id, data, image_type }: { branch_id: string; data: any, image_type: 'logo' | 'feature-image' | 'galleries' }): Promise<BranchImagesResponse> => {
    const formData = new FormData();
    const imageFile = data[0]?.file;

    if (!imageFile) {
        throw new Error("No file provided for upload.");
    }
    
    if (image_type === 'logo') {
        formData.append('LOGO', imageFile);
    } else if (image_type === 'feature-image') {
        formData.append('FEATURE_IMAGE', imageFile);
    } else if (image_type === 'galleries') {
        formData.append('IMAGE', imageFile);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/${branch_id}/images/${image_type}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Upload failed with status:", res.status, errorText);
        throw new Error('Failed to create branch images');
    }

    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch update branch image
 * @param branch_id 
 * @param image_id 
 * @returns 
 */
export const fetchUpdateBranchImage = async ({ branch_id, image_id }: { branch_id: string; image_id: string }): Promise<BranchImagesResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/${branch_id}/images/logo/${image_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to update branch image');
    }

    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch delete branch images
 */
export const fetchDeleteBranchImages = async ({ branch_id, image_id }: { branch_id: string; image_id: string }): Promise<BranchImagesResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/${branch_id}/images/${image_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to delete branch galleries');
    }

    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch create branch
 * @param data 
 * @returns 
 */
export const fetchCreateBranch = async (data: { 
    branch_name: string; 
    contact_person_id: string; 
    phone?: string; 
    email?: string; 
    description?: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
        unit?: string;
        floor?: string;
    };
}): Promise<BranchResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/branches/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to create branch');
    }

    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch create logo
 * @param data 
 * @returns 
 */
export const fetchCreateLogo = async (data: { merchant_id: string; logo_url: string }): Promise<LogoResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/logo/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to create logo');
    }

    const responseData = await res.json();
    return responseData.result;
};

/**
 * Fetch upload logo
 * @param file - The logo file to upload
 * @returns 
 */
export const fetchUploadLogo = async (file: File): Promise<LogoResponse> => {
    const formData = new FormData();
    formData.append('LOGO', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/logo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Logo upload failed with status:", res.status, errorText);
        throw new Error('Failed to upload logo');
    }

    const responseData = await res.json();
    return responseData;
};

/**
 * Fetch delete logo
 * @param logo_id - The logo ID to delete
 * @returns 
 */
export const fetchDeleteLogo = async (logo_id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/logo/${logo_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to delete logo');
    }

    return res.json();
};

/**
 * Switch user's selected branch
 * @param branch_id - The branch ID to switch to
 * @returns 
 */
export const fetchSwitchBranch = async (branch_id: string): Promise<{ success: boolean; result: any; user: any }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/switch-branch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ branch_id }),
    });

    if (!res.ok) {
        throw new Error('Failed to switch branch');
    }

    const responseData = await res.json();
    return responseData;
};













/********************************* Hooks *********************************/

/**
 * Use queues
 * @param branchId 
 * @param options 
 * @returns 
 */
export const useQueues = (branchId: string | undefined, options?: Omit<UseQueryOptions<QueuesResponse, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: queueKeys.list(branchId as string),
        queryFn: () => fetchQueues(branchId as string),
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
 * Use get merchants
 */
export const useGetMerchants = (options?: Omit<UseQueryOptions<{ success: boolean; result: Merchant[] }, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: merchantKeys.merchants(),
        queryFn: fetchGetMerchants,
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
        queryKey: userMerchantKeys.detail(merchantId),
        queryFn: () => fetchUserMerchants(merchantId),
        ...options,
    });
};

/**
 * Use branches
 * @param merchantId 
 * @param userId - Optional user ID for role-based filtering
 * @param options 
 * @returns 
 */
export const useBranches = (merchantId: string, userId?: string, options?: Omit<UseQueryOptions<BranchesResponse, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: [...branchKeys.detail(merchantId), userId],
        queryFn: () => fetchBranches(merchantId, false, userId),
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
 * Use update merchant address
 * @param options 
 * @returns 
 */
export const useUpdateMerchantAddress = (options?: Omit<UseMutationOptions<{ success: boolean; result: { address: Address } }, Error, { merchant_id: string; data: Partial<Address> }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchUpdateMerchantAddress,
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
export const useUploadBranchImages = (options?: Omit<UseMutationOptions<BranchImagesResponse, Error, { branch_id: string; data: any, image_type: 'logo' | 'feature-image' | 'galleries' }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchUploadBranchImages,
        ...options,
    });
};

/**
 * Use update branch image
 * @param options 
 * @returns 
 */
export const useUpdateBranchImage = (options?: Omit<UseMutationOptions<BranchImagesResponse, Error, { branch_id: string; image_id: string }>, 'mutationFn'>) => {
    return useMutation({ mutationFn: fetchUpdateBranchImage, ...options });
};

/**
 * Use delete branch images
 * @param options 
 * @returns 
 */
export const useDeleteBranchImage = (options?: Omit<UseMutationOptions<BranchImagesResponse, Error, { branch_id: string; image_id: string }>, 'mutationFn'>) => {
    return useMutation({ mutationFn: fetchDeleteBranchImages, ...options });
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

/**
 * useUpdateBranchOpeningHours hook
 */
export const useUpdateBranchOpeningHours = (options?: Omit<UseMutationOptions<BranchOpeningHourResponse, Error, { branch_id: string; data: Partial<BranchOpeningHour> }>, 'mutationFn'>) => {
    return useMutation({ mutationFn: fetchUpdateBranchOpeningHours, ...options });
};

/**
 * useCreateBranch hook
 */
export const useCreateBranch = (options?: Omit<UseMutationOptions<BranchResponse, Error, { 
    branch_name: string; 
    contact_person_id: string; 
    phone?: string; 
    email?: string; 
    description?: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
        unit?: string;
        floor?: string;
    };
}>, 'mutationFn'>) => {
    return useMutation({ mutationFn: fetchCreateBranch, ...options });
};

/**
 * Use switch branch
 * @param options 
 * @returns 
 */
export const useSwitchBranch = (options?: Omit<UseMutationOptions<{ success: boolean; result: any; user: any }, Error, string>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchSwitchBranch,
        ...options,
    });
};

/**
 * Use upload logo
 * @param options 
 * @returns 
 */
export const useUploadLogo = (options?: Omit<UseMutationOptions<LogoResponse, Error, File>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchUploadLogo,
        ...options,
    });
};

/**
 * Use delete logo
 * @param options 
 * @returns 
 */
export const useDeleteLogo = (options?: Omit<UseMutationOptions<{ success: boolean }, Error, string>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchDeleteLogo,
        ...options,
    });
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
 * @param userId - Optional user ID for role-based filtering
 * @returns 
 */
export const prefetchBranches = async (queryClient: any, merchantId: string, userId?: string) => {
    await queryClient.prefetchQuery({
        queryKey: [...branchKeys.detail(merchantId), userId],
        queryFn: () => fetchBranches(merchantId, true, userId),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });

    return queryClient.getQueryData([...branchKeys.detail(merchantId), userId]);
};