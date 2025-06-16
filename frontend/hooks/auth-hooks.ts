import { useMutation, useQuery } from "@tanstack/react-query";
import Cookies from 'js-cookie';
import { useLang } from "@/constant/lang-provider";

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
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Login failed');
            }

            return res.json();
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Logout failed');
            }

            // Clear cookies
            Cookies.remove('session_id', { path: '/' });
            Cookies.remove('role', { path: '/' });

            return res.json();
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Failed to fetch auth data');
            }

            const result = await res.json();

            // Set lang to cookie
            const { setLang } = useLang();
            setLang(result.user.lang);

            return result;
        },
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};