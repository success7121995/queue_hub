import { UserProfile } from "@/types/user";
import { useMutation } from "@tanstack/react-query";

/**
 * Update user profile
 */
export const useUpdateUserProfile = () => {
    return useMutation({
        mutationFn: async (data: Partial<UserProfile>) => {
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

            return await res.json();
        },
    });
};