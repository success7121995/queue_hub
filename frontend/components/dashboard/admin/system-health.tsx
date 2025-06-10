"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, AlertCircle, CheckCircle, Clock, Database, Globe, Server, Shield } from "lucide-react";
import LoadingIndicator from "@/components/common/loading-indicator";
import ExportBtn from "@/components/common/export-btn";
import { LineChart } from "@/components/ui/charts";

interface SystemHealthData {
	uptime: number;
	cpuUsage: number;
	memoryUsage: number;
	diskUsage: number;
	networkLatency: number;
	activeConnections: number;
	errorRate: number;
	securityStatus: {
		lastScan: string;
		threats: number;
		vulnerabilities: number;
	};
	performanceHistory: Array<{
		timestamp: string;
		cpu: number;
		memory: number;
		disk: number;
		network: number;
	}>;
}

const SystemHealth = () => {
	const { data: healthData, isLoading } = useQuery<SystemHealthData>({
		queryKey: ['system-health'],
		queryFn: async () => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/system-health`, {
				credentials: 'include',
			});
			if (!res.ok) throw new Error('Failed to fetch system health data');
			return res.json();
		},
	});

	if (isLoading) {
		return <LoadingIndicator fullScreen />;
	}

	// Mock data for demo
	const mockData: SystemHealthData = {
		uptime: 99.99,
		cpuUsage: 45,
		memoryUsage: 62,
		diskUsage: 78,
		networkLatency: 120,
		activeConnections: 1250,
		errorRate: 0.05,
		securityStatus: {
			lastScan: "2024-03-15T10:00:00Z",
			threats: 0,
			vulnerabilities: 2,
		},
		performanceHistory: Array.from({ length: 24 }, (_, i) => ({
			timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
			cpu: Math.random() * 100,
			memory: Math.random() * 100,
			disk: Math.random() * 100,
			network: Math.random() * 200,
		})),
	};

	const data = healthData || mockData;

	const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
		if (value >= thresholds.critical) return "text-red-500";
		if (value >= thresholds.warning) return "text-yellow-500";
		return "text-green-500";
	};

	const metrics = [
		{
			label: "System Uptime",
			value: `${data.uptime}%`,
			icon: <Server className="w-6 h-6" />,
			status: getStatusColor(100 - data.uptime, { warning: 0.1, critical: 1 }),
		},
		{
			label: "CPU Usage",
			value: `${data.cpuUsage}%`,
			icon: <Activity className="w-6 h-6" />,
			status: getStatusColor(data.cpuUsage, { warning: 70, critical: 90 }),
		},
		{
			label: "Memory Usage",
			value: `${data.memoryUsage}%`,
			icon: <Database className="w-6 h-6" />,
			status: getStatusColor(data.memoryUsage, { warning: 75, critical: 90 }),
		},
		{
			label: "Disk Usage",
			value: `${data.diskUsage}%`,
			icon: <Database className="w-6 h-6" />,
			status: getStatusColor(data.diskUsage, { warning: 80, critical: 90 }),
		},
		{
			label: "Network Latency",
			value: `${data.networkLatency}ms`,
			icon: <Globe className="w-6 h-6" />,
			status: getStatusColor(data.networkLatency, { warning: 200, critical: 500 }),
		},
		{
			label: "Active Connections",
			value: data.activeConnections.toString(),
			icon: <Activity className="w-6 h-6" />,
			status: "text-primary-light",
		},
	];

	const securityMetrics = [
		{
			label: "Last Security Scan",
			value: new Date(data.securityStatus.lastScan).toLocaleString(),
			icon: <Shield className="w-6 h-6" />,
		},
		{
			label: "Active Threats",
			value: data.securityStatus.threats.toString(),
			icon: <AlertCircle className="w-6 h-6" />,
			status: data.securityStatus.threats > 0 ? "text-red-500" : "text-green-500",
		},
		{
			label: "Vulnerabilities",
			value: data.securityStatus.vulnerabilities.toString(),
			icon: <AlertCircle className="w-6 h-6" />,
			status: data.securityStatus.vulnerabilities > 0 ? "text-yellow-500" : "text-green-500",
		},
	];

	return (
		<div className="min-h-screen font-regular-eng p-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl text-primary-light font-bold">System Health</h1>
				<ExportBtn data={[data]} filename="system-health" />
			</div>

			{/* System Status Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
				{metrics.map((metric) => (
					<div key={metric.label} className="bg-white rounded-lg p-6 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary-light/10 rounded-lg">
									{metric.icon}
								</div>
								<h3 className="text-lg font-semibold text-gray-700">{metric.label}</h3>
							</div>
							<span className={`text-2xl font-bold ${metric.status}`}>{metric.value}</span>
						</div>
					</div>
				))}
			</div>

			{/* Security Status */}
			<div className="bg-white rounded-lg p-6 shadow-sm mb-8">
				<h2 className="text-xl font-bold text-primary-light mb-6">Security Status</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{securityMetrics.map((metric) => (
						<div key={metric.label} className="flex items-center gap-4">
							<div className="p-2 bg-primary-light/10 rounded-lg">
								{metric.icon}
							</div>
							<div>
								<div className="text-sm text-gray-600">{metric.label}</div>
								<div className={`text-lg font-semibold ${metric.status || "text-primary-light"}`}>
									{metric.value}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Performance History */}
			<div className="bg-white rounded-lg p-6 shadow-sm">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-bold text-primary-light">Performance History (24h)</h2>
					<ExportBtn data={data.performanceHistory} filename="performance-history" />
				</div>
				<div className="h-[400px]">
					<LineChart
						data={data.performanceHistory}
						xKey="timestamp"
						yKey="cpu"
						stroke="#00C49F"
					/>
				</div>
			</div>
		</div>
	);
};

export default SystemHealth; 