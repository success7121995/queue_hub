import { useMutation, useQuery } from "@tanstack/react-query";
import Cookies from 'js-cookie';

export type LoginFormInputs = {
    email: string;
    password: string;
};

/**
 * Login mutation
 * @returns The login response
 */
export const useLogin = () => {
    return useMutation({
        mutationFn: async (data: LoginFormInputs) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            return response.json();
        },
    });
};

/**
 * Logout mutation
 * @returns The logout response
 */
export const useLogout = () => {
    return useMutation({
        mutationFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            // Clear cookies
            Cookies.remove('session_id', { path: '/' });
            Cookies.remove('role', { path: '/' });

            return response.json();
        },
    });
};

/**
 * User query
 * @returns The user data
 */
export const useAuth = () => {
    return useQuery({
        queryKey: ['auth'],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch auth data');
            }

            return response.json();
        },
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};