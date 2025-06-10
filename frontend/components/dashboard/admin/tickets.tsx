"use client";

import { useQuery } from "@tanstack/react-query";
import { Table } from "@/components";
import { Column } from "@/components/common/table";
import LoadingIndicator from "@/components/common/loading-indicator";
import ExportBtn from "@/components/common/export-btn";
import { useDateTime } from "@/constant/datetime-provider";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

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
		status?: Ticket["status"];
		priority?: Ticket["priority"];
		category?: Ticket["category"];
		assignedTo?: string;
	};
	title: string;
}

const Tickets = ({ filter, title }: TicketsProps) => {
	const { formatDate } = useDateTime();

	const { data: tickets, isLoading } = useQuery<Ticket[]>({
		queryKey: ['tickets', filter],
		queryFn: async () => {
			const queryParams = new URLSearchParams();
			if (filter?.status) queryParams.append('status', filter.status);
			if (filter?.priority) queryParams.append('priority', filter.priority);
			if (filter?.category) queryParams.append('category', filter.category);
			if (filter?.assignedTo) queryParams.append('assignedTo', filter.assignedTo);

			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/tickets?${queryParams}`, {
				credentials: 'include',
			});
			if (!res.ok) throw new Error('Failed to fetch tickets');
			return res.json();
		},
	});

	// Mock data for demo
	const mockTickets: Ticket[] = [
		{
			id: "TICKET-001",
			title: "Cannot access merchant dashboard",
			description: "I'm unable to log in to the merchant dashboard since yesterday.",
			status: "open",
			priority: "high",
			category: "technical",
			createdBy: {
				id: "USER-001",
				name: "John Doe",
				email: "john@example.com",
				role: "merchant",
			},
			createdAt: "2024-03-15T10:00:00Z",
			updatedAt: "2024-03-15T10:00:00Z",
			lastActivityAt: "2024-03-15T10:00:00Z",
			comments: [],
		},
		{
			id: "TICKET-002",
			title: "Billing issue with subscription",
			description: "I was charged twice for my monthly subscription.",
			status: "in_progress",
			priority: "urgent",
			category: "billing",
			createdBy: {
				id: "USER-002",
				name: "Jane Smith",
				email: "jane@example.com",
				role: "merchant",
			},
			assignedTo: {
				id: "ADMIN-001",
				name: "Admin User",
				email: "admin@queuehub.com",
			},
			createdAt: "2024-03-14T15:30:00Z",
			updatedAt: "2024-03-15T09:15:00Z",
			lastActivityAt: "2024-03-15T09:15:00Z",
			comments: [
				{
					id: "COMMENT-001",
					content: "Looking into this issue now.",
					createdBy: {
						id: "ADMIN-001",
						name: "Admin User",
						role: "admin",
					},
					createdAt: "2024-03-15T09:15:00Z",
				},
			],
		},
	];

	const data = tickets || mockTickets;

	const getStatusBadge = (status: Ticket["status"]) => {
		const statusConfig = {
			open: { color: "bg-blue-100 text-blue-800", icon: <AlertCircle className="w-4 h-4" /> },
			in_progress: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" /> },
			resolved: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
			closed: { color: "bg-gray-100 text-gray-800", icon: <XCircle className="w-4 h-4" /> },
		};
		const config = statusConfig[status];
		return (
			<Badge className={`flex items-center gap-1 ${config.color}`}>
				{config.icon}
				{status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
			</Badge>
		);
	};

	const getPriorityBadge = (priority: Ticket["priority"]) => {
		const priorityConfig = {
			low: "bg-gray-100 text-gray-800",
			medium: "bg-blue-100 text-blue-800",
			high: "bg-yellow-100 text-yellow-800",
			urgent: "bg-red-100 text-red-800",
		};
		return (
			<Badge className={priorityConfig[priority]}>
				{priority.charAt(0).toUpperCase() + priority.slice(1)}
			</Badge>
		);
	};

	const columns: Column<Ticket>[] = [
		{
			header: "ID",
			accessor: "id",
		},
		{
			header: "Title",
			accessor: "title",
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
					<div className="font-medium">{row.createdBy.name}</div>
					<div className="text-sm text-gray-500">{row.createdBy.email}</div>
				</div>
			),
		},
		{
			header: "Assigned To",
			accessor: (row) => row.assignedTo ? (
				<div>
					<div className="font-medium">{row.assignedTo.name}</div>
					<div className="text-sm text-gray-500">{row.assignedTo.email}</div>
				</div>
			) : "Unassigned",
		},
		{
			header: "Created",
			accessor: (row) => formatDate(new Date(row.createdAt)),
		},
		{
			header: "Last Activity",
			accessor: (row) => formatDate(new Date(row.lastActivityAt)),
		},
		{
			header: "Comments",
			accessor: (row) => (
				<div className="flex items-center gap-1">
					<MessageSquare className="w-4 h-4" />
					<span>{row.comments.length}</span>
				</div>
			),
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
		return <LoadingIndicator fullScreen />;
	}

	return (
		<div className="min-h-screen font-regular-eng p-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl text-primary-light font-bold">{title}</h1>
				<ExportBtn data={data} filename="tickets" />
			</div>

			<div className="w-full overflow-x-auto">
				<Table columns={columns} data={data} />
			</div>
		</div>
	);
};

export default Tickets; 