import { User } from "@/types/user";
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { AddAdminFormFields, AdminInfo } from "@/types/form";
import { AuthResponse } from "@/types/response";
import { Merchant, ApprovalStatus } from "@/types/merchant";

export const adminKeys = {
    all: ['admin'] as const,
    admins: () => [...adminKeys.all, 'admins'] as const,
    merchants: () => [...adminKeys.all, 'merchants'] as const,
};

/**
 * Fetch get all admins
 */
export const fetchGetAdmins = async (): Promise<{ success: boolean; result: User[] }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get admins');
    }
    const responseData = await res.json();
    return responseData;
};

/**
 * Fetch add new admin
 */
export const fetchAddAdmin = async (data: AddAdminFormFields): Promise<AuthResponse> => {
    // Flatten the nested data structure to match backend expectations
    const flattenedData = {
        fname: data.userInfo.fname,
        lname: data.userInfo.lname,
        username: data.accountSetup.username,
        password: data.accountSetup.password,
        confirm_password: data.accountSetup.confirm_password,
        admin_id: data.userInfo.staff_id,
        email: data.userInfo.email,
        phone: data.userInfo.phone,
        role: data.userInfo.role,
        position: data.userInfo.position,
        image_url: data.userInfo.image_url,
        supervisor_id: (data.userInfo as AdminInfo).supervisor_id || null
    };
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(flattenedData),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create admin');
    }
    return res.json();
};

/**
 * Fetch get merchants (admin)
 */
export const fetchAdminGetMerchants = async (filters: Record<string, any> = {}): Promise<{ success: boolean; result: Merchant[] }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else if (value !== undefined && value !== null) {
            params.append(key, value);
        }
    });
    const queryString = params.toString();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/merchants${queryString ? `?${queryString}` : ''}`, {
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
 * Fetch update merchant (admin)
 * @param merchant_id
 * @param data
 * @returns
 */
export const fetchAdminUpdateMerchant = async ({ merchant_id, data }: { merchant_id: string; data: Partial<Merchant> }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/merchants/${merchant_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update merchant');
    }
    return res.json();
};

/**
 * Fetch delete merchant (admin)
 */
export const fetchAdminDeleteMerchant = async ({ merchant_id }: { merchant_id: string }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/merchants/${merchant_id}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete merchant');
    }

    return res.json();
};

/**
 * Fetch approve merchant (admin)
 */
export const fetchAdminApproveMerchant = async ({ merchant_id, approval_status, reason }: { merchant_id: string; approval_status: ApprovalStatus, reason?: string }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/merchants/${merchant_id}/approval`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ approval_status, ...(reason ? { reason } : {}) }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to approve merchant');
    }

    return res.json();
};


















/***************** Hooks *****************/

/**
 * Use get admins
 * @param options
 * @returns
 */
export const useGetAdmins = (options?: Omit<UseQueryOptions<{ success: boolean; result: User[] }, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: adminKeys.admins(),
        queryFn: fetchGetAdmins,
        ...options,
    });
};

/**
 * Use add new admin
 * @param options
 * @returns
 */
export const useAddAdmin = (options?: Omit<UseMutationOptions<AuthResponse, Error, AddAdminFormFields>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchAddAdmin,
        ...options,
    });
};

/**
 * useAdminGetMerchants - React Query hook for admin merchant filtering
 * @param filters
 * @param options
 * @returns
 */
export const useAdminGetMerchants = (filters: Record<string, any> = {}, options?: Omit<UseQueryOptions<{ success: boolean; result: Merchant[] }, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: [adminKeys.merchants(), filters],
        queryFn: () => fetchAdminGetMerchants(filters),
        ...options,
    });
};

/**
 * useAdminUpdateMerchant - React Query mutation for admin merchant update
 * @param options
 * @returns
 */
export const useAdminUpdateMerchant = (options?: Omit<UseMutationOptions<any, Error, { merchant_id: string; data: Partial<Merchant> }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchAdminUpdateMerchant,
        ...options,
    });
};

/**
 * useAdminDeleteMerchant - React Query mutation for admin merchant delete
 * @param options
 * @returns
 */
export const useAdminDeleteMerchant = (options?: Omit<UseMutationOptions<any, Error, { merchant_id: string }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchAdminDeleteMerchant,
        ...options,
    });
};

/**
 * useAdminApproveMerchant - React Query mutation for admin merchant approval
 * @param options
 * @returns
 */
export const useAdminApproveMerchant = (options?: Omit<UseMutationOptions<any, Error, { merchant_id: string; approval_status: ApprovalStatus, reason?: string }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchAdminApproveMerchant,
        ...options,
    });
};