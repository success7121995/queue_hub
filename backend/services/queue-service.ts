import { prisma } from "../lib/prisma";
import { Prisma, Tag, PrismaClient } from "@prisma/client";

// Handles: queue operations, customer management, wait time calculations
export const queueService = {
    async viewQueuesByBranch(branch_id: string) {
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const queues = await tx.queue.findMany({
                where: {
                    branch_id,
                },
            });

            const tags = await tx.tag.findMany({
                where: {
                    entity_id: {
                        in: queues.map((queue: any) => queue.queue_id),
                    },
                },
            });

            const tagsByQueueId = tags.reduce((acc: Record<string, Tag[]>, tag: Tag) => {
                if (!acc[tag.entity_id]) acc[tag.entity_id] = [];
                acc[tag.entity_id].push(tag);
                return acc;
            }, {} as Record<string, Tag[]>);

            // Attach tags to each queue
            const queuesWithTags = queues.map((queue: any) => ({
                ...queue,
                tags: tagsByQueueId[queue.queue_id] || [],
            }));

            return { queues: queuesWithTags };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    }
}; 