"use client";

import { useQuery } from "@tanstack/react-query";
import { Table } from "@/components";
import { Column } from "@/components/common/table";
import LoadingIndicator from "@/components/common/loading-indicator";
import ExportBtn from "@/components/common/export-btn";
import { useDateTime } from "@/constant/datetime-provider";
import { Badge } from "@/components/common/badge";
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useGetAllTickets } from "@/hooks/user-hooks";
import { useState } from "react";
import TicketModal from "./ticket-modal";

export interface Ticket {
	id: string;
	title: string;
	description: string;
	status: "open" | "in_progress" | "resolved" | "closed";
	priority: "low" | "medium" | "high" | "urgent";
	category: "technical" | "billing" | "account" | "other";
	createdBy: {
		id: string;
		name: string;
		email: string;
		role: "customer" | "merchant" | "admin";
	};
	assignedTo?: {
		id: string;
		name: string;
		email: string;
	};
	createdAt: string;
	updatedAt: string;
	lastActivityAt: string;
	comments: Array<{
		id: string;
		content: string;
		createdBy: {
			id: string;
			name: string;
			role: "customer" | "merchant" | "admin";
		};
		createdAt: string;
	}>;
}

interface TicketsProps {
	filter?: {
		status?: string | string[];
		priority?: string;
		category?: string;
		assignedTo?: string;
	};
	title: string;
}



const Tickets = ({ filter, title }: TicketsProps) => {
	const { formatDate } = useDateTime();
	
	// Modal state
	const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Determine status filter based on component usage
	let statusFilter: string | string[] | undefined;
	if (filter?.status) {
		statusFilter = filter.status;
	}

	const { data: ticketsResponse, isLoading } = useGetAllTickets(statusFilter, {
		staleTime: 0, // No stale cache allowed
		gcTime: 0, // No garbage collection time
	});

	const tickets = ticketsResponse?.result?.tickets || [];

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

	const getStatusBadge = (status: string) => {
		const statusConfig: Record<string, { color: string; icon: JSX.Element }> = {
			OPEN: { color: "bg-blue-100 text-blue-800", icon: <AlertCircle className="w-4 h-4" /> },
			IN_PROGRESS: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" /> },
			RESOLVED: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
		};
		const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", icon: <XCircle className="w-4 h-4" /> };
		return (
			<Badge className={`flex items-center gap-1 ${config.color}`}>
				{config.icon}
				{status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
			</Badge>
		);
	};

	const getPriorityBadge = (priority: string) => {
		const priorityConfig: Record<string, string> = {
			LOW: "bg-gray-100 text-gray-800",
			MEDIUM: "bg-blue-100 text-blue-800",
			HIGH: "bg-yellow-100 text-yellow-800",
			URGENT: "bg-red-100 text-red-800",
		};
		return (
			<Badge className={priorityConfig[priority] || "bg-gray-100 text-gray-800"}>
				{priority.charAt(0).toUpperCase() + priority.slice(1)}
			</Badge>
		);
	};

	const columns: Column<any>[] = [
		{
			header: "ID",
			accessor: "ticket_id",
		},
		{
			header: "Subject",
			accessor: (row) => (
				<span 
					className="font-semibold text-primary-light underline cursor-pointer hover:text-primary-hover transition-colors" 
					onClick={() => handleTicketClick(row.ticket_id)}
				>
					{row.subject}
				</span>
			),
		},
		{
			header: "Status",
			accessor: (row) => getStatusBadge(row.status),
		},
		{
			header: "Priority",
			accessor: (row) => getPriorityBadge(row.priority),
		},
		{
			header: "Category",
			accessor: (row) => row.category.charAt(0).toUpperCase() + row.category.slice(1),
		},
		{
			header: "Created By",
			accessor: (row) => (
				<div>
					<div className="font-medium">{row.User?.fname} {row.User?.lname}</div>
					<div className="text-sm text-gray-500">{row.User?.email}</div>
					<div className="text-xs text-gray-400">{row.User?.role}</div>
				</div>
			),
		},
		{
			header: "Assigned Admin",
			accessor: (row) => (
				<div className="text-sm text-gray-600">
					{row.assigned_admin ? (
						<>
							<div className="font-medium">{row.assigned_admin.fname} {row.assigned_admin.lname}</div>
							<div className="text-xs text-gray-500">{row.assigned_admin.email}</div>
						</>
					) : (
						<span className="text-gray-400 italic">Unassigned</span>
					)}
				</div>
			),
		},
		{
			header: "Content",
			accessor: (row) => (
				<div className="max-w-xs truncate">
					{row.content}
				</div>
			),
		},
		{
			header: "Attachments",
			accessor: (row) => (
				<div className="flex items-center gap-1">
					<MessageSquare className="w-4 h-4" />
					<span>{row.Attachment?.length || 0}</span>
				</div>
			),
		},
		{
			header: "Created",
			accessor: (row) => formatDate(new Date(row.created_at)),
		},
		{
			header: "Updated",
			accessor: (row) => formatDate(new Date(row.updated_at)),
		},
	];
	
	if (isLoading) {
		return (
			<div className="min-h-screen font-regular-eng p-8">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl text-primary-light font-bold">{title}</h1>
				</div>
				<LoadingIndicator />
			</div>
		);
	}

	return (
		<div className="min-h-screen font-regular-eng p-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl text-primary-light font-bold">{title}</h1>
				<ExportBtn data={tickets} filename="tickets" />
			</div>

			<div className="w-full overflow-x-auto">
				<Table columns={columns} data={tickets} />
			</div>

			{/* Ticket Detail Modal */}
			<TicketModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				ticketId={selectedTicketId}
			/>
		</div>
	);
};

export default Tickets; 