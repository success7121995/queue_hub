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

            return { queues, tags };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

        return result;
    }
}; 