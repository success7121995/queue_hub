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

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error('Failed to create queue');
            }

            console.log('responseData', responseData);

            return responseData;
        },
    });
};

/**
 * View queues by branch
 * @returns The queues with their tags
 */
export const useViewQueuesByBranch = () => {
    const { data: currentUser } = useAuth();
    const effectiveBranchId = currentUser?.user?.branch_id;

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
            });

            if (!res.ok) {
                throw new Error('Failed to view queues');
            }

            const responseData = await res.json();

            return responseData.result;
        },
        enabled: !!effectiveBranchId,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60,
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

/**
 * Open or close a queue (update status)
 * @returns The updated queue
 */
export const useOpenOrCloseQueue = () => {
    return useMutation({
        mutationFn: async ({ queue_id, queue_status }: { queue_id: string; queue_status: QueueStatus }) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/queues/${queue_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ queue_status }),
            });
            if (!res.ok) {
                throw new Error('Failed to update queue status');
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
        enabled: !!branchId,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
    });
};