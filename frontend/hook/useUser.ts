import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useUser = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    
    const { data: user, isLoading, error } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            // First verify session
            const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify`, {
                method: 'GET',
                credentials: 'include',
            });

            const sessionData = await sessionRes.json();
            
            if (!sessionData.success || !sessionData.user) {
                // Clear any stale data
                queryClient.clear();
                // Redirect to login if session is invalid
                router.push('/login');
                throw new Error('No valid session');
            }

            // If we have session data, use it directly
            if (sessionData.user.userId) {
                return sessionData.user;
            }

            // Fallback to fetching full user data if needed
            const includes = {
                user_merchant: true,
                merchant: true,
                message_sent: true,
                message_received: true,
            };
            
            const userRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-user?${Object.entries(includes)
                    .map(([key]) => `include=${key}`)
                    .join('&')}`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            );

            if (!userRes.ok) {
                throw new Error('Failed to fetch user data');
            }

            return userRes.json();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1, // Only retry once on failure
        retryDelay: 1000, // Wait 1 second before retrying
    });

    return { user, isLoading, error };
};