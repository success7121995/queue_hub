"use client";

import Table, { type Column } from "@/components/common/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/card";
import { Activity } from "lucide-react";
import ExportBtn from "@/components/common/export-btn";

interface LogEntry {
	log_id: string;
	user_id: string;
	action: string;
	action_data: Record<string, any>;
	success: boolean;
	error: string | null;
	status: number;
	created_at: string;
	updated_at: string;
}

const dummyLogs: LogEntry[] = [
	{
		log_id: "1",
		user_id: "admin_001",
		action: "LOGIN",
		action_data: { ip: "192.168.1.10" },
		success: true,
		error: null,
		status: 200,
		created_at: "2024-06-01T10:00:00Z",
		updated_at: "2024-06-01T10:00:00Z",
	},
	{
		log_id: "2",
		user_id: "admin_002",
		action: "CREATE_MERCHANT",
		action_data: { merchant: "CoffeeHub" },
		success: true,
		error: null,
		status: 201,
		created_at: "2024-06-01T11:00:00Z",
		updated_at: "2024-06-01T11:00:00Z",
	},
	{
		log_id: "3",
		user_id: "admin_001",
		action: "DELETE_USER",
		action_data: { user: "user_123" },
		success: false,
		error: "User not found",
		status: 404,
		created_at: "2024-06-01T12:00:00Z",
		updated_at: "2024-06-01T12:00:00Z",
	},
	{
		log_id: "4",
		user_id: "admin_003",
		action: "UPDATE_SETTINGS",
		action_data: { field: "theme", value: "dark" },
		success: true,
		error: null,
		status: 200,
		created_at: "2024-06-01T13:00:00Z",
		updated_at: "2024-06-01T13:00:00Z",
	},
	{
		log_id: "5",
		user_id: "admin_002",
		action: "RESET_PASSWORD",
		action_data: { user: "user_456" },
		success: true,
		error: null,
		status: 200,
		created_at: "2024-06-01T14:00:00Z",
		updated_at: "2024-06-01T14:00:00Z",
	},
];

const logColumns: Column<LogEntry>[] = [
	{ header: "Time", accessor: "created_at", priority: 1 },
	{ header: "User", accessor: "user_id", priority: 2 },
	{ header: "Action", accessor: "action", priority: 2 },
	{ header: "Status", accessor: "status", priority: 2 },
	{ header: "Success", accessor: (row) => (row.success ? "Yes" : "No"), priority: 2 },
	{ header: "Error", accessor: "error", priority: 3 },
	{ header: "Details", accessor: (row) => JSON.stringify(row.action_data), priority: 3 },
];

const AdminLogsPage = () => {
	return (
		<div className="p-8 min-h-screen font-regular-eng">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-3xl mb-8 text-primary-light font-bold">Activity Logs</h1>
			</div>
			<div className="bg-white rounded-lg p-6 shadow-sm">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary-light/10 rounded-lg">
							<Activity size={20} className="text-primary-light" />
						</div>
						<h3 className="text-xl font-bold text-primary-light">Recent Activity Logs</h3>
					</div>
					<ExportBtn data={dummyLogs} filename="activity-logs" />
				</div>
				<div className="w-full">
					<Table columns={logColumns} data={dummyLogs} />
				</div>
			</div>
		</div>
	);
}

export default AdminLogsPage;