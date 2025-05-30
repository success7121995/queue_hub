import React from "react";
import Table, { Column } from "@/components/common/table";

// Dummy data for SystemHealth
const systemHealthData = [
	{
		id: 1,
		uptime_percentage: 99.98,
		error_count: 2,
		monitored_at: "2024-06-10T12:00:00Z",
		source: "Sentry"
	},
	{
		id: 2,
		uptime_percentage: 99.95,
		error_count: 1,
		monitored_at: "2024-06-09T12:00:00Z",
		source: "UptimeRobot"
	},
	{
		id: 3,
		uptime_percentage: 99.99,
		error_count: 0,
		monitored_at: "2024-06-08T12:00:00Z",
		source: "LogRocket"
	}
];

// Dummy data for AnalyticsLog
const analyticsLogData = [
	{
		id: 1,
		subject_type: "system",
		subject_id: "sys-001",
		metric_type: "uptime",
		value: 99.98,
		recorded_at: new Date("2024-06-10T12:00:00Z")
	},
	{
		id: 2,
		subject_type: "queue",
		subject_id: "queue-123",
		metric_type: "error_count",
		value: 2,
		recorded_at: new Date("2024-06-10T12:05:00Z")
	},
	{
		id: 3,
		subject_type: "merchant",
		subject_id: "merchant-456",
		metric_type: "latency",
		value: 120,
		recorded_at: new Date("2024-06-10T12:10:00Z")
	},
	{
		id: 4,
		subject_type: "system",
		subject_id: "sys-001",
		metric_type: "error_count",
		value: 0,
		recorded_at: new Date("2024-06-09T12:00:00Z")
	}
];

const analyticsLogColumns: Column<typeof analyticsLogData[0]>[] = [
	{ header: "Subject Type", accessor: "subject_type" },
	{ header: "Subject ID", accessor: "subject_id" },
	{ header: "Metric Type", accessor: "metric_type" },
	{ header: "Value", accessor: "value" },
	{ header: "Recorded At", accessor: row => row.recorded_at.toLocaleString() },
];

const SystemHealth = () => {
	return (
		<div className="p-8 min-h-screen font-regular-eng">
			<h1 className="text-3xl mb-8 text-primary-light font-bold">System Health</h1>
			{/* System Health Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
				{systemHealthData.map((item) => (
					<div key={item.id} className="bg-white rounded-lg p-6 shadow-sm flex flex-col gap-2">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-lg font-bold text-primary-light">{item.source}</span>
							<span className="text-xs text-gray-400">{new Date(item.monitored_at).toLocaleString()}</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="text-2xl font-bold text-green-600">{item.uptime_percentage}%</span>
							<span className="text-xs text-gray-500">Uptime</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="text-xl font-bold text-red-500">{item.error_count}</span>
							<span className="text-xs text-gray-500">Error Count</span>
						</div>
					</div>
				))}
			</div>
			{/* Analytics Log Table */}
			<div className="bg-white rounded-lg p-6 shadow-sm">
				<h2 className="text-xl font-bold text-primary-light mb-4">Analytics Log</h2>
				<Table columns={analyticsLogColumns} data={analyticsLogData} rowsPerPage={5} />
			</div>
		</div>
	);
};

export default SystemHealth;