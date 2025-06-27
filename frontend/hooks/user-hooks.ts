import { UserProfile } from "@/types/user";
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { EmployeesResponse, MessagePreviewResponse } from "@/types/response";
import { EditEmployeeFormFields } from "@/types/form";

/**
 * Query keys
 */
export const userKeys = {
    all: ['user'] as const,
    employees: () => [...userKeys.all, 'employees'] as const,
    avatar: () => [...userKeys.all, 'avatar'] as const,
    messages: () => [...userKeys.all, 'messages'] as const,
} as const;

/**
 * Update user profile
 */
export const fetchUpdateUserProfile = async (data: UserProfile) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to update user profile');
    }

    const responseData = await res.json();
    return responseData;
};

/**
 * Fetch get employees
 * @param merchant_id 
 * @returns 
 */
export const fetchGetEmployees = async (): Promise<EmployeesResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/employee/get`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to get employees');
    }

    const responseData = await res.json();
    return responseData;
};

/**
 * Fetch assign branches to staff
 * @param staffId 
 * @param branchIds 
 * @returns 
 */
export const fetchAssignBranches = async (staff_id: string, branch_ids: string[]): Promise<{ success: boolean }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/employee/${staff_id}/assign-branches`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ branch_ids: branch_ids }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to assign branches');
    }

    const responseData = await res.json();
    return responseData;
};

/**
 * Fetch update employee
 * @param staffId
 * @param data
 * @returns
 */
export const fetchUpdateEmployee = async ({ staffId, data }: { staffId: string, data: Partial<EditEmployeeFormFields> }): Promise<any> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/employee/${staffId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update employee');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch delete employee
 * @param user_id 
 * @returns 
 */
export const fetchDeleteEmployee = async (user_id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/employee/${user_id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete employee');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch avatar
 * @returns 
 */
export const fetchUploadAvatar = async (file: File): Promise<{ success: boolean }> => {
    const formData = new FormData();
    formData.append('AVATAR', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to upload avatar');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch delete avatar
 * @returns 
 */
export const fetchDeleteAvatar = async (): Promise<{ success: boolean }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/avatar`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete avatar');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch get message preview
 * @returns 
 */
export const fetchGetMessagePreview = async (limit: number = 5): Promise<MessagePreviewResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/preview?limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get message preview');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch mark message as read
 * @param message_id 
 * @returns 
 */
export const fetchMarkMessageAsRead = async (message_id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/${message_id}/read`, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify({ message_id }),
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to mark message as read');
    }

    const responseData = await res.json();
    return responseData;
}














/***************** Hooks *****************/
/**
 * Use update user profile
 * @param options
 * @returns
 */
export const useUpdateUserProfile = (options?: Omit<UseMutationOptions<any, Error, UserProfile>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchUpdateUserProfile,
        ...options,
    });
}

/**
 * Use get employees
 * @param options 
 * @returns 
 */
export const useGetEmployees = (options?: Omit<UseQueryOptions<EmployeesResponse, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: userKeys.employees(),
        queryFn: fetchGetEmployees,
        ...options,
    });
};

/**
 * Use assign branches
 * @param options 
 * @returns 
 */
export const useAssignBranches = (options?: Omit<UseMutationOptions<{ success: boolean }, Error, { staff_id: string; branch_ids: string[] }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: ({ staff_id, branch_ids }) => fetchAssignBranches(staff_id, branch_ids),
        ...options,
    });
};

/**
 * Use update employee
 * @param options
 * @returns
 */
export const useUpdateEmployee = (options?: Omit<UseMutationOptions<any, Error, { staffId: string; data: Partial<EditEmployeeFormFields> }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchUpdateEmployee,
        ...options,
    });
}

/**
 * Use delete employee
 * @param options
 * @returns
 */
export const useDeleteEmployee = (options?: Omit<UseMutationOptions<{ success: boolean }, Error, string>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: (user_id: string) => fetchDeleteEmployee(user_id),
        ...options,
    });
}

/**
 * Use upload avatar
 * @param options 
 * @returns 
 */
export const useUploadAvatar = (options?: Omit<UseMutationOptions<{ success: boolean }, Error, File>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchUploadAvatar,
        ...options,
    });
}

/**
 * Use delete avatar
 * @param options 
 * @returns 
 */
export const useDeleteAvatar = (options?: Omit<UseMutationOptions<{ success: boolean }, Error, string>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchDeleteAvatar,
        ...options,
    });
}

/**
 * Use get message preview
 * @param options 
 * @returns 
 */
export const useGetMessagePreview = (limit: number = 10, options?: Omit<UseQueryOptions<MessagePreviewResponse, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: userKeys.messages(),  
        queryFn: () => fetchGetMessagePreview(limit),
        ...options,
    });
}

/**
 * Use mark message as read 
 * @param options 
 * @returns 
 */
export const useMarkMessageAsRead = (options?: Omit<UseMutationOptions<{ success: boolean }, Error, string>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchMarkMessageAsRead,
        ...options,
    });
}










/***************** Prefetch *****************/

/**
 * Prefetch get message preview
 * @returns 
 */
export const prefetchGetMessagePreview = async (limit: number = 5) => {
    return useQuery({
        queryKey: userKeys.messages(),
        queryFn: () => fetchGetMessagePreview(limit),
    });
}