import { useMutation, useQuery, type UseQueryOptions, type UseMutationOptions, QueryClient } from "@tanstack/react-query";
import Cookies from 'js-cookie';
import { AddEmployeeFormFields, SignupFormFields, AdminInfo } from "@/types/form";
import { AuthResponse, ChangePasswordResponse, LogoutResponse } from "@/types/response";
import { User, UserAdmin, UserMerchant } from "@/types/user";

// Define the backend base URL explicitly for production
const BACKEND_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://queue-hub-backend.onrender.com'
  : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5500');

// Types
export interface LoginFormInputs {
    email: string;
    password: string;
}

export interface ChangePasswordFormInputs {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

/**
 * Query keys
 */
export const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
    uniqueUsernameAndEmail: () => [...authKeys.all, 'uniqueUsernameAndEmail'] as const,
} as const;

/**
 * Fetch unique username and email
 * @param username 
 * @param email 
 * @returns 
 */
export const fetchUniqueUsernameAndEmail = async (username?: string, email?: string): Promise<{isUniqueUsername: boolean, isUniqueEmail: boolean}> => {
    const res = await fetch(`${BACKEND_BASE_URL}/api/user/unique-username-and-email?${username ? `username=${username}` : ''}${email ? `&email=${email}` : ''}`, {
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch unique username and email');
    }

    const responseData = await res.json();
    return {
        isUniqueUsername: responseData.result?.isUniqueUsername,
        isUniqueEmail: responseData.result?.isUniqueEmail
    };
};

/**
 * Fetch auth
 * @returns 
 */
export const fetchAuth = async (): Promise<AuthResponse> => {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/me`, {
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
 * Fetch add new employee or admin
 * @param data 
 * @returns 
 */
export const fetchCreateUser = async (data: AddEmployeeFormFields): Promise<AuthResponse> => {
    // Flatten the nested data structure to match backend expectations
    const flattenedData = {
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
    };
    
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/employee/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(flattenedData),
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
export const fetchLogin = async (data: LoginFormInputs): Promise<{success: boolean, result: {user: User, userMerchant?: UserMerchant, userAdmin?: UserAdmin }, sessionId: string}> => {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
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
 * Fetch merchant signup
 * @param data 
 * @returns 
 */
export const fetchSignup = async (data: SignupFormFields): Promise<{ success: boolean; result: any }> => {
    const res = await fetch(`${BACKEND_BASE_URL}/api/merchant/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Signup failed');
    }

    return res.json();
};

/**
 * Fetch logout
 * @returns 
 */
export const fetchLogout = async (): Promise<LogoutResponse> => {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    
    const responseData = await res.json();

    if (!res.ok) { 
        throw new Error(responseData.message || 'Logout failed');
    }

    // Remove cookies with all relevant options
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
        path: '/',
        secure: isProduction,
        sameSite: isProduction ? 'none' as const : 'lax' as const,
        domain: isProduction ? '.queuehub.app' : undefined,
    };

    Cookies.remove('session_id', cookieOptions);
    Cookies.remove('role', cookieOptions);
    Cookies.remove('user_id', cookieOptions);

    // Fallback: also try removing without domain (for localhost/dev)
    Cookies.remove('session_id', { path: '/' });
    Cookies.remove('role', { path: '/' });
    Cookies.remove('user_id', { path: '/' });

    if (responseData.success) {
        window.location.href = '/';
    }

    return responseData;
};

/**
 * Fetch change password
 * @param data 
 * @returns 
 */
export const fetchChangePassword = async (data: ChangePasswordFormInputs): Promise<ChangePasswordResponse> => {
    const res = await fetch(`${BACKEND_BASE_URL}/api/user/change-password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to change password' }));
        throw new Error(errorData.message || 'Failed to change password');
    }

    const responseData = await res.json();
    return responseData;
};











/***************** Hooks *****************/

/**
 * Use unique username and email
 * @param options 
 * @returns 
 */
export const useUniqueUsernameAndEmail = (username?: string, email?: string, options?: Omit<UseQueryOptions<{isUniqueUsername: boolean, isUniqueEmail: boolean}, Error, {username?: string, email?: string}>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: authKeys.uniqueUsernameAndEmail(),
        queryFn: () => fetchUniqueUsernameAndEmail(username, email),
        ...options,
    });
};

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
 * Use create user (employee or admin)
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
export const useLogin = (options?: Omit<UseMutationOptions<{success: boolean, result: {user: User, userMerchant?: UserMerchant}, sessionId: string}, Error, LoginFormInputs>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchLogin,
        ...options,
    });
};

/**
 * Use signup
 * @param options 
 * @returns 
 */
export const useSignup = (options?: Omit<UseMutationOptions<{ success: boolean; result: any }, Error, SignupFormFields>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchSignup,
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

export const useChangePassword = (options?: Omit<UseMutationOptions<ChangePasswordResponse, Error, ChangePasswordFormInputs>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchChangePassword,
        ...options,
    });
};









/***************** Prefetch *****************/
export const prefetchAuth = async (queryClient: any) => {
    await queryClient.prefetchQuery({
        queryKey: authKeys.user(),
        queryFn: fetchAuth,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
    });

    return queryClient.getQueryData(authKeys.user());
};