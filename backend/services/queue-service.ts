import { prisma } from "../lib/prisma";
import { Prisma, Queue, Tag } from "@prisma/client";
import { AppError } from "../utils/app-error";

// Handles: queue operations, customer management, wait time calculations
export const queueService = {
    async viewQueuesByBranch(branch_id: string) {

        const result = await prisma.$transaction(async (tx) => {
            const queues = await tx.queue.findMany({
                where: {
                    branch_id,
                },
            });

            const tags = await tx.tag.findMany({
                where: {
                    entity_id: {
                        in: queues.map((queue) => queue.queue_id),
                    },
                },
            });

            const tagsByQueueId = tags.reduce((acc, tag) => {
                if (!acc[tag.entity_id]) acc[tag.entity_id] = [];
                acc[tag.entity_id].push(tag);
                return acc;
            }, {} as Record<string, Tag[]>);

            // Attach tags to each queue
            const queuesWithTags = queues.map((queue) => ({
                ...queue,
                tags: tagsByQueueId[queue.queue_id] || [],
            }));

            return queuesWithTags;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    }
}; 