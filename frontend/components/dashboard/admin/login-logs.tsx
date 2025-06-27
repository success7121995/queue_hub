"use client";

// TODO: Enable when backend is ready
// import { useQuery } from "@tanstack/react-query";
import { Table } from "@/components";
import { Column } from "@/components/common/table";
import LoadingIndicator from "@/components/common/loading-indicator";
import ExportBtn from "@/components/common/export-btn";
import { useDateTime } from "@/constant/datetime-provider";
import { Badge } from "@/components/common/badge";
import { AlertCircle, CheckCircle, Shield, User } from "lucide-react";

interface LoginLog {
	id: string;
	userId?: string;
	userName?: string;
	userEmail?: string;
	userRole?: "customer" | "merchant" | "admin";
	ip: string;
	userAgent: string;
	status: "success" | "failure";
	failureReason?: string;
	location?: {
		country: string;
		city: string;
	};
	deviceInfo?: {
		type: "mobile" | "desktop" | "tablet";
		os: string;
		browser: string;
	};
	createdAt: string;
}

const LoginLogs = () => {
	const { formatDate } = useDateTime();

	// TODO: Enable when backend is ready
	// const { data: loginLogs, isLoading } = useQuery<LoginLog[]>({
	// 	queryKey: ['login-logs'],
	// 	queryFn: async () => { ... },
	// });

	const loginLogs: LoginLog[] = [
		{ id: 'LOG-001', userId: 'U1', userName: 'User 1', userEmail: 'user1@example.com', userRole: 'admin', ip: '127.0.0.1', userAgent: 'Chrome', status: 'success', createdAt: '2024-03-01T10:00:00Z' }
	];
	const isLoading = false;

	// Mock data for demo
	const mockLogs: LoginLog[] = [
		{
			id: "LOGIN-001",
			userId: "USER-001",
			userName: "John Doe",
			userEmail: "john@example.com",
			userRole: "merchant",
			ip: "192.168.1.100",
			userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
			status: "success",
			location: {
				country: "Hong Kong",
				city: "Hong Kong",
			},
			deviceInfo: {
				type: "desktop",
				os: "macOS",
				browser: "Chrome",
			},
			createdAt: "2024-03-15T10:00:00Z",
		},
		{
			id: "LOGIN-002",
			userEmail: "unknown@example.com",
			ip: "192.168.1.101",
			userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
			status: "failure",
			failureReason: "Invalid credentials",
			location: {
				country: "United States",
				city: "New York",
			},
			deviceInfo: {
				type: "desktop",
				os: "Windows",
				browser: "Firefox",
			},
			createdAt: "2024-03-15T10:05:00Z",
		},
		{
			id: "LOGIN-003",
			userId: "ADMIN-001",
			userName: "Admin User",
			userEmail: "admin@queuehub.com",
			userRole: "admin",
			ip: "192.168.1.102",
			userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
			status: "success",
			location: {
				country: "Hong Kong",
				city: "Kowloon",
			},
			deviceInfo: {
				type: "mobile",
				os: "iOS",
				browser: "Safari",
			},
			createdAt: "2024-03-15T10:10:00Z",
		},
	];

	const data = loginLogs || mockLogs;

	const getStatusBadge = (status: LoginLog["status"]) => {
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

	const getRoleBadge = (role?: LoginLog["userRole"]) => {
		if (!role) return null;
		const roleConfig = {
			customer: { color: "bg-blue-100 text-blue-800", icon: <User className="w-4 h-4" /> },
			merchant: { color: "bg-yellow-100 text-yellow-800", icon: <User className="w-4 h-4" /> },
			admin: { color: "bg-red-100 text-red-800", icon: <Shield className="w-4 h-4" /> },
		};
		const config = roleConfig[role];
		return (
			<Badge className={`flex items-center gap-1 ${config.color}`}>
				{config.icon}
				{role.charAt(0).toUpperCase() + role.slice(1)}
			</Badge>
		);
	};

	const columns: Column<LoginLog>[] = [
		{
			header: "Time",
			accessor: (row) => formatDate(new Date(row.createdAt)),
		},
		{
			header: "User",
			accessor: (row) => row.userName ? (
				<div>
					<div className="font-medium">{row.userName}</div>
					<div className="text-sm text-gray-500">{row.userEmail}</div>
					{getRoleBadge(row.userRole)}
				</div>
			) : (
				<div className="text-gray-500">Anonymous</div>
			),
		},
		{
			header: "Status",
			accessor: (row) => getStatusBadge(row.status),
		},
		{
			header: "Location",
			accessor: (row) => row.location ? (
				<div>
					<div>{row.location.city}</div>
					<div className="text-sm text-gray-500">{row.location.country}</div>
				</div>
			) : "Unknown",
		},
		{
			header: "Device",
			accessor: (row) => row.deviceInfo ? (
				<div>
					<div className="capitalize">{row.deviceInfo.type}</div>
					<div className="text-sm text-gray-500">{row.deviceInfo.browser} on {row.deviceInfo.os}</div>
				</div>
			) : "Unknown",
		},
		{
			header: "IP Address",
			accessor: "ip",
		},
		{
			header: "Failure Reason",
			accessor: "failureReason",
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
				<h1 className="text-3xl text-primary-light font-bold">Login Logs</h1>
				<ExportBtn data={data} filename="login-logs" />
			</div>

			<div className="w-full overflow-x-auto">
				<Table columns={columns} data={data} />
			</div>
		</div>
	);
};

export default LoginLogs; 