export interface Queue {
  id: number;
  name: string;
  description?: string;
  status: QueueStatus;
  createdAt: Date;
  updatedAt: Date;
  entries?: QueueEntry[];
  tags?: QueueTag[];
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

export interface QueueTag {
  id: number;
  tagId: number;
  createdAt: Date;
  updatedAt: Date;
}