"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, ChevronDown } from "lucide-react";
import { useDateTime } from "@/constant/datetime-provider";
import { MessagePreview } from "@/types/message";
import { useGetMessagePreview, useMarkMessageAsRead } from "@/hooks/user-hooks";
import { useAuth } from "@/hooks/auth-hooks";
import { connectSocket, disconnectSocket, onNewMessage, onMessageRead, socketMarkMessageAsRead } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import LoadingIndicator from "@/components/common/loading-indicator";

interface MsgDropdownProps {
  className?: string;
}

const MsgDropdown = ({ className = "" }: MsgDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { formatRelativeTime } = useDateTime();
    const queryClient = useQueryClient();
    const { data: userData } = useAuth();
    
    // Get messages using the existing hook
    const { data: messageData, isLoading, refetch } = useGetMessagePreview(5);
    const markMessageAsReadMutation = useMarkMessageAsRead();
    
    const messages = messageData?.messagePreviews || [];
    const unreadCount = messages.filter(msg => !msg.is_read).length;

    // Connect to socket on component mount
    useEffect(() => {
        connectSocket();
        
        // Listen for new messages
        const unsubscribeNewMessage = onNewMessage((data) => {
            // Refetch messages when a new message is received
            refetch();
        });
        
        // Listen for message read status updates
        const unsubscribeMessageRead = onMessageRead((data) => {
            // Update the message in the cache
            queryClient.setQueryData(['user', 'messages'], (oldData: any) => {
                if (!oldData?.messagePreviews) return oldData;
                
                return {
                    ...oldData,
                    messagePreviews: oldData.messagePreviews.map((msg: MessagePreview) => 
                        msg.message_id === data.message_id 
                            ? { ...msg, is_read: data.is_read }
                            : msg
                    )
                };
            });
        });

        return () => {
            unsubscribeNewMessage();
            unsubscribeMessageRead();
        };
    }, [refetch, queryClient]);

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

    // Handle dropdown open/close
    const handleDropdownToggle = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        
        // Mark messages as read when dropdown is opened
        if (newIsOpen && unreadCount > 0) {
            messages.forEach((message) => {
                if (!message.is_read) {
                    markMessageAsReadMutation.mutate(message.message_id);
                    socketMarkMessageAsRead(message.message_id);
                }
            });
        }
    };

    // Handle message click
    const handleMessageClick = (message: MessagePreview) => {
        if (!message.is_read) {
            markMessageAsReadMutation.mutate(message.message_id);
            socketMarkMessageAsRead(message.message_id);
        }
    };

    return (
        <div ref={ref} className={`relative ${className} font-regular-eng`}>
            <button 
                className="flex items-center relative" 
                onClick={handleDropdownToggle}
                title={messages.length === 0 ? "No messages" : ""}
            >
                <Mail size={22} className="text-text-light" />
                {unreadCount > 0 && (
                    <span className="absolute -top-[9px] -right-[10px] bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
            
            {isOpen && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 z-10 min-w-[280px] max-w-[320px] lg:min-w-[280px] lg:max-w-[320px] sm:min-w-[250px] sm:max-w-[280px]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Messages</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-gray-500">{unreadCount} unread</span>
                        )}
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <LoadingIndicator size="sm" />
                            </div>
                        ) : messages.length > 0 ? (
                            <ul className="space-y-2">
                                {messages.map((message) => (
                                    <li 
                                        key={message.message_id} 
                                        className="cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors"
                                        onClick={() => handleMessageClick(message)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                {message.user.Avatar?.image_url ? (
                                                    <Image 
                                                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${message.user.Avatar.image_url}`}
                                                        alt={message.user.username}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                                                        {message.user.fname?.charAt(0).toUpperCase()}{message.user.lname?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Message content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {message.user.username}
                                                    </p>
                                                    <span className="text-xs text-gray-500">
                                                        {formatRelativeTime(new Date(message.created_at))}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                                    {message.content}
                                                </p>
                                                {!message.is_read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No messages
                            </div>
                        )}
                    </div>
                    
                    {messages.length > 0 && (
                        <div className="border-t border-gray-200 mt-3 pt-3">
                            <button className="w-full text-center text-sm text-primary-light hover:text-primary-dark transition-colors">
                                View all messages
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MsgDropdown;