export interface Notification {
  notification_id: string;
  user_id: string;
  title: string;
  content: string;
  is_read: boolean;
  read_at?: string | Date;
  redirect_url?: string;
  created_at: string | Date;
}

export type NotificationType = 'info' | 'warning' | 'success' | 'error'; 