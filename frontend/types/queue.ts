export interface QueuesWithTags {
  queues: Queue;
  tags: Tag[];
}

export interface Queue {
  queue_name: string;
  tags?: string;
}

export type QueueStatus = 'OPEN' | 'CLOSED';

export interface QueueEntry {
  id: number;
  userId: number;
  status: QueueEntryStatus;
  joinedAt: Date;
  leftAt: Date | null;
}

export type QueueEntryStatus = 'WAITING' | 'SERVED' | 'CANCELLED' | 'NO_SHOW';

export interface QueueHistory {
  id: number;
  entryId: number;
  action: string;
  timestamp: string;
}

export interface Tag {
  tag_id: string;
  entity_id: string;
  branch_id: string;
  tag_name: string;
  created_at: string;
  updated_at: string;
}

export interface QueueWithTags {
  queue_id: string;
  branch_id: string;
  queue_name: string;
  queue_status: QueueStatus;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}