import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let statusChangeCallbacks: ((data: { queueId: string; status: "OPEN" | "CLOSED" }) => void)[] = [];

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
 * Open or close a queue
 * @param queueId - The queue ID
 * @param status - The status to set
 */
export const openOrCloseQueue = (queueId: string, status: "OPEN" | "CLOSED") => {
    if (socket) {
        socket.emit("openOrCloseQueue", { queueId, status });
    }
};