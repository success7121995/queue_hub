export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'info' | 'warning' | 'success' | 'error'; 