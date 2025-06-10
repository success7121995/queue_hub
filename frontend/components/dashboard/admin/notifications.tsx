"use client";

import { useState } from "react";
// TODO: Enable when backend is ready
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table } from "@/components";
import { Column } from "@/components/common/table";
import LoadingIndicator from "@/components/common/loading-indicator";
import ExportBtn from "@/components/common/export-btn";
import { useDateTime } from "@/constant/datetime-provider";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, CheckCircle, AlertCircle, Info, Trash2, Edit2 } from "lucide-react";
import { useForm } from "react-hook-form";

interface Notification {
	id: string;
	title: string;
	message: string;
	type: "info" | "warning" | "error" | "success";
	priority: "low" | "medium" | "high";
	status: "active" | "inactive" | "archived";
	targetAudience: ("all" | "customers" | "merchants" | "admins")[];
	scheduledFor?: string;
	expiresAt?: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

interface NotificationFormData {
	title: string;
	message: string;
	type: Notification["type"];
	priority: Notification["priority"];
	targetAudience: Notification["targetAudience"];
	scheduledFor?: string;
	expiresAt?: string;
}

const Notifications = () => {
	const { formatDate } = useDateTime();
	const [isEditing, setIsEditing] = useState(false);
	const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
	// TODO: Enable when backend is ready
	// const queryClient = useQueryClient();

	const { register, handleSubmit, reset, formState: { errors } } = useForm<NotificationFormData>();

	// TODO: Enable when backend is ready
	/*
	const { data: notifications, isLoading } = useQuery<Notification[]>({
		queryKey: ['notifications'],
		queryFn: async () => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/notifications`, {
				credentials: 'include',
			});
			if (!res.ok) throw new Error('Failed to fetch notifications');
			return res.json();
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: NotificationFormData) => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/notifications`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error('Failed to create notification');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
			reset();
			setIsEditing(false);
		},
	});

	const updateMutation = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: NotificationFormData }) => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/notifications/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error('Failed to update notification');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
			reset();
			setIsEditing(false);
			setSelectedNotification(null);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/notifications/${id}`, {
				method: 'DELETE',
				credentials: 'include',
			});
			if (!res.ok) throw new Error('Failed to delete notification');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
		},
	});
	*/

	// Mock data for UI development
	const mockNotifications: Notification[] = [
		{
			id: "NOTIF-001",
			title: "System Maintenance",
			message: "Scheduled maintenance on March 20, 2024 from 2:00 AM to 4:00 AM HKT",
			type: "info",
			priority: "medium",
			status: "active",
			targetAudience: ["all"],
			scheduledFor: "2024-03-20T02:00:00Z",
			expiresAt: "2024-03-20T04:00:00Z",
			createdBy: "ADMIN-001",
			createdAt: "2024-03-15T10:00:00Z",
			updatedAt: "2024-03-15T10:00:00Z",
		},
		{
			id: "NOTIF-002",
			title: "Security Alert",
			message: "Multiple failed login attempts detected. Please review your account security.",
			type: "warning",
			priority: "high",
			status: "active",
			targetAudience: ["admins"],
			createdBy: "SYSTEM",
			createdAt: "2024-03-15T10:05:00Z",
			updatedAt: "2024-03-15T10:05:00Z",
		},
		{
			id: "NOTIF-003",
			title: "New Feature Available",
			message: "QueueHub now supports QR code-based queue management!",
			type: "success",
			priority: "low",
			status: "active",
			targetAudience: ["merchants", "customers"],
			createdBy: "ADMIN-001",
			createdAt: "2024-03-15T10:10:00Z",
			updatedAt: "2024-03-15T10:10:00Z",
		},
	];

	// Use mock data instead of query data
	const notifications = mockNotifications;
	const isLoading = false;

	// Mock handlers for UI development
	const handleCreate = async (data: NotificationFormData) => {
		console.log('Create notification:', data);
		reset();
		setIsEditing(false);
	};

	const handleUpdate = async (id: string, data: NotificationFormData) => {
		console.log('Update notification:', { id, data });
		reset();
		setIsEditing(false);
		setSelectedNotification(null);
	};

	const handleDelete = async (id: string) => {
		console.log('Delete notification:', id);
	};

	const onSubmit = (data: NotificationFormData) => {
		if (isEditing && selectedNotification) {
			handleUpdate(selectedNotification.id, data);
		} else {
			handleCreate(data);
		}
	};

	const getTypeBadge = (type: Notification["type"]) => {
		const typeConfig = {
			info: { color: "bg-blue-100 text-blue-800", icon: <Info className="w-4 h-4" /> },
			warning: { color: "bg-yellow-100 text-yellow-800", icon: <AlertCircle className="w-4 h-4" /> },
			error: { color: "bg-red-100 text-red-800", icon: <AlertCircle className="w-4 h-4" /> },
			success: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
		};
		const config = typeConfig[type];
		return (
			<Badge className={`flex items-center gap-1 ${config.color}`}>
				{config.icon}
				{type.charAt(0).toUpperCase() + type.slice(1)}
			</Badge>
		);
	};

	const getStatusBadge = (status: Notification["status"]) => {
		const statusConfig = {
			active: { color: "bg-green-100 text-green-800", icon: <Bell className="w-4 h-4" /> },
			inactive: { color: "bg-gray-100 text-gray-800", icon: <BellOff className="w-4 h-4" /> },
			archived: { color: "bg-gray-100 text-gray-800", icon: <BellOff className="w-4 h-4" /> },
		};
		const config = statusConfig[status];
		return (
			<Badge className={`flex items-center gap-1 ${config.color}`}>
				{config.icon}
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</Badge>
		);
	};

	const columns: Column<Notification>[] = [
		{
			header: "Title",
			accessor: (row) => (
				<div>
					<div className="font-medium">{row.title}</div>
					<div className="text-sm text-gray-500">{row.message}</div>
				</div>
			),
		},
		{
			header: "Type",
			accessor: (row) => getTypeBadge(row.type),
		},
		{
			header: "Priority",
			accessor: (row) => (
				<Badge className={`${
					row.priority === "high" ? "bg-red-100 text-red-800" :
					row.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
					"bg-blue-100 text-blue-800"
				}`}>
					{row.priority.charAt(0).toUpperCase() + row.priority.slice(1)}
				</Badge>
			),
		},
		{
			header: "Status",
			accessor: (row) => getStatusBadge(row.status),
		},
		{
			header: "Target Audience",
			accessor: (row) => (
				<div className="flex flex-wrap gap-1">
					{row.targetAudience.map((audience) => (
						<Badge key={audience} className="bg-gray-100 text-gray-800">
							{audience.charAt(0).toUpperCase() + audience.slice(1)}
						</Badge>
					))}
				</div>
			),
		},
		{
			header: "Schedule",
			accessor: (row) => (
				<div>
					{row.scheduledFor && (
						<div>
							<span className="text-gray-500">From: </span>
							{formatDate(new Date(row.scheduledFor))}
						</div>
					)}
					{row.expiresAt && (
						<div>
							<span className="text-gray-500">To: </span>
							{formatDate(new Date(row.expiresAt))}
						</div>
					)}
				</div>
			),
		},
		{
			header: "Created",
			accessor: (row) => (
				<div>
					<div>{formatDate(new Date(row.createdAt))}</div>
					<div className="text-sm text-gray-500">by {row.createdBy}</div>
				</div>
			),
		},
		{
			header: "Actions",
			accessor: (row) => (
				<div className="flex gap-2">
					<button
						onClick={() => {
							setSelectedNotification(row);
							setIsEditing(true);
							reset(row);
						}}
						className="bg-primary-light text-white p-2 rounded-full hover:bg-primary-dark transition-colors"
					>
						<Edit2 className="w-4 h-4" />
					</button>
					<button
						onClick={() => handleDelete(row.id)}
						className="bg-red-100 text-red-800 p-2 rounded-full hover:bg-red-200 transition-colors"
					>
						<Trash2 className="w-4 h-4" />
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
				<h1 className="text-3xl text-primary-light font-bold">Notifications</h1>
				<div className="flex gap-4">
					<button
						onClick={() => {
							setIsEditing(true);
							setSelectedNotification(null);
							reset();
						}}
						className="bg-primary-light text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
					>
						Create Notification
					</button>
					<ExportBtn data={notifications} filename="notifications" />
				</div>
			</div>

			{isEditing && (
				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<h2 className="text-xl font-semibold mb-4">
						{selectedNotification ? "Edit Notification" : "Create Notification"}
					</h2>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">Title</label>
								<input
									type="text"
									{...register("title", { required: "Title is required" })}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
								/>
								{errors.title && (
									<p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Type</label>
								<select
									{...register("type", { required: "Type is required" })}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
								>
									<option value="info">Info</option>
									<option value="warning">Warning</option>
									<option value="error">Error</option>
									<option value="success">Success</option>
								</select>
								{errors.type && (
									<p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Priority</label>
								<select
									{...register("priority", { required: "Priority is required" })}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
								>
									<option value="low">Low</option>
									<option value="medium">Medium</option>
									<option value="high">High</option>
								</select>
								{errors.priority && (
									<p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Target Audience</label>
								<select
									multiple
									{...register("targetAudience", { required: "Target audience is required" })}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
								>
									<option value="all">All Users</option>
									<option value="customers">Customers</option>
									<option value="merchants">Merchants</option>
									<option value="admins">Admins</option>
								</select>
								{errors.targetAudience && (
									<p className="mt-1 text-sm text-red-600">{errors.targetAudience.message}</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Scheduled For</label>
								<input
									type="datetime-local"
									{...register("scheduledFor")}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Expires At</label>
								<input
									type="datetime-local"
									{...register("expiresAt")}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Message</label>
							<textarea
								{...register("message", { required: "Message is required" })}
								rows={4}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
							/>
							{errors.message && (
								<p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
							)}
						</div>
						<div className="flex justify-end gap-4">
							<button
								type="button"
								onClick={() => {
									setIsEditing(false);
									setSelectedNotification(null);
									reset();
								}}
								className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-primary-light text-white rounded-md text-sm font-medium hover:bg-primary-dark"
							>
								{selectedNotification ? "Update" : "Create"}
							</button>
						</div>
					</form>
				</div>
			)}

			<div className="w-full overflow-x-auto">
				<Table columns={columns} data={notifications} />
			</div>
		</div>
	);
};

export default Notifications; 