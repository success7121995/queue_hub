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
			accessor: "subject",
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
		{
			header: "Actions",
			accessor: (row) => (
				<div className="flex gap-2">
					<button className="bg-primary-light text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">
						View
					</button>
					<button className="bg-white border border-primary-light text-primary-light px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-light hover:text-white transition-colors">
						Assign
					</button>
				</div>
			),
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
		</div>
	);
};

export default Tickets; 