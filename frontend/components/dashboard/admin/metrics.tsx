"use client";

import { useQuery } from "@tanstack/react-query";
import LoadingIndicator from "@/components/common/loading-indicator";
import { LineChart, BarChart, PieChart } from "@/components/ui/charts";
import { Users, Clock, Activity, AlertCircle } from "lucide-react";
import NumberCard from "@/components/common/number-card";
import ExportBtn from "@/components/common/export-btn";

// TODO: Create these UI components
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { LineChart, BarChart, PieChart } from "@/components/ui/charts";

interface LogEntry {
	id: string;
	timestamp: string;
	action: string;
	user: string;
	details: string;
}

interface MetricsData {
	topMerchantsMonthly: Array<{ name: string; value: number }>;
	topMerchantsAnnually: Array<{ name: string; value: number }>;
	errorCount: number;
	totalMerchants: number;
	dailyActiveUsers: {
		customers: number;
		merchantStaff: number;
		admins: number;
	};
	errorRate: number;
	uptimePercentage: number;
	avgSupportResponseTime: number;
	systemThroughput: number;
	supportTicketVolume: number;
	activeRegions: Array<{ region: string; count: number }>;
	merchantApprovalRate: number;
	totalAccountDeletion: number;
	recentLogs: LogEntry[];
}

const Metrics = () => {
	const { data: metricsData, isLoading } = useQuery<MetricsData>({
		queryKey: ['admin-metrics'],
		queryFn: async () => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/metrics`, {
				credentials: 'include',
			});
			if (!res.ok) throw new Error('Failed to fetch metrics');
			return res.json();
		},
	});

	// if (isLoading) {
	// 	return <LoadingIndicator fullScreen />;
	// }

	// Calculate system throughput data with fallback to 0
	const systemThroughput = metricsData?.systemThroughput || 0;
	const throughputData = [
		{ time: "00:00", value: systemThroughput },
		{ time: "04:00", value: systemThroughput * 0.8 },
		{ time: "08:00", value: systemThroughput * 1.2 },
		{ time: "12:00", value: systemThroughput * 1.5 },
		{ time: "16:00", value: systemThroughput * 1.3 },
		{ time: "20:00", value: systemThroughput * 0.9 },
	];

	const summaryData = [
		{ label: "Total Merchants", value: metricsData?.totalMerchants || 0, unit: "merchants" },
		{ label: "Error Rate", value: metricsData?.errorRate || 0, unit: "%" },
		{ label: "Uptime", value: metricsData?.uptimePercentage || 0, unit: "%" },
		{ label: "Support Response", value: metricsData?.avgSupportResponseTime || 0, unit: "mins" },
		{ label: "System Throughput", value: metricsData?.systemThroughput || 0, unit: "req/min" },
		{ label: "Support Tickets", value: metricsData?.supportTicketVolume || 0, unit: "tickets" },
	];

	const performanceMetrics = [
		{ label: "Total Merchants", value: metricsData?.totalMerchants?.toString() || "0", unit: "merchants", trend: "+5%" },
		{ label: "Error Rate", value: metricsData?.errorRate?.toString() || "0", unit: "%", trend: "-2%" },
		{ label: "Uptime", value: metricsData?.uptimePercentage?.toString() || "0", unit: "%", trend: "+0.5%" },
		{ label: "Support Response", value: metricsData?.avgSupportResponseTime?.toString() || "0", unit: "mins", trend: "-10%" },
		{ label: "Merchant Approval", value: metricsData?.merchantApprovalRate?.toString() || "0", unit: "%", trend: "+8%" },
		{ label: "Account Deletions", value: metricsData?.totalAccountDeletion?.toString() || "0", unit: "accounts", trend: "-3%" },
	];

	return (
		<div className="p-8 min-h-screen font-regular-eng">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-3xl mb-8 text-primary-light font-bold">System Metrics</h1>
			</div>

			{/* Summary Cards */}
			<div>
				<ExportBtn data={summaryData} filename="metrics-summary" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:w-[70%] lg:w-[80%]">
					{summaryData.map((item, idx) => (
						<NumberCard 
							key={item.label} 
							title={item.label} 
							value={Number(item.value)} 
							unit={item.unit} 
							icon={<Users size={32} className="text-primary-light" />} 
						/>
					))}
				</div>
			</div>

			{/* System Health Overview */}
			<div className="flex items-center bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-5 shadow-sm w-fit pr-40 mx-auto min-h-[100px] my-15">
				<div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-200 mr-4">
					<Activity size={60} className="text-primary-light" />
				</div>
				<div>
					<div className="text-6xl font-bold text-primary-light">{metricsData?.uptimePercentage || 0}%</div>
					<div className="text-base font-semibold text-primary-light mt-1">System Uptime</div>
				</div>
			</div>

			{/* Performance Metrics */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
				<div className="bg-white rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary-light/10 rounded-lg">
								<AlertCircle size={20} className="text-primary-light" />
							</div>
							<h3 className="text-xl font-bold text-primary-light">System Performance</h3>
						</div>
						<div className="flex items-center gap-2">
							<input 
								type="date" 
								className="border rounded px-2 py-1 text-xs outline-none border-primary-light/30 text-primary-light" 
								placeholder="From" 
							/>
							<span className="text-xs text-primary-light">To</span>
							<input 
								type="date" 
								className="border rounded px-2 py-1 text-xs outline-none border-primary-light/30 text-primary-light" 
								placeholder="To" 
							/>
							<ExportBtn data={performanceMetrics} filename="system-performance" />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						{performanceMetrics.map(item => (
							<div key={item.label} className="bg-gray-50 rounded-lg p-4">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-gray-600">{item.label}</span>
									<span className={`text-xs px-2 py-1 rounded-full ${
										item.trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
									}`}>
										{item.trend}
									</span>
								</div>
								<div className="flex items-baseline gap-1">
									<span className="text-2xl font-bold text-primary-light">{item.value}</span>
									<span className="text-sm text-gray-500">{item.unit}</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Charts Section */}
				<div className="bg-white rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary-light/10 rounded-lg">
								<Clock size={20} className="text-primary-light" />
							</div>
							<h3 className="text-xl font-bold text-primary-light">System Throughput</h3>
						</div>
						<ExportBtn data={throughputData} filename="system-throughput" />
					</div>
					<div className="w-full h-[300px]">
						<LineChart
							data={throughputData}
							xKey="time"
							yKey="value"
							stroke="#00C49F"
						/>
					</div>
				</div>
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
				<div className="bg-white rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary-light/10 rounded-lg">
								<Users size={20} className="text-primary-light" />
							</div>
							<h3 className="text-xl font-bold text-primary-light">Top Merchants</h3>
						</div>
						<ExportBtn data={metricsData?.topMerchantsMonthly || []} filename="top-merchants" />
					</div>
					<div className="w-full h-[300px]">
						<BarChart
							data={metricsData?.topMerchantsMonthly || []}
							xKey="name"
							yKey="value"
							fill="#FACC15"
						/>
					</div>
				</div>

				<div className="bg-white rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary-light/10 rounded-lg">
								<Users size={20} className="text-primary-light" />
							</div>
							<h3 className="text-xl font-bold text-primary-light">Daily Active Users</h3>
						</div>
						<ExportBtn 
							data={[
								{ name: "Customers", value: metricsData?.dailyActiveUsers.customers || 0 },
								{ name: "Merchant Staff", value: metricsData?.dailyActiveUsers.merchantStaff || 0 },
								{ name: "Admins", value: metricsData?.dailyActiveUsers.admins || 0 },
							]} 
							filename="daily-active-users" 
						/>
					</div>
					<div className="w-full h-[300px]">
						<PieChart
							data={[
								{ name: "Customers", value: metricsData?.dailyActiveUsers.customers || 0 },
								{ name: "Merchant Staff", value: metricsData?.dailyActiveUsers.merchantStaff || 0 },
								{ name: "Admins", value: metricsData?.dailyActiveUsers.admins || 0 },
							]}
							nameKey="name"
							valueKey="value"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Metrics;