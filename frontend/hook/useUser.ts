import { useQuery } from "@tanstack/react-query";

export const useUser = () => {
    const includes = {
        user_merchant: true,
        merchant: true,
        message_sent: true,
        message_received: true,
    }
    
    const { data: user, isLoading, error } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-user?${Object.entries(includes).map(([key]) => `include=${key}`).join('&')}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Failed to fetch user');
            }
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    return { user, isLoading, error };
};