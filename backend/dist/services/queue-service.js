"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueService = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
exports.queueService = {
    async viewQueuesByBranch(branch_id) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
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
                if (!acc[tag.entity_id])
                    acc[tag.entity_id] = [];
                acc[tag.entity_id].push(tag);
                return acc;
            }, {});
            const queuesWithTags = queues.map((queue) => ({
                ...queue,
                tags: tagsByQueueId[queue.queue_id] || [],
            }));
            return { queues: queuesWithTags };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted });
        return result;
    }
};
