import { useMutation, useQuery, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import Cookies from 'js-cookie';
import type { User, UserMerchant, UserAdmin } from "@/types/user";
import { Branch, Merchant } from "@/types/merchant";
import { AddEmployeeFormFields } from "@/types/form";

// Types
export interface LoginFormInputs {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    user: {
        username?: string;
        fname?: string;
        lname?: string;
        position?: string;
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
    };
    sessionId?: string;
}

export interface LogoutResponse {
    success: boolean;
    message?: string;
}

/**
 * Query keys
 */
export const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
} as const;

/**
 * Fetch auth
 * @returns 
 */
export const fetchAuth = async (): Promise<AuthResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch auth data');
    }

    const responseData = await res.json();

    if (!responseData) {
        throw new Error('Invalid auth response: no result data');
    }

    return responseData;
};

/**
 * Fetch add new employee
 * @param data 
 * @returns 
 */
export const fetchCreateUser = async (data: AddEmployeeFormFields): Promise<AuthResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/employee/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            fname: data.userInfo.fname,
            lname: data.userInfo.lname,
            username: data.accountSetup.username,
            password: data.accountSetup.password,
            confirm_password: data.accountSetup.confirm_password,
            staff_id: data.userInfo.staff_id,
            email: data.userInfo.email,
            phone: data.userInfo.phone,
            role: data.userInfo.role,
            position: data.userInfo.position,
            image_url: data.userInfo.image_url,
        }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create user');
    }

    return res.json();
};

/**
 * Fetch login
 * @param data 
 * @returns 
 */
export const fetchLogin = async (data: LoginFormInputs): Promise<AuthResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    const responseData = await res.json();

    if (!res.ok) {
        throw new Error(responseData.message || 'Login failed');
    }

    return responseData;
};

/**
 * Fetch logout
 * @returns 
 */
export const fetchLogout = async (): Promise<LogoutResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    
    const responseData = await res.json();

    if (!res.ok) {
        throw new Error(responseData.message || 'Logout failed');
    }

    // Clear cookies
    Cookies.remove('session_id', { path: '/' });
    Cookies.remove('role', { path: '/' });

    return responseData;
};





/***************** Hooks *****************/

/**
 * Use auth
 * @param options 
 * @returns 
 */
export const useAuth = (options?: Omit<UseQueryOptions<AuthResponse, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: authKeys.user(),
        queryFn: fetchAuth,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        ...options,
    });
};

/**
 * Use create user
 * @param options 
 * @returns 
 */
export const useCreateUser = (options?: Omit<UseMutationOptions<AuthResponse, Error, AddEmployeeFormFields>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchCreateUser,
        ...options,
    });
};

/**
 * Use login
 * @param options 
 * @returns 
 */
export const useLogin = (options?: Omit<UseMutationOptions<AuthResponse, Error, LoginFormInputs>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchLogin,
        ...options,
    });
};

/**
 * Use logout
 * @param options 
 * @returns 
 */
export const useLogout = (options?: Omit<UseMutationOptions<LogoutResponse, Error, void>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchLogout,
        ...options,
    });
};