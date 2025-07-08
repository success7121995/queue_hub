"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table } from "@/components";
import { Column } from "@/components/common/table";
import LoadingIndicator from "@/components/common/loading-indicator";
import ExportBtn from "@/components/common/export-btn";
import { useDateTime } from "@/constant/datetime-provider";
import { Badge } from "@/components/common/badge";
import { Bell, BellOff, CheckCircle, AlertCircle, Info, Trash2, Edit2 } from "lucide-react";
import { useGetNotifications, useDeleteNotification, useMarkNotificationAsRead } from "@/hooks/user-hooks";
import { onNotificationUpdate, getNotifications, joinRoom, connectSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/auth-hooks";
import { Notification } from "@/types/notification";

// Removed NotificationFormData interface as it's not needed for the real notification system

const Notifications = () => {
	const { formatDate } = useDateTime();
	const queryClient = useQueryClient();
	const { data: authData } = useAuth();
	const userId = authData?.user?.user_id;

	// Get notifications using the hook
	const { data: notificationData, isLoading } = useGetNotifications();
	const notifications = notificationData?.notifications || [];

	// Delete notification mutation
	const deleteMutation = useDeleteNotification({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] });
		},
	});

	// Mark notification as read mutation
	const markAsReadMutation = useMarkNotificationAsRead({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] });
		},
	});

	// Socket event handlers for real-time notification updates
	useEffect(() => {
		if (!userId) return;

		// Connect to socket and join user room
		connectSocket();
		joinRoom(userId);

		const handleNotificationUpdate = (data: { notifications: Notification[]; unreadCount: number }) => {
			// Update the query cache with new data
			queryClient.setQueryData(['user', 'notifications'], { 
				success: true, 
				notifications: data.notifications,
				unreadCount: data.unreadCount
			});
		};

		// Register socket event listener
		const unregister = onNotificationUpdate(handleNotificationUpdate);

		// Request initial notifications
		getNotifications(userId);

		// Cleanup
		return () => {
			unregister();
		};
	}, [userId, queryClient]);

	const handleDelete = async (notificationId: string) => {
		deleteMutation.mutate(notificationId);
	};

	const handleMarkAsRead = async (notificationId: string) => {
		markAsReadMutation.mutate(notificationId);
	};

	const columns: Column<Notification>[] = [
		{
			header: "Title",
			accessor: "title",
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
			header: "Read Status",
			accessor: (row) => (
				<Badge className={row.is_read ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
					{row.is_read ? "Read" : "Unread"}
				</Badge>
			),
		},
		{
			header: "Created",
			accessor: (row) => formatDate(new Date(row.created_at)),
		},
		{
			header: "Actions",
			accessor: (row) => (
				<div className="flex gap-2">
					{!row.is_read && (
						<button
							onClick={() => handleMarkAsRead(row.notification_id)}
							className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
						>
							<CheckCircle className="w-4 h-4" />
						</button>
					)}
					<button
						onClick={() => handleDelete(row.notification_id)}
						className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
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
				<ExportBtn data={notifications} filename="notifications" />
			</div>

			<div className="w-full overflow-x-auto">
				<Table columns={columns} data={notifications} />
			</div>
		</div>
	);
};

export default Notifications; 