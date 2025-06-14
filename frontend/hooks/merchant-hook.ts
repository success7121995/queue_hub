import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "./auth-hooks";
import { QueueStatus } from "@/types/queue";

export interface QueueData {
    queue_name: string;
    tags: string;
}

export interface Tag {
    tag_id: string;
    entity_id: string;
    branch_id: string;
    tag_name: string;
    created_at: string;
    updated_at: string;
}

export interface Queue {
    queue_id: string;
    branch_id: string;
    queue_name: string;
    queue_status: QueueStatus;
    created_at: string;
    updated_at: string;
}

export interface QueueWithTags extends Queue {
    tags: Tag[];
}

/**
 * Create a new queue
 * @returns The created queue
 */
export const useCreateQueue = () => {
    return useMutation({
        mutationFn: async (data: QueueData) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/queues/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error('Failed to create queue');
            }

            return res.json();
        },
    });
};

/**
 * View queues by branch
 * @returns The queues with their tags
 */
export const useViewQueuesByBranch = () => {
    const { data: currentUser } = useAuth();
    const effectiveBranchId = currentUser?.user?.branchId;

    return useQuery({
        queryKey: ['queues', effectiveBranchId],
        queryFn: async () => {
            if (!effectiveBranchId) {
                throw new Error('No branch ID available');
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/queues/${effectiveBranchId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                cache: 'force-cache',
            });

            if (!res.ok) {
                throw new Error('Failed to view queues');
            }

            const data = await res.json();
            
            const formattedQueues: QueueWithTags[] = data.result.queues.map((queue: Queue) => ({
                ...queue,
                tags: data.result.tags.filter((tag: Tag) => tag.entity_id === queue.queue_id)
            }));

            return formattedQueues;
        },
        enabled: true,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        placeholderData: (previousData) => previousData,
    });
};

/**
 * Delete a queue
 * @returns The deleted queue
 */
export const useDeleteQueue = () => {
    return useMutation({
        mutationFn: async (queue_id: string) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/queues/${queue_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
            });
            if (!res.ok) {
                throw new Error('Failed to delete queue');
            }
            return res.json();
        },
    });
};

/**
 * Update a queue
 * @returns The updated queue
 */
export const useUpdateQueue = () => {
    return useMutation({
        mutationFn: async (data: { queue_id: string; data: QueueData }) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/queues/${data.queue_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                throw new Error('Failed to update queue');
            }
            return res.json();
        },
    });
};

// Add a prefetch function for queues
export const prefetchQueues = async (queryClient: any, branchId: string) => {
    await queryClient.prefetchQuery({
        queryKey: ['queues', branchId],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/queues/${branchId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                cache: 'force-cache',
            });

            if (!res.ok) {
                throw new Error('Failed to prefetch queues');
            }

            const data = await res.json();
            return data.result.queues.map((queue: Queue) => ({
                ...queue,
                tags: data.result.tags.filter((tag: Tag) => tag.entity_id === queue.queue_id)
            }));
        },
    });
};