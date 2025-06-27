import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let statusChangeCallbacks: ((data: { queueId: string; status: "OPEN" | "CLOSED" }) => void)[] = [];
let queueCreatedCallbacks: ((data: { message: string }) => void)[] = [];
let queueUpdatedCallbacks: ((data: { queueId: string; message: string }) => void)[] = [];
let queueDeletedCallbacks: ((data: { queueId: string; message: string }) => void)[] = [];
let newMessageCallbacks: ((data: any) => void)[] = [];
let messageReadCallbacks: ((data: { message_id: string; is_read: boolean }) => void)[] = [];

/**
 * Connect to the socket
 */
export const connectSocket = () => {
    if (socket) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5500';
    
    socket = io(SOCKET_URL, {
        withCredentials: true,
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    /**
     * Handle socket connection
     */
    socket.on("connect", () => {
        console.log("Socket connected successfully");
    });

    /**
     * Handle socket connection errors
     * @param error - The error object
     */
    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
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
     * Handle new messages
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
    });
};

/**
 * Disconnect from the socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        statusChangeCallbacks = [];
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
 * Register a callback for new messages
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
 * Mark a message as read via socket
 * @param messageId - The message ID to mark as read
 */
export const socketMarkMessageAsRead = (messageId: string) => {
    if (socket) {
        socket.emit("markMessageAsRead", { message_id: messageId });
    }
};