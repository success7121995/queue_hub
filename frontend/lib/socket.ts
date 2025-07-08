import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let isConnecting = false;
let statusChangeCallbacks: ((data: { queueId: string; status: "OPEN" | "CLOSED" }) => void)[] = [];
let queueCreatedCallbacks: ((data: { message: string }) => void)[] = [];
let queueUpdatedCallbacks: ((data: { queueId: string; message: string }) => void)[] = [];
let queueDeletedCallbacks: ((data: { queueId: string; message: string }) => void)[] = [];
let messagePreviewsCallbacks: ((data: any[]) => void)[] = [];
let receiveMessageCallbacks: ((data: any) => void)[] = [];
let messageSentCallbacks: ((data: { success: boolean; message?: any; error?: string }) => void)[] = [];
let newMessageCallbacks: ((data: any) => void)[] = [];
let messageReadCallbacks: ((data: { message_id: string; is_read: boolean }) => void)[] = [];
let notificationUpdateCallbacks: ((data: { notifications: any[]; unreadCount: number }) => void)[] = [];
let notificationDeletedCallbacks: ((data: { success: boolean; notification_id: string }) => void)[] = [];
let chatRoomEnteredCallbacks: ((data: { success: boolean; sender_id: string }) => void)[] = [];
let ticketCreatedCallbacks: ((data: { success: boolean; ticket_id?: string }) => void)[] = [];
let ticketsReceivedCallbacks: ((data: any[]) => void)[] = [];

/**
 * Connect to the socket
 */
export const connectSocket = () => {
    if (socket || isConnecting) return;

    isConnecting = true;
    const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5500';
    
    socket = io(SOCKET_URL, {
        withCredentials: true,
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    if (typeof window !== 'undefined') {
        (window as any).socket = socket;
    }

    /**
     * Handle socket connection
     */
    socket.on("connect", () => {
        console.log("Socket connected successfully");
        isConnecting = false;
    });

    /**
     * Handle socket connection errors
     * @param error - The error object
     */
    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        isConnecting = false;
    });

    /**
     * Handle queue status changes
     * @param data - The data containing the queue ID and status
     */
    socket.on("queueStatusChanged", (data) => {
        statusChangeCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle queue creation
     * @param data - The data containing the creation message
     */
    socket.on("queueCreated", (data) => {
        queueCreatedCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle queue updates
     * @param data - The data containing the queue ID and update message
     */
    socket.on("queueUpdated", (data) => {
        queueUpdatedCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle queue deletion
     * @param data - The data containing the queue ID and deletion message
     */
    socket.on("queueDeleted", (data) => {
        queueDeletedCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle message previews (inbox updates)
     * @param data - The data containing message previews
     */
    socket.on("messagePreviews", (data) => {
        messagePreviewsCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle received messages (new messages in conversation)
     * @param data - The data containing the received message
     */
    socket.on("receiveMessage", (data) => { 
        receiveMessageCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle message sent confirmation
     * @param data - The data containing success status and message or error
     */
    socket.on("messageSent", (data) => {
        messageSentCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle new messages (legacy event)
     * @param data - The data containing the new message
     */
    socket.on("newMessage", (data) => {
        newMessageCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle message read status updates
     * @param data - The data containing the message ID and read status
     */
    socket.on("messageRead", (data) => {
        messageReadCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle notification updates
     * @param data - The data containing notifications and unread count
     */
    socket.on("notificationUpdate", (data) => {
        notificationUpdateCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle notification deletion confirmation
     * @param data - The data containing success status and notification ID
     */
    socket.on("notificationDeleted", (data) => {
        notificationDeletedCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle chat room entered confirmation
     * @param data - The data containing success status and sender ID
     */
    socket.on("chatRoomEntered", (data) => {
        chatRoomEnteredCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle ticket creation confirmation
     * @param data - The data containing success status and ticket ID
     */
    socket.on("ticketCreated", (data) => {
        ticketCreatedCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle tickets data received
     * @param data - The data containing tickets array
     */
    socket.on("tickets", (data) => {
        ticketsReceivedCallbacks.forEach(callback => callback(data));
    });

    /**
     * Handle socket errors
     * @param error - The error object
     */
    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });

    /**
     * Handle socket disconnections
     * @param reason - The reason for disconnection
     */
    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        isConnecting = false;
    });
};

/**
 * Disconnect from the socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        isConnecting = false;
        // Clear all callback arrays to prevent memory leaks
        statusChangeCallbacks = [];
        queueCreatedCallbacks = [];
        queueUpdatedCallbacks = [];
        queueDeletedCallbacks = [];
        messagePreviewsCallbacks = [];
        receiveMessageCallbacks = [];
        messageSentCallbacks = [];
        newMessageCallbacks = [];
        messageReadCallbacks = [];
        notificationUpdateCallbacks = [];
        notificationDeletedCallbacks = [];
        chatRoomEnteredCallbacks = [];
        ticketCreatedCallbacks = [];
        ticketsReceivedCallbacks = [];
    }
};

/**
 * Register a callback for queue status changes
 * @param callback - The callback function to be called when queue status changes
 * @returns A function to unregister the callback
 */
export const onQueueStatusChange = (callback: (data: { queueId: string; status: "OPEN" | "CLOSED" }) => void) => {
    statusChangeCallbacks.push(callback);
    return () => {
        statusChangeCallbacks = statusChangeCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for queue creation
 * @param callback - The callback function to be called when a queue is created
 * @returns A function to unregister the callback
 */
export const onQueueCreated = (callback: (data: { message: string }) => void) => {
    queueCreatedCallbacks.push(callback);
    return () => {
        queueCreatedCallbacks = queueCreatedCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for queue updates
 * @param callback - The callback function to be called when a queue is updated
 * @returns A function to unregister the callback
 */
export const onQueueUpdated = (callback: (data: { queueId: string; message: string }) => void) => {
    queueUpdatedCallbacks.push(callback);
    return () => {
        queueUpdatedCallbacks = queueUpdatedCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for queue deletion
 * @param callback - The callback function to be called when a queue is deleted
 * @returns A function to unregister the callback
 */
export const onQueueDeleted = (callback: (data: { queueId: string; message: string }) => void) => {
    queueDeletedCallbacks.push(callback);
    return () => {
        queueDeletedCallbacks = queueDeletedCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for message previews (inbox updates)
 * @param callback - The callback function to be called when message previews are received
 * @returns A function to unregister the callback
 */
export const onMessagePreviews = (callback: (data: any[]) => void) => {
    messagePreviewsCallbacks.push(callback);
    return () => {
        messagePreviewsCallbacks = messagePreviewsCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for received messages
 * @param callback - The callback function to be called when a message is received
 * @returns A function to unregister the callback
 */
export const onReceiveMessage = (callback: (data: any) => void) => {
    receiveMessageCallbacks.push(callback);
    return () => {
        receiveMessageCallbacks = receiveMessageCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for message sent confirmation
 * @param callback - The callback function to be called when a message is sent
 * @returns A function to unregister the callback
 */
export const onMessageSent = (callback: (data: { success: boolean; message?: any; error?: string }) => void) => {
    messageSentCallbacks.push(callback);
    return () => {
        messageSentCallbacks = messageSentCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for new messages (legacy)
 * @param callback - The callback function to be called when a new message is received
 * @returns A function to unregister the callback
 */
export const onNewMessage = (callback: (data: any) => void) => {
    newMessageCallbacks.push(callback);
    return () => {
        newMessageCallbacks = newMessageCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for message read status updates
 * @param callback - The callback function to be called when message read status changes
 * @returns A function to unregister the callback
 */
export const onMessageRead = (callback: (data: { message_id: string; is_read: boolean }) => void) => {
    messageReadCallbacks.push(callback);
    return () => {
        messageReadCallbacks = messageReadCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for notification updates
 * @param callback - The callback function to be called when notifications are updated
 * @returns A function to unregister the callback
 */
export const onNotificationUpdate = (callback: (data: { notifications: any[]; unreadCount: number }) => void) => {
    notificationUpdateCallbacks.push(callback);
    return () => {
        notificationUpdateCallbacks = notificationUpdateCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for notification deletion confirmation
 * @param callback - The callback function to be called when a notification is deleted
 * @returns A function to unregister the callback
 */
export const onNotificationDeleted = (callback: (data: { success: boolean; notification_id: string }) => void) => {
    notificationDeletedCallbacks.push(callback);
    return () => {
        notificationDeletedCallbacks = notificationDeletedCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for chat room entered confirmation
 * @param callback - The callback function to be called when a chat room is entered
 * @returns A function to unregister the callback
 */
export const onChatRoomEntered = (callback: (data: { success: boolean; sender_id: string }) => void) => {
    chatRoomEnteredCallbacks.push(callback);
    return () => {
        chatRoomEnteredCallbacks = chatRoomEnteredCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for ticket creation confirmation
 * @param callback - The callback function to be called when a ticket is created
 * @returns A function to unregister the callback
 */
export const onTicketCreated = (callback: (data: { success: boolean; ticket_id?: string }) => void) => {
    ticketCreatedCallbacks.push(callback);
    return () => {
        ticketCreatedCallbacks = ticketCreatedCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Register a callback for tickets data received
 * @param callback - The callback function to be called when tickets data is received
 * @returns A function to unregister the callback
 */
export const onTicketsReceived = (callback: (data: any[]) => void) => {
    ticketsReceivedCallbacks.push(callback);
    return () => {
        ticketsReceivedCallbacks = ticketsReceivedCallbacks.filter(cb => cb !== callback);
    };
};

/**
 * Open or close a queue
 * @param queueId - The queue ID
 * @param status - The status to set
 */
export const openOrCloseQueue = (queueId: string, status: "OPEN" | "CLOSED") => {
    if (socket) {
        socket.emit("openOrCloseQueue", { queueId, status });
    }
};

/**
 * Send a message via socket
 * @param senderId - The sender's user ID
 * @param receiverId - The receiver's user ID
 * @param content - The message content
 */
export const sendMessage = (senderId: string, receiverId: string, content: string) => {
    if (socket) {
        socket.emit("sendMessage", { senderId, receiverId, content });
    }
};

/**
 * Send a message with attachment via socket
 * @param senderId - The sender's user ID
 * @param receiverId - The receiver's user ID
 * @param content - The message content
 * @param fileName - The name of the file
 * @param fileType - The type of the file
 * @param fileBuffer - The file buffer
 */
export const sendMessageWithAttachment = (formData: FormData, userId: string, selectedChat: string, content: string, file: File, timestamp: number) => {
    if (socket) {
        socket.emit("sendMessageWithAttachment", { formData, userId, selectedChat, content, file, timestamp });
    }
};

/**
 * Mark a message as read via socket
 * @param messageId - The message ID to mark as read
 * @param userId - The user ID
 * @param otherUserId - The other user's ID
 */
export const markMessageAsRead = (messageId: string, userId: string, otherUserId: string) => {
    if (socket) {
        socket.emit("markMessageAsRead", { message_id: messageId, user_id: userId, otherUserId });
    }
};

/**
 * Hide a chat via socket
 * @param userId - The user ID
 * @param otherUserId - The other user's ID
 */
export const hideChat = (userId: string, otherUserId: string) => {
    if (socket) {
        socket.emit("hideChat", { user_id: userId, other_user_id: otherUserId });
    }
};

/**
 * Get last messages (previews) via socket
 * @param userId - The user ID
 */
export const getLastMessages = (userId: string) => {
    if (socket) {
        socket.emit("getLastMessages", { user_id: userId });
    }
};

/**
 * Join user room for receiving messages
 * @param userId - The user ID
 */
export const joinRoom = (userId: string) => {
    if (socket) {
        socket.emit("joinRoom", { user_id: userId });
    }
};

/**
 * Get the socket instance
 * @returns The socket instance
 */
export const getSocket = () => socket;

/**
 * Update hidden chat via socket
 * @param userId - The user ID
 * @param otherUserId - The other user's ID
 */
export const updateHiddenChat = (userId: string, otherUserId: string) => {
    if (socket) {
        socket.emit("updateHiddenChat", { user_id: userId, other_user_id: otherUserId });
    }
};

/**
 * Create a new ticket
 * @param userId - The user ID
 * @param ticketId - The ticket ID
 */
export const createTicket = (userId: string, ticketId: string) => {
    if (socket) {
        socket.emit("createTicket", { user_id: userId, ticket_id: ticketId });
    }
};

export const getTickets = (userId: string) => {
    if (socket) {
        socket.emit("getTickets", { user_id: userId });
    }
};

/**
 * Get notifications via socket
 * @param userId - The user ID
 */
export const getNotifications = (userId: string) => {
    if (socket) {
        socket.emit("getNotifications", { user_id: userId });
    }
};

/**
 * Delete notification via socket
 * @param notificationId - The notification ID
 * @param userId - The user ID
 */
export const deleteNotification = (notificationId: string, userId: string) => {
    if (socket) {
        socket.emit("deleteNotification", { notification_id: notificationId, user_id: userId });
    }
};

/**
 * Enter chat room and delete notifications for sender via socket
 * @param userId - The user ID (receiver)
 * @param senderId - The sender's user ID
 */
export const enterChatRoom = (userId: string, senderId: string) => {
    if (socket) {
        socket.emit("enterChatRoom", { user_id: userId, sender_id: senderId });
    }
};