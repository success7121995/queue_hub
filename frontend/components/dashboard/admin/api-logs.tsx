"use client";

// TODO: Enable when backend is ready
// import { useQuery } from "@tanstack/react-query";
import { Table } from "@/components";
import { Column } from "@/components/common/table";
import LoadingIndicator from "@/components/common/loading-indicator";
import ExportBtn from "@/components/common/export-btn";
import { useDateTime } from "@/constant/datetime-provider";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";

interface ApiLog {
	id: string;
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	endpoint: string;
	status: number;
	responseTime: number;
	ip: string;
	userAgent: string;
	userId?: string;
	requestBody?: any;
	responseBody?: any;
	error?: string;
	createdAt: string;
}

const ApiLogs = () => {
	const { formatDate } = useDateTime();

	// TODO: Enable when backend is ready
	// const { data: logs, isLoading } = useQuery<ApiLog[]>({
	// 	queryKey: ['api-logs'],
	// 	queryFn: async () => { ... },
	// });

	// Mock data for demo
	const mockLogs: ApiLog[] = [
		{
			id: "LOG-001",
			method: "POST",
			endpoint: "/api/merchants",
			status: 201,
			responseTime: 245,
			ip: "192.168.1.100",
			userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
			userId: "USER-001",
			requestBody: { name: "New Merchant", email: "merchant@example.com" },
			responseBody: { id: "MERCHANT-001", status: "created" },
			createdAt: "2024-03-15T10:00:00Z",
		},
		{
			id: "LOG-002",
			method: "GET",
			endpoint: "/api/merchants/MERCHANT-001",
			status: 404,
			responseTime: 120,
			ip: "192.168.1.101",
			userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
			userId: "USER-002",
			error: "Merchant not found",
			createdAt: "2024-03-15T10:05:00Z",
		},
		{
			id: "LOG-003",
			method: "PUT",
			endpoint: "/api/merchants/MERCHANT-001/settings",
			status: 200,
			responseTime: 180,
			ip: "192.168.1.102",
			userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
			userId: "USER-001",
			requestBody: { theme: "dark", notifications: true },
			responseBody: { status: "updated" },
			createdAt: "2024-03-15T10:10:00Z",
		},
	];

	const data = mockLogs;

	// TODO: Enable when backend is ready
	// const apiLogs: ApiLog[] = logs || mockLogs;
	const apiLogs: ApiLog[] = [
		{ id: 'LOG-001', method: 'GET', endpoint: '/api/test', status: 200, responseTime: 120, ip: '127.0.0.1', userAgent: 'Chrome', createdAt: '2024-03-01T10:00:00Z' }
	];
	const isLoading = false;

	const getMethodBadge = (method: ApiLog["method"]) => {
		const methodConfig = {
			GET: "bg-blue-100 text-blue-800",
			POST: "bg-green-100 text-green-800",
			PUT: "bg-yellow-100 text-yellow-800",
			DELETE: "bg-red-100 text-red-800",
			PATCH: "bg-purple-100 text-purple-800",
		};
		return (
			<Badge className={methodConfig[method]}>
				{method}
			</Badge>
		);
	};

	const getStatusBadge = (status: number) => {
		const statusConfig = {
			success: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
			error: { color: "bg-red-100 text-red-800", icon: <AlertCircle className="w-4 h-4" /> },
			info: { color: "bg-blue-100 text-blue-800", icon: <Clock className="w-4 h-4" /> },
		};
		const config = status >= 200 && status < 300 ? statusConfig.success :
			status >= 400 ? statusConfig.error : statusConfig.info;
		return (
			<Badge className={`flex items-center gap-1 ${config.color}`}>
				{config.icon}
				{status}
			</Badge>
		);
	};

	const columns: Column<ApiLog>[] = [
		{
			header: "Time",
			accessor: (row) => formatDate(new Date(row.createdAt)),
		},
		{
			header: "Method",
			accessor: (row) => getMethodBadge(row.method),
		},
		{
			header: "Endpoint",
			accessor: "endpoint",
		},
		{
			header: "Status",
			accessor: (row) => getStatusBadge(row.status),
		},
		{
			header: "Response Time",
			accessor: (row) => `${row.responseTime}ms`,
		},
		{
			header: "IP Address",
			accessor: "ip",
		},
		{
			header: "User Agent",
			accessor: "userAgent",
		},
		{
			header: "User ID",
			accessor: (row) => row.userId || "Anonymous",
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
				<h1 className="text-3xl text-primary-light font-bold">API Logs</h1>
				<ExportBtn data={data} filename="api-logs" />
			</div>

			<div className="w-full overflow-x-auto">
				<Table columns={columns} data={data} />
			</div>
		</div>
	);
};

export default ApiLogs; 