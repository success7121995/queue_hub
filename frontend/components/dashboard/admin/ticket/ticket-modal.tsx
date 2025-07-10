"use client";

import { useGetTicket, useUpdateTicket } from "@/hooks/user-hooks";
import { useAuth } from "@/hooks/auth-hooks";
import { useChat } from "@/contexts/chat-context";
import { useState, useEffect } from "react";
import { X, FileText, Download, Eye, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingIndicator from "@/components/common/loading-indicator";
import { connectSocket, joinRoom, sendMessage } from "@/lib/socket";

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId: string | null;
}

// Custom Chat Bubbles SVG Icon (matches attached image)
const ChatBubblesIcon = ({ size = 28, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 714.99 552.76" width="28" height="28" aria-hidden="true">
    <g>
        <path d="M712.45,351.28c-7.6-105.5-109.6-191.86-202.45-199.06-11.38-.88-20.89-.44-27.37.11,4.09,24.19,15.56,109.86-36.71,174.93-22.15,27.58-49.65,43.86-65.95,53.51-46.53,27.55-90.71,36.88-118.29,40.47,11.11,16.03,89.3,125.09,217.98,129.1,42.78,1.34,78.47-9.33,103.46-19.9l129.32,19.9-20.69-99.53c21.51-44.15,22.07-80.35,20.69-99.53ZM479.73,363.17c-6.42,0-11.62-5.32-11.62-11.88s5.2-11.88,11.62-11.88,11.62,5.32,11.62,11.88-5.21,11.88-11.62,11.88ZM621.15,363.17c-6.42,0-11.62-5.32-11.62-11.88s5.2-11.88,11.62-11.88,11.61,5.32,11.61,11.88-5.2,11.88-11.61,11.88Z" fill="#fff" strokeWidth="4" />
        <path d="M338.31,363.17c-6.42,0-11.62-5.32-11.62-11.88s5.2-11.88,11.62-11.88,11.62,5.32,11.62,11.88-5.2,11.88-11.62,11.88Z" fill="#fff" strokeWidth="4" />
        <path d="M235.33,2C106.78,2,2.54,91.13,2.54,201.06c-1.15,34.27,5.93,68.33,20.69,99.53L2.54,400.12l129.32-19.91c32.65,13.56,67.9,20.35,103.46,19.91,128.55,0,232.78-89.13,232.78-199.06S363.88,2,235.33,2ZM93.85,212.95c-6.42,0-11.62-5.32-11.62-11.88s5.2-11.88,11.62-11.88,11.62,5.32,11.62,11.88-5.2,11.88-11.62,11.88ZM235.27,212.95c-6.42,0-11.62-5.32-11.62-11.88s5.2-11.88,11.62-11.88,11.62,5.32,11.62,11.88-5.2,11.88-11.62,11.88ZM376.69,212.95c-6.42,0-11.62-5.32-11.62-11.88s5.2-11.88,11.62-11.88,11.62,5.32,11.62,11.88-5.2,11.88-11.62,11.88Z" fill="#fff" strokeWidth="4" />
        <path d="M472.13,152.33s-.03-.07-.04-.11" fill="none" strokeWidth="4" />
    </g>
</svg>
);

const TicketModal = ({ isOpen, onClose, ticketId }: TicketModalProps) => {
    const { data: ticketData, isLoading: ticketLoading } = useGetTicket(ticketId || '', {
        enabled: isOpen && !!ticketId,
    });

    const { data: authData } = useAuth();
    const { openChat } = useChat();
    const updateTicketMutation = useUpdateTicket({
        onSuccess: () => {
            // Invalidate the ticket query to refresh the data
            // This will update the UI immediately after assignment
        }
    });
    
    const [isAssigning, setIsAssigning] = useState(false);
    const [isTakingOver, setIsTakingOver] = useState(false);

    const ticket = ticketData?.result?.ticket;
    const currentAdminId = authData?.user?.user_id;
    const isAssignedToMe = ticket?.assigned_to === currentAdminId;
    const isAssignedToOther = ticket?.assigned_to && !isAssignedToMe;

    // Helper to get chat target user info from ticket
    const chatTarget = ticket?.User
        ? {
            user_id: ticket.User.user_id,
            username: ticket.User.username || `${ticket.User.fname} ${ticket.User.lname}`.trim() || 'Unknown User',
            avatar_url: ticket.User.Avatar?.image_url || undefined
        }
        : null;

    // Tooltip state for non-assigned admins
    const [showTooltip, setShowTooltip] = useState(false);

    // Handle escape key and click outside
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Handle assign and chat functionality
    const handleAssignAndChat = async () => {
        if (!ticketId || !currentAdminId || !chatTarget) return;
        
        setIsAssigning(true);
        try {
            // First, assign the ticket to the current admin
            await updateTicketMutation.mutateAsync({
                ticket_id: ticketId,
                updateData: { assigned_to: currentAdminId }
            });

            // Connect to socket and join room with the current admin's user_id (not the target user)
            connectSocket();
            joinRoom(currentAdminId);

            // Ensure a conversation exists by sending a dummy message if needed
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
                const res = await fetch(`${backendUrl}/api/message/conversation/${chatTarget.user_id}?before=&limit=1`, { credentials: 'include' });
                const data = await res.json();
                if (!data.success || !data.messages || data.messages.length === 0) {
                    sendMessage(currentAdminId, chatTarget.user_id, " "); // Send a blank message to create the thread
                }
            } catch (err) {
                // If the response is not JSON or 404, just proceed
                sendMessage(currentAdminId, chatTarget.user_id, " ");
            }

            // Open chat with the ticket user
            openChat(chatTarget.user_id);
            
            // Close the modal
            onClose();
        } catch (error) {
            console.error('Failed to assign ticket and open chat:', error);
            // Could show a toast notification here
        } finally {
            setIsAssigning(false);
        }
    };

    // Handle take over functionality
    const handleTakeOver = async () => {
        if (!ticketId || !currentAdminId || !chatTarget) return;
        
        setIsTakingOver(true);
        try {
            // Assign the ticket to the current admin
            await updateTicketMutation.mutateAsync({
                ticket_id: ticketId,
                updateData: { assigned_to: currentAdminId }
            });

            // Connect to socket and join room with the current admin's user_id (not the target user)
            connectSocket();
            joinRoom(currentAdminId);

            // Ensure a conversation exists by sending a dummy message if needed
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
                const res = await fetch(`${backendUrl}/api/message/conversation/${chatTarget.user_id}?before=&limit=1`, { credentials: 'include' });
                const data = await res.json();
                if (!data.success || !data.messages || data.messages.length === 0) {
                    sendMessage(currentAdminId, chatTarget.user_id, " ");
                }
            } catch (err) {
                sendMessage(currentAdminId, chatTarget.user_id, " ");
            }

            // Open chat with the ticket user
            openChat(chatTarget.user_id);
            
            // Close the modal
            onClose();
        } catch (error) {
            console.error('Failed to take over ticket:', error);
            // Could show a toast notification here
        } finally {
            setIsTakingOver(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Ticket Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>
                {/* Content */}
                <div className="p-6 relative">
                    {ticketLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingIndicator text="Loading ticket details..." />
                        </div>
                    ) : ticket ? (
                        <div className="space-y-6">
                            {/* Subject and Status */}
                            <div className={`flex ${ticket.status == 'RESOLVED' ? 'justify-start' : 'justify-between'} items-center`}>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', {
                                            'bg-green-100 text-green-700': ticket.status === 'OPEN',
                                            'bg-yellow-100 text-yellow-700': ticket.status === 'IN_PROGRESS',
                                            'bg-gray-100 text-gray-700': ticket.status === 'RESOLVED',
                                        })}>
                                            {ticket.status}
                                        </span>
                                        <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', {
                                            'bg-gray-100 text-gray-700': ticket.priority === 'LOW',
                                            'bg-blue-100 text-blue-700': ticket.priority === 'MEDIUM',
                                            'bg-yellow-100 text-yellow-700': ticket.priority === 'HIGH',
                                            'bg-red-100 text-red-700': ticket.priority === 'URGENT',
                                        })}>
                                            {ticket.priority}
                                        </span>
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                            {ticket.category}
                                        </span>
                                    </div>
                                </div>
                                {/* Custom Chat/Assignment Toggler UI */}
                                {ticket.status !== 'RESOLVED' && (
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <div className="flex items-center gap-3">
                                            {/* If unassigned: show chat toggler */}
                                            {!ticket.assigned_to ? (
                                                <>
                                                    <button
                                                        className="flex items-center justify-center p-2 bg-primary-light text-white rounded-lg shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-light/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={handleAssignAndChat}
                                                        disabled={isAssigning}
                                                        aria-label="Start chat with user (You will be auto-assigned)"
                                                    >
                                                        {isAssigning ? (
                                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 714.99 552.76" width="28" height="28" aria-hidden="true">
                                                                <g>
                                                                    <path d="M712.45,351.28c-7.6-105.5-109.6-191.86-202.45-199.06-11.38-.88-20.89-.44-27.37.11,4.09,24.19,15.56,109.86-36.71,174.93-22.15,27.58-49.65,43.86-65.95,53.51-46.53,27.55-90.71,36.88-118.29,40.47,11.11,16.03,89.3,125.09,217.98,129.1,42.78,1.34,78.47-9.33,103.46-19.9l129.32,19.9-20.69-99.53c21.51-44.15,22.07-80.35,20.69-99.53ZM479.73,363.17c-6.42,0-11.62-5.32-11.62-11.88s5.2-11.88,11.62-11.88,11.62,5.32,11.62,11.88-5.21,11.88-11.62,11.88ZM621.15,363.17c-6.42,0-11.62-5.32-11.62-11.88s5.2-11.88,11.62-11.88,11.61,5.32,11.61,11.88-5.2,11.88-11.61,11.88Z" fill="#fff" strokeWidth="4" />
                                                                    <path d="M338.31,363.17c-6.42,0-11.62-5.32-11.62-11.88s5.2-11.88,11.62-11.88,11.62,5.32,11.62,11.88-5.2,11.88-11.62,11.88Z" fill="#fff" strokeWidth="4" />
                                                                    <path d="M235.33,2C106.78,2,2.54,91.13,2.54,201.06c-1.15,34.27,5.93,68.33,20.69,99.53L2.54,400.12l129.32-19.91c32.65,13.56,67.9,20.35,103.46,19.91,128.55,0,232.78-89.13,232.78-199.06S363.88,2,235.33,2ZM93.85,212.95c-6.42,0-11.62-5.32-11.62-11.88s5.2-11.88,11.62-11.88,11.62,5.32,11.62,11.88-5.2,11.88-11.62,11.88ZM235.27,212.95c-6.42,0-11.62-5.32-11.62-11.88s5.2-11.88,11.62-11.88,11.62,5.32,11.62,11.88-5.2,11.88-11.62,11.88ZM376.69,212.95c-6.42,0-11.62-5.32-11.62-11.88s5.2-11.88,11.62-11.88,11.62,5.32,11.62,11.88-5.2,11.88-11.62,11.88Z" fill="#fff" strokeWidth="4" />
                                                                    <path d="M472.13,152.33s-.03-.07-.04-.11" fill="none" strokeWidth="4" />
                                                                </g>
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                                        {isAssigning ? "Assigning and opening chat..." : "Start chat with user (You will be auto-assigned)"}
                                                    </span>
                                                </>
                                            ) : isAssignedToMe ? (
                                                <>
                                                    {/* If assigned to me: show disabled chat toggler */}
                                                    <button
                                                        className="flex items-center justify-center p-2 bg-primary-light text-white rounded-lg shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-light/50 transition"
                                                        onClick={handleAssignAndChat}
                                                        aria-label="Open chat with user"
                                                    >
                                                        <ChatBubblesIcon size={28} color="#a3a3a3" />
                                                    </button>
                                                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Open chat with user</span>
                                                </>
                                            ) : (
                                                <>
                                                    {/* If assigned to other: show disabled chat toggler and take over button */}
                                                    <div className="relative">
                                                        <button
                                                            className="flex items-center justify-center p-2 bg-gray-200 text-gray-400 rounded-lg shadow-sm cursor-not-allowed opacity-60"
                                                            disabled
                                                            aria-label="Chat disabled (already assigned to another admin)"
                                                            onMouseEnter={() => setShowTooltip(true)}
                                                            onMouseLeave={() => setShowTooltip(false)}
                                                        >
                                                            <ChatBubblesIcon size={28} color="#a3a3a3" />
                                                        </button>
                                                        {showTooltip && (
                                                            <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50 whitespace-nowrap">
                                                                Only the assigned admin can chat on this ticket.
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium text-gray-400 whitespace-nowrap">Assigned to another admin</span>
                                                    </div>
                                                    <button
                                                        className="flex items-center gap-2 px-3 py-2 bg-primary-light text-white rounded-lg shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-light/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={handleTakeOver}
                                                        disabled={isTakingOver}
                                                        aria-label="Take over this ticket (Reassign to me)"
                                                    >
                                                        {isTakingOver ? (
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.5"/><path d="M7 10h6M10 7l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                        )}
                                                        <span className="text-sm font-medium">
                                                            {isTakingOver ? "Taking over..." : "Take over this ticket"}
                                                        </span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Created By */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Created By</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="font-medium">{ticket.User?.fname} {ticket.User?.lname}</div>
                                    <div className="text-sm text-gray-500">{ticket.User?.email}</div>
                                    <div className="text-xs text-gray-400">{ticket.User?.role}</div>
                                </div>
                            </div>

                            {/* Content */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Message</h4>
                                <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                                    {ticket.content || ticket.message}
                                </div>
                            </div>

                            {/* Attachments */}
                            {ticket.Attachment && ticket.Attachment.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                                    <div className="space-y-2">
                                        {ticket.Attachment.map((attachment: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center">
                                                    <FileText className="w-4 h-4 text-gray-500 mr-2" />
                                                    <span className="text-sm text-gray-700">{attachment.filename || `Attachment ${index + 1}`}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL}${attachment.file_url}`, '_blank')}
                                                        className="flex items-center gap-1 text-primary-light hover:text-primary-hover text-sm"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}${attachment.file_url}`;
                                                            link.download = attachment.filename || `attachment-${index + 1}`;
                                                            link.click();
                                                        }}
                                                        className="flex items-center gap-1 text-primary-light hover:text-primary-hover text-sm"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium">Created:</span> {new Date(ticket.created_at).toLocaleString()}
                                    </div>
                                    {ticket.updated_at && (
                                        <div>
                                            <span className="font-medium">Last Updated:</span> {new Date(ticket.updated_at).toLocaleString()}
                                        </div>
                                    )}
                                    {ticket.resolved_at && (
                                        <div>
                                            <span className="font-medium">Resolved:</span> {new Date(ticket.resolved_at).toLocaleString()}
                                        </div>
                                    )}
                                    {ticket.closed_at && (
                                        <div>
                                            <span className="font-medium">Closed:</span> {new Date(ticket.closed_at).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-600">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>Ticket not found or could not be loaded.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketModal;