import { User, UserProfile } from "@/types/user";
import { QueryClient, useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { EmployeesResponse, MessagePreviewResponse, MessageResponse, NotificationResponse } from "@/types/response";
import { AddAdminFormFields, CreateTicketFormFields, EditEmployeeFormFields } from "@/types/form";


/**
 * Query keys
 */
export const userKeys = {
    all: ['user'] as const,
    employees: () => [...userKeys.all, 'employees'] as const,
    avatar: () => [...userKeys.all, 'avatar'] as const,
    messages: () => [...userKeys.all, 'messages'] as const,
    lastMessages: () => [...userKeys.all, 'lastMessages'] as const,
    conversation: (other_user_id: string) => [...userKeys.all, 'conversation', other_user_id] as const,
    tickets: () => [...userKeys.all, 'tickets'] as const,
    allTickets: () => [...userKeys.all, 'allTickets'] as const,
    notifications: () => [...userKeys.all, 'notifications'] as const,
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
 * Fetch send message
 * @param receiverId - The receiver's user ID
 * @param content - The message content
 * @returns 
 */
export const fetchSendMessage = async ({ receiverId, content }: { receiverId: string; content: string }): Promise<MessageResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ receiverId, content }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send message');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch send message with attachment
 * @param receiverId - The receiver's user ID
 * @param content - The message content
 * @param file - The file to attach
 * @returns 
 */
export const fetchSendMessageWithAttachment = async ({ receiverId, content, file }: { receiverId: string; content: string; file: File }): Promise<MessageResponse> => {
    const formData = new FormData();
    formData.append('receiverId', receiverId);
    formData.append('content', content);
    formData.append('ATTACHMENT', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/send-with-attachment`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send message with attachment');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Get all last messages (previews)
 * @returns 
 */
export const fetchGetAllLastMessages = async (): Promise<{ success: boolean; messages: any[] }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/last`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get all messages');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Get conversation with a specific user
 * @param other_user_id - The other user's ID
 * @param before - The timestamp of the last message
 * @param limit - The number of messages to fetch
 * @returns 
 */
export const fetchGetConversation = async (other_user_id: string, before: string, limit: number): Promise<{ success: boolean; messages: any[]; hasMore: boolean }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/conversation/${other_user_id}?before=${before}&limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get conversation');
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
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to mark message as read');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch hide chat
 * @param user_id 
 * @param other_user_id 
 * @returns 
 */
export const fetchHideChat = async (user_id: string, other_user_id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/conversation/${other_user_id}/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to hide chat');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch update hidden chat
 * @param user_id
 * @param other_user_id
 * @returns
 */
export const fetchUpdateHiddenChat = async (user_id: string, other_user_id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/conversation/${other_user_id}/update`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update hidden chat');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch create ticket
 * @param data
 * @returns
 */
export const fetchCreateTicket = async (data: CreateTicketFormFields): Promise<{ success: boolean; result: { ticket_id: string } }> => {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('category', data.category);
    formData.append('message', data.message);
    
    // Append files if they exist
    if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
            formData.append('FILES', file);
        });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/ticket`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create ticket');
    }   
    
    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch get tickets for regular users
 * @param status - Optional status filter(s)
 * @returns
 */
export const fetchGetTickets = async (status?: string | string[]): Promise<{ success: boolean; result: { tickets: any[] } }> => {
    const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/ticket`);
    
    if (status) {
        if (Array.isArray(status)) {
            status.forEach(s => url.searchParams.append('status', s));
        } else {
            url.searchParams.append('status', status);
        }
    }

    const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get tickets');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch get all tickets for admin users
 * @param status - Optional status filter(s)
 * @returns
 */
export const fetchGetAllTickets = async (status?: string | string[]): Promise<{ success: boolean; result: { tickets: any[] } }> => {
    const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/ticket/all`);
    
    if (status) {
        if (Array.isArray(status)) {
            status.forEach(s => url.searchParams.append('status', s));
        } else {
            url.searchParams.append('status', status);
        }
    }

    const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get all tickets');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch get ticket
 * @param ticket_id
 * @returns
 */
export const fetchGetTicket = async (ticket_id: string): Promise<{ success: boolean; result: { ticket: any } }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/ticket/${ticket_id}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get ticket');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch get notifications
 * @returns 
 */
export const fetchGetNotifications = async (): Promise<NotificationResponse> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/notifications`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get notifications');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch mark notification as read
 * @param notification_id - The notification ID
 * @returns 
 */
export const fetchMarkNotificationAsRead = async (notification_id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/notifications/${notification_id}/read`, {
        method: 'PUT',
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to mark notification as read');
    }

    const responseData = await res.json();
    return responseData;
}

/**
 * Fetch delete notification
 * @param notification_id - The notification ID
 * @returns 
 */
export const fetchDeleteNotification = async (notification_id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/notifications/${notification_id}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete notification');
    }

    const responseData = await res.json();
    return responseData;
}






















/*********** HOOKS ***********/
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
 * Use send message
 * @param options 
 * @returns 
 */
export const useSendMessage = (options?: Omit<UseMutationOptions<MessageResponse, Error, { receiverId: string; content: string }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchSendMessage,
        ...options,
    });
}

/**
 * Use send message with attachment
 * @param options 
 * @returns 
 */
export const useSendMessageWithAttachment = (options?: Omit<UseMutationOptions<MessageResponse, Error, { receiverId: string; content: string; file: File }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchSendMessageWithAttachment,
        ...options,
    });
}

/**
 * Use get all last messages
 * @param options 
 * @returns 
 */
export const useGetAllLastMessages = (options?: Omit<UseQueryOptions<{ success: boolean; messages: any[] }, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: userKeys.lastMessages(),
        queryFn: fetchGetAllLastMessages,
        ...options,
    });
}

/**
 * Use get conversation
 * @param other_user_id - The other user's ID
 * @param options 
 * @returns 
 */
export const useGetConversation = (other_user_id: string, before: string, limit: number, options?: Omit<UseQueryOptions<{ success: boolean; messages: any[]; hasMore: boolean }, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: userKeys.conversation(other_user_id),
        queryFn: () => fetchGetConversation(other_user_id, before, limit),
        enabled: !!other_user_id,
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

/**
 * Use hide chat
 * @param options 
 * @returns 
 */
export const useHideChat = (user_id: string, other_user_id: string, options?: Omit<UseMutationOptions<{ success: boolean }, Error, { user_id: string; other_user_id: string }>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: () => fetchHideChat(user_id, other_user_id),
        ...options,
    });
}

/**
 * Use update hidden chat
 * @param options
 * @returns
 */
export const useUpdateHiddenChat = (user_id: string, other_user_id: string, options?: Omit<UseMutationOptions<{ success: boolean }, Error, void>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: () => fetchUpdateHiddenChat(user_id, other_user_id),
        ...options,
    });
}

/**
 * Use create ticket
 * @param options
 * @returns
 */
export const useCreateTicket = (options?: Omit<UseMutationOptions<{ success: boolean; result: { ticket_id: string } }, Error, CreateTicketFormFields>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchCreateTicket,
        ...options,
    });
}

/**
 * Use get tickets for regular users
 * @param status - Optional status filter(s)
 * @param options
 * @returns
 */
export const useGetTickets = (status?: string | string[], options?: Omit<UseQueryOptions<{ success: boolean; result: { tickets: any[] } }, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: [...userKeys.tickets(), status],
        queryFn: () => fetchGetTickets(status),
        ...options,
    });
}

/**
 * Use get all tickets for admin users
 * @param status - Optional status filter(s)
 * @param options
 * @returns
 */
export const useGetAllTickets = (status?: string | string[], options?: Omit<UseQueryOptions<{ success: boolean; result: { tickets: any[] } }, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: [...userKeys.allTickets(), status],
        queryFn: () => fetchGetAllTickets(status),
        ...options,
    });
}

/**
 * Use get ticket
 * @param ticket_id
 * @param options
 * @returns
 */
export const useGetTicket = (ticket_id: string, options?: Omit<UseQueryOptions<{ success: boolean; result: { ticket: any } }, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: [...userKeys.tickets(), ticket_id],
        queryFn: () => fetchGetTicket(ticket_id),
        enabled: !!ticket_id,
        ...options,
    });
}

/**
 * Use get notifications
 * @param options 
 * @returns 
 */
export const useGetNotifications = (options?: Omit<UseQueryOptions<NotificationResponse, Error>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: userKeys.notifications(),
        queryFn: fetchGetNotifications,
        ...options,
    });
}

/**
 * Use mark notification as read
 * @param options 
 * @returns 
 */
export const useMarkNotificationAsRead = (options?: Omit<UseMutationOptions<{ success: boolean }, Error, string>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchMarkNotificationAsRead,
        ...options,
    });
};

/**
 * Use delete notification
 * @param options 
 * @returns 
 */
export const useDeleteNotification = (options?: Omit<UseMutationOptions<{ success: boolean }, Error, string>, 'mutationFn'>) => {
    return useMutation({
        mutationFn: fetchDeleteNotification,
        ...options,
    });
};



















/*** PREFETCH ***********/

/**
 * Prefetch notifications
 * @param queryClient 
 * @returns 
 */
export const prefetchNotifications = async (queryClient: any) => {
    await queryClient.prefetchQuery({
        queryKey: userKeys.notifications(),
        queryFn: fetchGetNotifications,
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes
    });

    return queryClient.getQueryData(userKeys.notifications());
};