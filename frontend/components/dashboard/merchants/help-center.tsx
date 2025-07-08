"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, BookOpen, Send, FileText, Plus, Loader2, ThumbsUp, ThumbsDown, Paperclip, RefreshCcw, MessageCircle, X, Download, Eye } from 'lucide-react';
import DateRangeSelect from '@/components/common/date-select';
import Table from '@/components/common/table';
import { useForm } from "react-hook-form";
import LoadingIndicator from '@/components/common/loading-indicator';
import { cn } from '@/lib/utils';
import Attachment from '@/components/common/attachment';
import { createTicket, getTickets, onTicketCreated, onTicketsReceived, connectSocket } from '@/lib/socket';
import { useCreateTicket, useGetTickets, useGetTicket } from '@/hooks/user-hooks';
import { useAuth } from '@/hooks/auth-hooks';
import { CreateTicketFormFields } from '@/types/form';

// Fallback Button
const Button = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
    className={cn('inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold bg-primary-light text-white hover:bg-primary-hover transition-colors disabled:opacity-50', className)}
        {...props}
    >
        {children}
    </button>
);

// Types
const TICKET_CATEGORIES = [
    { value: 'Account', label: 'Account' },
    { value: 'Billing', label: 'Billing' },
    { value: 'Technical Help', label: 'Technical Help' },
    { value: 'Other', label: 'Other' },
];

const STATUS_COLORS: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    RESOLVED: 'bg-gray-100 text-gray-700',
};

const PRIORITY_COLORS: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-700',
    Medium: 'bg-blue-100 text-blue-700',
    High: 'bg-yellow-100 text-yellow-700',
    Urgent: 'bg-red-100 text-red-700',
};

type TabType = 'kb' | 'ticket' | 'mytickets';

type TicketForm = {
    category: string;
    priority: string;
    subject: string;
    message: string;
    files: File[];
};

// FAQ mock data
const FAQS = [
  {
    question: 'How do I reset my password?',
    answer: 'To reset your password, go to the login page and click on "Forgot password?". Follow the instructions sent to your email.'
  },
  {
    question: 'How can I update my billing information?',
    answer: 'Navigate to the Billing section in your dashboard and click "Edit Billing Info". Save your changes when done.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can submit a ticket using the "Submit a Ticket" tab or email us at support@queuehub.com.'
  },
  {
    question: 'Where can I view my past tickets?',
    answer: 'Go to the "My Tickets" tab to see all your previous enquiries and their status.'
  },
];

// Add AccordionItem component
const AccordionItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border border-border rounded-lg bg-white">
        <button
            className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-primary-light focus:outline-none"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
        >
        <span>{question}</span>
        <span className={cn('transition-transform', open ? 'rotate-180' : '')}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
        </span>
        </button>

        {open && (
            <div className="px-4 pb-4 text-gray-700 animate-fade-in">
                {answer}
            </div>
        )}
    </div>
  );
}

// Ticket Detail Modal Component
const TicketDetailModal = ({ 
    isOpen, 
    onClose, 
    ticketId 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    ticketId: string | null; 
}) => {
    const { data: ticketData, isLoading: ticketLoading } = useGetTicket(ticketId || '', {
        enabled: isOpen && !!ticketId,
    });

    const ticket = ticketData?.result?.ticket;

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
                <div className="p-6">
                    {ticketLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin w-8 h-8 text-primary-light" />
                            <span className="ml-2 text-gray-600">Loading ticket details...</span>
                        </div>
                    ) : ticket ? (
                        <div className="space-y-6">
                            {/* Subject */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', STATUS_COLORS[ticket.status] || 'bg-gray-100 text-gray-700')}>
                                        {ticket.status}
                                    </span>
                                    <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', PRIORITY_COLORS[ticket.priority] || 'bg-gray-100 text-gray-700')}>
                                        {ticket.priority}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                        {ticket.category}
                                    </span>
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

const HelpCenter = () => {
    const [tab, setTab] = useState<TabType>('kb');
    const [ticketFilters, setTicketFilters] = useState<{ status: string; dateRange: [null, null] }>({ status: '', dateRange: [null, null] });
    const formMethods = useForm<TicketForm>({ defaultValues: { category: '', priority: 'Low', subject: '', message: '', files: [] } });
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    
    // Modal state
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get current user
    const { data: authData } = useAuth();
    const user = authData?.user;

    // Get tickets from API
    const { data: ticketsData, isLoading: ticketsLoading, refetch: refetchTickets } = useGetTickets();

    // Create ticket mutation
    const createTicketMutation = useCreateTicket();

    // Socket event handlers for ticket creation notifications
    useEffect(() => {
        if (!user?.user_id) return;

        // Connect to socket
        connectSocket();

        // Listen for ticket creation confirmation
        const unsubscribeTicketCreated = onTicketCreated((data: { success: boolean; ticket_id?: string }) => {
            if (data.success) {
                console.log('Ticket created successfully via socket');
                refetchTickets();
            }
        });

        return () => {
            unsubscribeTicketCreated();
        };
    }, [user?.user_id, refetchTickets]);

    /**
     * Submit Ticket
     */
    const submitTicket = (data: TicketForm) => {
        const ticketData: CreateTicketFormFields = {
            subject: data.subject,
            category: data.category,
            message: data.message,
            files: attachments
        };
        
        createTicketMutation.mutate(ticketData, {
            onSuccess: (response) => {
                // Reset form
                formMethods.reset();
                setAttachments([]);

                // Emit socket event to notify admins about the new ticket
                if (user?.user_id && response?.result?.ticket_id) {
                    createTicket(user.user_id, response.result.ticket_id);
                }

                // Refetch tickets
                refetchTickets();
                setTab('mytickets');
            },
            onError: (error) => {
                console.error('Failed to create ticket:', error);
            }
        });
    }

    /**
     * My Tickets: Filtered tickets
     */
    const filteredTickets = useMemo(() => {
        let tickets = ticketsData?.result?.tickets || [];
        if (ticketFilters.status) tickets = tickets.filter((t: any) => t.status === ticketFilters.status);
        return tickets;
    }, [ticketsData, ticketFilters]);

    /**
     * File Upload
     */
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setAttachments(prev => [...prev, ...Array.from(files) as File[]]);
        }
    };

    /**
     * Handle ticket click
     */
    const handleTicketClick = (ticketId: string) => {
        setSelectedTicketId(ticketId);
        setIsModalOpen(true);
    };

    /**
     * Close modal
     */
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTicketId(null);
    };

    // --- Table columns for My Tickets ---
    const ticketColumns = [
        {
            header: 'Subject',
            accessor: (row: any) => (
                <span 
                    className="font-semibold text-primary-light underline cursor-pointer hover:text-primary-hover transition-colors" 
                    onClick={() => handleTicketClick(row.ticket_id)}
                >
                    {row.subject}
                </span>
            ),
            className: 'font-semibold text-primary-light',
            priority: 3,
        },
        {
            header: 'Category',
            accessor: (row: any) => row.category,
            className: 'text-gray-700',
            priority: 2,
        },
        {
            header: 'Status',
            accessor: (row: any) => (
                <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-700')}>{row.status}</span>
            ),
            priority: 2,
        },
        {
            header: 'Created Date',
            accessor: (row: any) => (
                <span className="text-gray-500">{new Date(row.created_at).toLocaleString()}</span>
            ),
            priority: 1,
        },
    ];
    

    return (
        <div className="max-w-5xl mx-auto w-full px-2 sm:px-6 py-8 font-regular-eng">
            <h1 className="text-2xl font-bold mb-6 text-primary-light">Help Center</h1>

            {/* Tabs */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <button onClick={() => setTab('kb')} className={cn('px-4 py-2 rounded-lg font-semibold text-sm', tab === 'kb' ? 'bg-primary-light text-white' : 'bg-white text-primary-light border border-primary-light')}>Knowledge Base</button>
                <button onClick={() => setTab('ticket')} className={cn('px-4 py-2 rounded-lg font-semibold text-sm', tab === 'ticket' ? 'bg-primary-light text-white' : 'bg-white text-primary-light border border-primary-light')}>Submit a Ticket</button>
                <button onClick={() => setTab('mytickets')} className={cn('px-4 py-2 rounded-lg font-semibold text-sm', tab === 'mytickets' ? 'bg-primary-light text-white' : 'bg-white text-primary-light border border-primary-light')}>My Tickets</button>
            </div>

            {/* Knowledge Base Section */}
            {tab === 'kb' && (
            <div>
                <h2 className="text-lg font-semibold mb-4 text-primary-light">Frequently Asked Questions</h2>
                <div className="space-y-3">
                {FAQS.map((faq, idx) => (
                    <AccordionItem key={idx} question={faq.question} answer={faq.answer} />
                ))}
                </div>
            </div>
            )}

            {/* Submit Ticket Section */}
            {tab === 'ticket' && (
            <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4 text-primary-light">Submit a Ticket</h2>
                <form onSubmit={formMethods.handleSubmit(submitTicket)}>

                {/* Category */}
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select className="focus:outline-none focus:ring-primary focus:border-primary hover:border-primary-light hover:border-2 w-full border border-border rounded px-3 py-2" {...formMethods.register('category', { required: true })}>
                    <option value="">Select category</option>
                    {TICKET_CATEGORIES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>

                {/* Subject */}
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <input className="focus:outline-none focus:ring-primary focus:border-primary hover:border-2 w-full border border-border rounded px-3 py-2" {...formMethods.register('subject', { required: true, maxLength: 100 })} />
                </div>

                {/* Message */}
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea className="focus:outline-none focus:ring-primary focus:border-primary hover:border-primary-light hover:border-2 w-full border border-border rounded px-3 py-2 min-h-[80px]" {...formMethods.register('message', { required: true, maxLength: 1000 })} />
                </div>

                {/* Attachments */}
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Attachments (optional)</label>
                    <label className="flex items-center gap-2 cursor-pointer text-primary-light hover:underline">
                    <Paperclip className="w-4 h-4" />
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*, application/pdf"
                        multiple
                        ref={fileInputRef}
                        onClick={(e: React.MouseEvent<HTMLInputElement>) => (e.target as HTMLInputElement).value = ""}
                        onChange={handleFileUpload}
                    />
                    Attach files
                    </label>
                    <Attachment
                        files={attachments}
                        onRemove={file => setAttachments(prev => prev.filter(f => !(f.name === file.name && f.size === file.size)))}
                    />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={createTicketMutation.isPending}>{createTicketMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <><Send className="w-4 h-4 mr-1" />Submit Ticket</>}</Button>
                </form>
                {createTicketMutation.isSuccess && <div className="mt-3 text-green-600">Ticket submitted successfully!</div>}
                {createTicketMutation.isError && <div className="mt-3 text-red-600">{createTicketMutation.error?.message || 'Error submitting ticket.'}</div>}
            </div>
            )}

            {/* My Tickets Section */}
            {tab === 'mytickets' && (
            <div>
                <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
                <select className="border border-primary-light rounded text-xs text-primary-light p-1 pl-[10px]" value={ticketFilters.status} onChange={e => setTicketFilters(f => ({ ...f, status: e.target.value }))}>
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
                <DateRangeSelect selectedYear={''} selectedMonth={''} onYearChange={() => {}} onMonthChange={() => {}} />
                </div>

                {/* Loading indicator for tickets */}
                {ticketsLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin w-8 h-8 text-primary-light" />
                        <span className="ml-2 text-gray-600">Loading tickets...</span>
                    </div>
                )}

                <Table
                    data={filteredTickets}
                    columns={ticketColumns}
                    getRowClassName={() => 'cursor-pointer'}
                    renderActions={undefined}
                    rowsPerPage={10}
                    loading={false} // We handle loading separately above
                    message="No tickets found."
                    actions={undefined}
                />
            </div>
            )}

            {/* Ticket Detail Modal */}
            <TicketDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                ticketId={selectedTicketId}
            />

            {/* Future: Chatbot/Live Chat */}
            <div className="fixed bottom-6 right-6 z-40">
                <button className="bg-primary-light text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-primary-hover transition-colors focus:outline-none opacity-80 cursor-not-allowed" title="Live chat coming soon" disabled>
                    <MessageCircle className="w-7 h-7" />
                </button>
            </div>
        </div>
    );
}

export default HelpCenter;