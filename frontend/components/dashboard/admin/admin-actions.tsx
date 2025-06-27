"use client";

// TODO: Enable when backend is ready
// import { useQuery } from "@tanstack/react-query";
import { Table } from "@/components";
import { Column } from "@/components/common/table";
import LoadingIndicator from "@/components/common/loading-indicator";
import ExportBtn from "@/components/common/export-btn";
import { useDateTime } from "@/constant/datetime-provider";
import { Badge } from "@/components/common/badge";
import { User, Settings, Shield, AlertCircle, CheckCircle } from "lucide-react";

interface AdminAction {
	id: string;
	adminId: string;
	adminName: string;
	adminEmail: string;
	action: string;
	actionType: "user_management" | "system_settings" | "security" | "other";
	details: any;
	ip: string;
	userAgent: string;
	status: "success" | "failure";
	error?: string;
	createdAt: string;
}

const AdminActions = () => {
	const { formatDate } = useDateTime();

	// TODO: Enable when backend is ready
	// const { data: actions, isLoading } = useQuery<AdminAction[]>({
	// 	queryKey: ['admin-actions'],
	// 	queryFn: async () => { ... },
	// });

	// Mock data for demo
	const mockActions: AdminAction[] = [
		{
			id: "ACTION-001",
			adminId: "ADMIN-001",
			adminName: "John Admin",
			adminEmail: "admin@queuehub.com",
			action: "Created new merchant account",
			actionType: "user_management",
			details: { merchantId: "MERCHANT-001", merchantName: "New Merchant" },
			ip: "192.168.1.100",
			userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
			status: "success",
			createdAt: "2024-03-15T10:00:00Z",
		},
		{
			id: "ACTION-002",
			adminId: "ADMIN-002",
			adminName: "Jane Admin",
			adminEmail: "jane@queuehub.com",
			action: "Updated system settings",
			actionType: "system_settings",
			details: { setting: "maintenance_mode", value: true },
			ip: "192.168.1.101",
			userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
			status: "success",
			createdAt: "2024-03-15T10:05:00Z",
		},
		{
			id: "ACTION-003",
			adminId: "ADMIN-001",
			adminName: "John Admin",
			adminEmail: "admin@queuehub.com",
			action: "Failed to delete user account",
			actionType: "user_management",
			details: { userId: "USER-001" },
			ip: "192.168.1.100",
			userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
			status: "failure",
			error: "User has active subscriptions",
			createdAt: "2024-03-15T10:10:00Z",
		},
	];

	const data = mockActions;

	// TODO: Enable when backend is ready
	// const adminActions: AdminAction[] = actions || mockActions;
	// const isLoading = isLoading;
	const adminActions: AdminAction[] = [
		{ id: 'ACTION-001', adminId: 'A1', adminName: 'Admin 1', adminEmail: 'admin1@example.com', action: 'Login', actionType: 'user_management', details: {}, ip: '127.0.0.1', userAgent: 'Chrome', status: 'success', createdAt: '2024-03-01T10:00:00Z' }
	];
	const isLoading = false;

	const getActionTypeBadge = (type: AdminAction["actionType"]) => {
		const typeConfig = {
			user_management: { color: "bg-blue-100 text-blue-800", icon: <User className="w-4 h-4" /> },
			system_settings: { color: "bg-yellow-100 text-yellow-800", icon: <Settings className="w-4 h-4" /> },
			security: { color: "bg-red-100 text-red-800", icon: <Shield className="w-4 h-4" /> },
			other: { color: "bg-gray-100 text-gray-800", icon: <AlertCircle className="w-4 h-4" /> },
		};
		const config = typeConfig[type];
		return (
			<Badge className={`flex items-center gap-1 ${config.color}`}>
				{config.icon}
				{type.replace("_", " ").charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}
			</Badge>
		);
	};

	const getStatusBadge = (status: AdminAction["status"]) => {
		const statusConfig = {
			success: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
			failure: { color: "bg-red-100 text-red-800", icon: <AlertCircle className="w-4 h-4" /> },
		};
		const config = statusConfig[status];
		return (
			<Badge className={`flex items-center gap-1 ${config.color}`}>
				{config.icon}
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</Badge>
		);
	};

	const columns: Column<AdminAction>[] = [
		{
			header: "Time",
			accessor: (row) => formatDate(new Date(row.createdAt)),
		},
		{
			header: "Admin",
			accessor: (row) => (
				<div>
					<div className="font-medium">{row.adminName}</div>
					<div className="text-sm text-gray-500">{row.adminEmail}</div>
				</div>
			),
		},
		{
			header: "Action",
			accessor: "action",
		},
		{
			header: "Type",
			accessor: (row) => getActionTypeBadge(row.actionType),
		},
		{
			header: "Status",
			accessor: (row) => getStatusBadge(row.status),
		},
		{
			header: "IP Address",
			accessor: "ip",
		},
		{
			header: "Error",
			accessor: "error",
		},
		{
			header: "Actions",
			accessor: (row) => (
				<div className="flex gap-2">
					<button className="bg-primary-light text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">
						View Details
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
				<h1 className="text-3xl text-primary-light font-bold">Admin Actions</h1>
				<ExportBtn data={data} filename="admin-actions" />
			</div>

			<div className="w-full overflow-x-auto">
				<Table columns={columns} data={data} />
			</div>
		</div>
	);
};

export default AdminActions; 