"use client";

import { useState } from "react";
// TODO: Enable when backend is ready
// import { useQuery } from "@tanstack/react-query";
import LoadingIndicator from "@/components/common/loading-indicator";
import { LineChart, BarChart, PieChart } from "@/components/common/charts";
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
	// System metrics
	totalUsers: number;
	activeUsers: number;
	totalQueues: number;
	activeQueues: number;
	averageWaitTime: number;
	totalTransactions: number;
	totalMerchants?: number;
	errorRate?: number;
	uptimePercentage?: number;
	avgSupportResponseTime?: number;
	systemThroughput?: number;
	supportTicketVolume?: number;
	merchantApprovalRate?: number;
	totalAccountDeletion?: number;
	dailyActiveUsers?: {
		customers: number;
		merchantStaff: number;
		admins: number;
	};
	topMerchantsMonthly?: Array<{
		name: string;
		value: number;
	}>;

	// Chart data
	userGrowth: Array<{
		date: string;
		count: number;
	}>;
	queueUsage: Array<{
		name: string;
		value: number;
	}>;
	waitTimeDistribution: Array<{
		range: string;
		count: number;
	}>;
}

const Metrics = () => {
	// TODO: Enable when backend is ready
	/*
	const { data: metrics, isLoading } = useQuery<MetricsData>({
		queryKey: ['metrics'],
		queryFn: async () => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/metrics`, {
				credentials: 'include',
			});
			if (!res.ok) throw new Error('Failed to fetch metrics');
			return res.json();
		},
	});
	*/

	// Mock data for UI development
	const mockMetrics: MetricsData = {
		totalUsers: 1250,
		activeUsers: 850,
		totalQueues: 45,
		activeQueues: 32,
		averageWaitTime: 15,
		totalTransactions: 12500,
		dailyActiveUsers: {
			customers: 800,
			merchantStaff: 200,
			admins: 50
		},
		userGrowth: [
			{ date: "2024-01", count: 800 },
			{ date: "2024-02", count: 950 },
			{ date: "2024-03", count: 1100 },
			{ date: "2024-04", count: 1250 }
		],
		queueUsage: [
			{ name: "Restaurants", value: 35 },
			{ name: "Retail", value: 25 },
			{ name: "Services", value: 20 },
			{ name: "Healthcare", value: 15 },
			{ name: "Other", value: 5 }
		],
		waitTimeDistribution: [
			{ range: "0-5 min", count: 150 },
			{ range: "5-10 min", count: 300 },
			{ range: "10-15 min", count: 450 },
			{ range: "15-20 min", count: 200 },
			{ range: "20+ min", count: 100 }
		]
	};

	// Use mock data instead of query data
	const metrics = mockMetrics;
	const isLoading = false;

	// Calculate system throughput data with fallback to 0
	const systemThroughput = metrics?.systemThroughput || 0;
	const throughputData = [
		{ time: "00:00", value: systemThroughput },
		{ time: "04:00", value: systemThroughput * 0.8 },
		{ time: "08:00", value: systemThroughput * 1.2 },
		{ time: "12:00", value: systemThroughput * 1.5 },
		{ time: "16:00", value: systemThroughput * 1.3 },
		{ time: "20:00", value: systemThroughput * 0.9 },
	];

	const summaryData = [
		{ label: "Total Merchants", value: metrics?.totalMerchants || 0, unit: "merchants" },
		{ label: "Error Rate", value: metrics?.errorRate || 0, unit: "%" },
		{ label: "Uptime", value: metrics?.uptimePercentage || 0, unit: "%" },
		{ label: "Support Response", value: metrics?.avgSupportResponseTime || 0, unit: "mins" },
		{ label: "System Throughput", value: metrics?.systemThroughput || 0, unit: "req/min" },
		{ label: "Support Tickets", value: metrics?.supportTicketVolume || 0, unit: "tickets" },
	];

	const performanceMetrics = [
		{ label: "Total Merchants", value: metrics?.totalMerchants?.toString() || "0", unit: "merchants", trend: "+5%" },
		{ label: "Error Rate", value: metrics?.errorRate?.toString() || "0", unit: "%", trend: "-2%" },
		{ label: "Uptime", value: metrics?.uptimePercentage?.toString() || "0", unit: "%", trend: "+0.5%" },
		{ label: "Support Response", value: metrics?.avgSupportResponseTime?.toString() || "0", unit: "mins", trend: "-10%" },
		{ label: "Merchant Approval", value: metrics?.merchantApprovalRate?.toString() || "0", unit: "%", trend: "+8%" },
		{ label: "Account Deletions", value: metrics?.totalAccountDeletion?.toString() || "0", unit: "accounts", trend: "-3%" },
	];

	// Calculate daily active users data
	const dailyActiveUsersData = [
		{ name: "Customers", value: metrics.dailyActiveUsers?.customers ?? 0 },
		{ name: "Merchant Staff", value: metrics.dailyActiveUsers?.merchantStaff ?? 0 },
		{ name: "Admins", value: metrics.dailyActiveUsers?.admins ?? 0 }
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
					<div className="text-6xl font-bold text-primary-light">{metrics?.uptimePercentage || 0}%</div>
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
						<ExportBtn data={metrics?.topMerchantsMonthly || []} filename="top-merchants" />
					</div>
					<div className="w-full h-[300px]">
						<BarChart
							data={metrics?.topMerchantsMonthly || []}
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
							data={dailyActiveUsersData} 
							filename="daily-active-users" 
						/>
					</div>
					<div className="w-full h-[300px]">
						<PieChart
							data={dailyActiveUsersData}
							nameKey="name"
							valueKey="value"
						/>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<NumberCard
					title="Total Users"
					value={metrics.totalUsers}
					icon={<Users className="w-6 h-6" />}
				/>
				<NumberCard
					title="Active Users"
					value={metrics.activeUsers}
					icon={<Activity className="w-6 h-6" />}
				/>
				<NumberCard
					title="Total Queues"
					value={metrics.totalQueues}
					icon={<AlertCircle className="w-6 h-6" />}
				/>
				<NumberCard
					title="Avg. Wait Time"
					value={metrics.averageWaitTime}
					icon={<Clock className="w-6 h-6" />}
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				<div className="bg-white p-6 rounded-lg shadow">
					<h3 className="text-lg font-semibold mb-4">User Growth</h3>
					<LineChart
						data={metrics.userGrowth}
						xKey="date"
						yKey="count"
					/>
				</div>
				<div className="bg-white p-6 rounded-lg shadow">
					<h3 className="text-lg font-semibold mb-4">Queue Usage by Category</h3>
					<PieChart
						data={metrics.queueUsage}
						nameKey="name"
						valueKey="value"
					/>
				</div>
			</div>

			<div className="bg-white p-6 rounded-lg shadow">
				<h3 className="text-lg font-semibold mb-4">Wait Time Distribution</h3>
				<BarChart
					data={metrics.waitTimeDistribution}
					xKey="range"
					yKey="count"
				/>
			</div>

			<div className="mt-6 flex justify-end">
				<ExportBtn 
					data={[
						{ metric: "Total Users", value: metrics.totalUsers },
						{ metric: "Active Users", value: metrics.activeUsers },
						{ metric: "Total Queues", value: metrics.totalQueues },
						{ metric: "Active Queues", value: metrics.activeQueues },
						{ metric: "Average Wait Time", value: metrics.averageWaitTime },
						{ metric: "Total Transactions", value: metrics.totalTransactions }
					]} 
					filename="metrics" 
				/>
			</div>
		</div>
	);
};

export default Metrics;