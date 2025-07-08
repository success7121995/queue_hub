"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useDateTime } from "@/constant/datetime-provider";
import { useGetNotifications } from "@/hooks/user-hooks";
import { Notification } from "@/types/notification";
import { onNotificationUpdate, getNotifications, deleteNotification, joinRoom, connectSocket, enterChatRoom, markNotificationAsRead } from "@/lib/socket";
import { useAuth } from "@/hooks/auth-hooks";
import { useChat } from "@/contexts/chat-context";

interface NotificationProps {
  className?: string;
  isLoading?: boolean;
}

const NotificationComponent = ({ className = "", isLoading: externalLoading }: NotificationProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { formatRelativeTime } = useDateTime();
    const { data: authData } = useAuth();
    const userId = authData?.user?.user_id;
    const { openChat } = useChat();
    
    // Fetch notifications using the hook
    const { data: notificationData, isLoading: hookLoading } = useGetNotifications();
    const isLoading = externalLoading !== undefined ? externalLoading : hookLoading;
    const [notifications, setNotifications] = useState<Notification[]>(notificationData?.notifications || []);
    const [unreadCount, setUnreadCount] = useState(notificationData?.notifications?.filter(n => !n.is_read).length || 0);

    // Update local state when hook data changes
    useEffect(() => {
        if (notificationData?.notifications) {
            setNotifications(notificationData.notifications);
            setUnreadCount(notificationData.notifications.filter(n => !n.is_read).length);
        }
    }, [notificationData]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Socket event listener for real-time notification updates
    useEffect(() => {
        if (!userId) return;

        // Connect to socket and join user room
        connectSocket();
        joinRoom(userId);

        const handleNotificationUpdate = (data: { notifications: Notification[]; unreadCount: number }) => {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        };

        // Register socket event listener
        const unregister = onNotificationUpdate(handleNotificationUpdate);

        // Request initial notifications
        getNotifications(userId);

        // Cleanup
        return () => {
            unregister();
        };
    }, [userId]);

    // Handle notification click
    const handleNotificationClick = (notification: Notification) => {
        if (!notification.redirect_url || !userId) return;

        // Mark notification as read immediately for non-message notifications
        if (!notification.redirect_url.startsWith('/messages/') && notification.notification_id) {
            markNotificationAsRead(notification.notification_id, userId);
        }

        // Check if this is a message notification (redirects to /messages/:user_id)
        if (notification.redirect_url.startsWith('/messages/')) {
            // Extract user_id from redirect_url (e.g., /messages/:user_id)
            const urlParts = notification.redirect_url.split('/');
            const targetUserId = urlParts[urlParts.length - 1];

            if (targetUserId && notification.notification_id) {
                // Open the chat with the target user
                openChat(targetUserId);
                
                // Join the chat room for the target user
                joinRoom(targetUserId);
                
                // Enter chat room and delete notifications for this sender
                enterChatRoom(userId, targetUserId);
                
                // Close the notification dropdown
                setIsOpen(false);
            }
        } else {
            // Handle other types of notifications (like admin notifications)
            // Navigate to the redirect URL
            window.location.href = notification.redirect_url;
            
            // Close the notification dropdown
            setIsOpen(false);
        }
    };

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button 
                className="flex items-center relative" 
                onClick={() => setIsOpen(!isOpen)}
                title={notifications.length === 0 ? "No notifications" : ""}
            >
                <Bell size={22} className="text-text-light" />
                {unreadCount > 0 && (
                    <span className="absolute -top-[9px] -right-[10px] bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
            
            {isOpen && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 z-10 min-w-[300px] max-w-[350px] lg:min-w-[300px] lg:max-w-[350px] sm:min-w-[270px] sm:max-w-[320px]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-gray-500">{unreadCount} unread</span>
                        )}
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-light"></div>
                            </div>
                        ) : notifications.length > 0 ? (
                            <ul className="space-y-2">
                                {notifications.map((notification) => (
                                    <li 
                                        key={notification.notification_id} 
                                        className={`cursor-pointer p-3 hover:bg-gray-50 rounded-md transition-colors ${
                                            !notification.is_read ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex flex-col">
                                            <div className="flex items-start justify-between">
                                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {notification.title}
                                                </div>
                                                {!notification.is_read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                {notification.content}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2">
                                                {formatRelativeTime(new Date(notification.created_at))}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No notifications
                            </div>
                        )}
                    </div>
                    
                    {notifications.length > 0 && (
                        <div className="border-t border-gray-200 mt-3 pt-3">
                            <button className="w-full text-center text-sm text-primary-light hover:text-primary-dark transition-colors">
                                View all notifications
                            </button>   
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationComponent;