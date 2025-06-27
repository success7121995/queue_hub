// Socket.io placeholder utility for real-time functionality
// This is a mock implementation to demonstrate the structure

export interface SocketEvent {
  type: 'message' | 'notification' | 'connection';
  data: any;
}

export class SocketPlaceholder {
  private listeners: Map<string, ((event: SocketEvent) => void)[]> = new Map();

  // Mock connection
  connect() {
    console.log('🔌 Socket.io placeholder: Connected');
    // Simulate connection events
    setTimeout(() => {
      this.emit('connected', { type: 'connection', data: { status: 'connected' } });
    }, 100);
  }

  // Mock disconnection
  disconnect() {
    console.log('🔌 Socket.io placeholder: Disconnected');
    this.listeners.clear();
  }

  // Mock event emission
  emit(event: string, data: SocketEvent) {
    console.log(`🔌 Socket.io placeholder: Emitting ${event}`, data);
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  // Mock event listening
  on(event: string, callback: (data: SocketEvent) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Mock event removal
  off(event: string, callback: (data: SocketEvent) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // Mock room joining
  joinRoom(room: string) {
    console.log(`🔌 Socket.io placeholder: Joined room ${room}`);
  }

  // Mock room leaving
  leaveRoom(room: string) {
    console.log(`🔌 Socket.io placeholder: Left room ${room}`);
  }
}

// Export singleton instance
export const socketPlaceholder = new SocketPlaceholder();

// Mock real-time data updates
export const mockRealTimeUpdates = () => {
  // Simulate new message
  setTimeout(() => {
    socketPlaceholder.emit('new_message', {
      type: 'message',
      data: {
        message_id: 'msg_real_time_1',
        sender_id: 'system',
        receiver_id: 'current_user',
        subject_id: 'queue_update',
        content: 'New message received in real-time!',
        created_at: new Date()
      }
    });
  }, 5000);

  // Simulate new notification
  setTimeout(() => {
    socketPlaceholder.emit('new_notification', {
      type: 'notification',
      data: {
        notification_id: 'notif_real_time_1',
        user_id: 'current_user',
        title: 'Real-time Alert',
        content: 'This notification was sent in real-time via Socket.io!',
        is_read: false,
        redirect_url: '/merchant/dashboard',
        created_at: new Date()
      }
    });
  }, 8000);
}; 