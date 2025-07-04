"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, BookOpen, Send, FileText, Plus, Loader2, ThumbsUp, ThumbsDown, Paperclip, RefreshCcw, MessageCircle, X } from 'lucide-react';
import DateRangeSelect from '@/components/common/date-select';
import Table from '@/components/common/table';
import { useForm } from "react-hook-form";
import LoadingIndicator from '@/components/common/loading-indicator';
import { cn } from '@/lib/utils';
import Attachment from '@/components/common/attachment';
import { createTicket, getTickets, onTicketCreated, onTicketsReceived } from '@/lib/socket';
import { useCreateTicket, useGetTickets } from '@/hooks/user-hooks';
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
    Open: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Resolved: 'bg-gray-100 text-gray-700',
    Closed: 'bg-red-100 text-red-700',
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

const HelpCenter = () => {
    const [tab, setTab] = useState<TabType>('kb');
    const [ticketFilters, setTicketFilters] = useState<{ status: string; dateRange: [null, null] }>({ status: '', dateRange: [null, null] });
    const formMethods = useForm<TicketForm>({ defaultValues: { category: '', priority: 'Low', subject: '', message: '', files: [] } });
    const queryClient = useQueryClient();
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Get current user
    const { data: authData } = useAuth();
    const user = authData?.user;

    // Get tickets from API
    const { data: ticketsData, isLoading: ticketsLoading, refetch: refetchTickets } = useGetTickets();

    // Create ticket mutation
    const createTicketMutation = useCreateTicket({
        onSuccess: (data: any) => {
            // Emit socket event to notify backend about the created ticket
            if (user?.user_id && data.result?.ticket_id) {
                createTicket(user.user_id, data.result.ticket_id);
            }
            
            // Reset form
            formMethods.reset();
            setAttachments([]);
            
            // Refetch tickets
            refetchTickets();
        },
        onError: (error) => {
            console.error('Failed to create ticket:', error);
        }
    });

    // Socket event handlers
    useEffect(() => {
        if (!user?.user_id) return;

        // Listen for ticket creation confirmation
        const unsubscribeTicketCreated = onTicketCreated((data: { success: boolean; ticket_id?: string }) => {
            if (data.success) {
                console.log('Ticket created successfully via socket');
                refetchTickets();
            }
        });

        // Listen for tickets data
        const unsubscribeTicketsReceived = onTicketsReceived((data: any[]) => {
            console.log('Tickets received via socket:', data);
            // Update the query cache with new data
            queryClient.setQueryData(['user', 'tickets'], { success: true, result: { tickets: data } });
        });

        // Request tickets via socket
        getTickets(user.user_id);

        return () => {
            unsubscribeTicketCreated();
            unsubscribeTicketsReceived();
        };
    }, [user?.user_id, queryClient, refetchTickets]);

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
        
        createTicketMutation.mutate(ticketData);
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

    // --- Table columns for My Tickets ---
    const ticketColumns = [
        {
            header: 'Subject',
            accessor: (row: any) => (
                <span className="font-semibold text-primary-light underline cursor-pointer" onClick={() => {}}>{row.subject}</span>
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
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                </select>
                <DateRangeSelect selectedYear={''} selectedMonth={''} onYearChange={() => {}} onMonthChange={() => {}} />
                </div>

                <Table
                    data={filteredTickets}
                    columns={ticketColumns}
                    getRowClassName={() => 'cursor-pointer'}
                    renderActions={undefined}
                    rowsPerPage={10}
                    loading={ticketsLoading}
                    message="No tickets found."
                    actions={undefined}
                />
            </div>
            )}

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