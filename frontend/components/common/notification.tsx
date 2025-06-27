"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { useDateTime } from "@/constant/datetime-provider";

// Mock data structure following Prisma schema
interface Notification {
  notification_id: string;
  user_id: string;
  title: string;
  content: string;
  is_read: boolean;
  redirect_url?: string;
  created_at: Date;
}

interface NotificationProps {
  notifications?: Notification[];
  isLoading?: boolean;
  className?: string;
}

const Notification = ({ notifications = [], isLoading = false, className = "" }: NotificationProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { formatRelativeTime } = useDateTime();
    // Mock data for development
    const mockNotifications: Notification[] = [
        {
            notification_id: 'notif123',
            user_id: 'user2',
            title: 'New Booking Alert',
            content: 'Your booking for table #5 has been confirmed.',
            is_read: false,
            redirect_url: '/merchant/bookings/456',
            created_at: new Date()
        },
        {
            notification_id: 'notif124',
            user_id: 'user2',
            title: 'Queue Update',
            content: 'Your position in the queue has changed.',
            is_read: false,
            redirect_url: '/merchant/queues/789',
            created_at: new Date(Date.now() - 1800000)
        }
    ];

    const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;
    const unreadCount = displayNotifications.filter(n => !n.is_read).length;

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

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button 
                className="flex items-center relative" 
                onClick={() => setIsOpen(!isOpen)}
                title={displayNotifications.length === 0 ? "No notifications" : ""}
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
                        ) : displayNotifications.length > 0 ? (
                            <ul className="space-y-2">
                                {displayNotifications.map((notification) => (
                                    <li 
                                        key={notification.notification_id} 
                                        className={`cursor-pointer p-3 hover:bg-gray-50 rounded-md transition-colors ${
                                            !notification.is_read ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                                        }`}
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
                                                {formatRelativeTime(notification.created_at)}
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
                    
                    {displayNotifications.length > 0 && (
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

export default Notification;