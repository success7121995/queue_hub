"use client";

import { useState, useCallback, useMemo } from "react";
import { BarChart, ExportBtn } from "@/components";
import DateRangeSelect, { MONTHS, Month } from "@/components/common/date-select";
import NumberCard from "@/components/common/number-card";
import { Cell } from "recharts";
import { Users, Clock } from "lucide-react";

// Add type definitions at the top of the file
type DailyData = {
	[year: string]: {
		[month: string]: {
			[day: string]: number;
		};
	};
};

type DailyServedTimeData = DailyData[];

const Analytics = () => {
	const currentYear = new Date().getFullYear().toString();

	const [selectedYear, setSelectedYear] = useState<string>(currentYear);

	const summaryData = [
		{ label: "Queue Solved", value: 150 },
		{ label: "Average Wait Time", value: 13.5, unit: "mins" },
		{ label: "No Show Count", value: 12 },
		{ label: "Queue Volume", value: 10 },
		{ label: "New Customers Count", value: 10 },
		{ label: "Returning Customer Count", value: 12 },
	];
	
	const monthlyServedTimeData = [
		{ name: "Jan", value: 120 },
		{ name: "Feb", value: 90 },
		{ name: "Mar", value: 100 },
		{ name: "Apr", value: 110 },
		{ name: "May", value: 130 },
		{ name: "Jun", value: 180 },
		{ name: "Jul", value: 95 },
		{ name: "Aug", value: 140 },
		{ name: "Sep", value: 70 },
		{ name: "Oct", value: 80 },
		{ name: "Nov", value: 100 },
		{ name: "Dec", value: 120 }
	];
	
	const dailyServedTimeData: DailyServedTimeData = [
		{ '2025': {
			'Jan': {
				'1': 120,
				'2': 90,
				'3': 100,
				'4': 110,
				'5': 130,
				'6': 180,
				'7': 95,
				'8': 140,
				'9': 70,
				'10': 80,
				'11': 100,
				'12': 120,
				'13': 120,
				'14': 90,
				'15': 100,
				'16': 110,
				'17': 130,
				'18': 180,
				'19': 95,
				'20': 140,
				'21': 70,
				'22': 80,
				'23': 100,
				'24': 120,
				'25': 120,
				'26': 90,
				'27': 100,
				'28': 110,
				'29': 130,
				'30': 180,
				'31': 95
			}
		}}
	];
	
	const branchesPerformanceData = [
		{ name: "Jan", value: 100 },
		{ name: "Feb", value: 80 },
		{ name: "Mar", value: 120 },
		{ name: "Apr", value: 110 },
		{ name: "May", value: 130 },
		{ name: "Jun", value: 180 },
		{ name: "Jul", value: 90 },
		{ name: "Aug", value: 140 },
		{ name: "Sep", value: 60 },
		{ name: "Oct", value: 80 },
		{ name: "Nov", value: 100 },
		{ name: "Dec", value: 120 },
	];
	
	const queuePerformance = [
		{ label: "Total Queue Solved", value: "220", unit: "queues", trend: "+12%" },
		{ label: "Average Wait Time", value: "13.5", unit: "mins", trend: "-5%" },
		{ label: "Average Queue Length", value: "8.2", unit: "customers", trend: "-3%" },
		{ label: "No Show Rate", value: "13", unit: "%", trend: "-2%" },
		{ label: "Average Service Duration", value: "50", unit: "mins", trend: "+8%" },
		{ label: "New Customer Count", value: "150", unit: "customers", trend: "+15%" },
		{ label: "Customer Return Rate", value: "75", unit: "%", trend: "+5%" },
		{ label: "Queue Abandon Rate", value: "12", unit: "%", trend: "-4%" },
	];
	
	const feedbackPerformance = [
		{ label: "Total Feedback Count", value: "1,250", unit: "responses", trend: "+20%" },
		{ label: "Average Rating", value: "4.5", unit: "/5", trend: "+0.2" },
		{ label: "Positive Response Rate", value: "80", unit: "%", trend: "+5%" },
		{ label: "Feedback Response Rate", value: "70", unit: "%", trend: "+8%" },
		{ label: "Customer Satisfaction", value: "85", unit: "%", trend: "+3%" },
		{ label: "Service Quality Score", value: "4.3", unit: "/5", trend: "+0.1" },
	];
	
	// Utility function to get days in month
	const getDaysInMonth = (year: number, month: number) => {
		return new Date(year, month + 1, 0).getDate();
	};
	
	// Update the dummy data generator to use typed years
	const generateDummyData = () => {
		const currentYear = new Date().getFullYear();
		const years = [currentYear - 1, currentYear, currentYear + 1] as const;
		const data: Record<string, Record<string, Record<string, number>>> = {};
	
		years.forEach(year => {
			data[year.toString()] = {};
			MONTHS.forEach(month => {
				data[year.toString()][month] = {};
				const daysInMonth = getDaysInMonth(year, MONTHS.indexOf(month));
				for (let day = 1; day <= daysInMonth; day++) {
					data[year.toString()][month][day.toString()] = Math.floor(Math.random() * 100) + 50;
				}
			});
		});
	
		return {
			data,
			years: years.map(y => y.toString())
		};
	};
	
	const { data: dummyData, years: availableYears } = generateDummyData();
	
	const branches = [
		{ id: "all", name: "All Branches" },
		{ id: "branch1", name: "Central Branch" },
		{ id: "branch2", name: "North Branch" },
		{ id: "branch3", name: "South Branch" },
		{ id: "branch4", name: "East Branch" },
		{ id: "branch5", name: "West Branch" },
	];

	const [selectedBranch, setSelectedBranch] = useState(branches[0].id);

	/**
	 * CurrentDataSummary component
	 * @returns The CurrentDataSummary component
	 */
	const CurrentDataSummary = ({ 
		title = "Branch Performance",
		showBranchSelect = false,
		selectedBranchId = "all",
		onBranchChange = () => {},
		customData = null,
		customYearData = null,
		customMonthData = null,
	}: {
		title?: string;
		showBranchSelect?: boolean;
		selectedBranchId?: string;
		onBranchChange?: (branchId: string) => void;
		customData?: Record<string, Record<string, Record<string, number>>> | null;
		customYearData?: any[] | null;
		customMonthData?: any[] | null;
	}) => {
		const currentYear = new Date().getFullYear().toString();
		const currentMonth = MONTHS[new Date().getMonth()];
		const currentDay = new Date().getDate().toString();
		
		const [selectedYearView, setSelectedYearView] = useState<string>(currentYear);
		const [selectedMonthView, setSelectedMonthView] = useState<Month>(currentMonth);
		const [selectedYearForMonth, setSelectedYearForMonth] = useState<string>(currentYear);
		
		/**
		 * Handles the year change for the annual overview
		 * @param year - The selected year
		 */
		const handleYearViewChange = useCallback((year: string) => {
			setSelectedYearView(year);
		}, []);
	
		/**
		 * Handles the month change for the annual overview
		 * @param month - The selected month
		 */
		const handleMonthViewChange = useCallback((month: Month | "") => {
			if (month) {
				setSelectedMonthView(month);
			}
		}, []);

		/**
		 * Handles the year change for the monthly overview
		 * @param year - The selected year
		 */
		const handleYearForMonthChange = useCallback((year: string) => {
			setSelectedYearForMonth(year);
		}, []);
	
		const currentYearData = useMemo(() => {
			if (customYearData) return customYearData;
			const yearData = (customData || dummyData)[selectedYearView] || {};
			return MONTHS.map(m => ({
				name: m,
				value: Object.values(yearData[m] || {}).reduce((sum, val) => sum + val, 0)
			}));
		}, [selectedYearView, customData, customYearData, dummyData]);
	
		const currentMonthData = useMemo(() => {
			if (customMonthData) return customMonthData;
			const monthData = (customData || dummyData)[selectedYearForMonth]?.[selectedMonthView] || {};
			return Object.entries(monthData).map(([day, value]) => ({
				name: day,
				value,
				isCurrentDay: selectedYearForMonth === currentYear && 
					selectedMonthView === currentMonth && 
					day === currentDay
			}));
		}, [selectedYearForMonth, selectedMonthView, currentYear, currentMonth, currentDay, customData, customMonthData, dummyData]);
	
		return (
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
				<div className="bg-white rounded-lg p-8 shadow-sm">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary-light/10 rounded-lg">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
								</svg>
							</div>
							<h3 className="text-xl text-primary-light font-bold">{title}</h3>
						</div>
						<div className="flex items-center gap-4">
							{showBranchSelect && (
								<select
									value={selectedBranchId}
									onChange={(e) => onBranchChange(e.target.value)}
									className="border rounded px-2 py-1 text-xs outline-none border-primary-light/30 text-primary-light cursor-pointer"
								>
									{branches.map(branch => (
										<option key={branch.id} value={branch.id}>
											{branch.name}
										</option>
									))}
								</select>
							)}
							<ExportBtn data={currentYearData} filename={`${title.toLowerCase().replace(/\s+/g, '-')}-year-data`} />
						</div>
					</div>

					<div className="flex items-center justify-between mb-4">
						<DateRangeSelect
							selectedYear={selectedYearView}
							selectedMonth=""
							onYearChange={handleYearViewChange}
							onMonthChange={() => {}}
							showMonthSelect={false}
						/>
					</div>
					<div className="w-full">
						<BarChart
							data={currentYearData}
							xAxisKey="name"
							yAxisKey="value"
							barKey="value"
							fill={{
								bar: "#FACC15",
								label: "#0a0a0a",
								current: "#FD8733"
							}}
						/>
					</div>
				</div>
				<div className="bg-white rounded-lg p-8 shadow-sm">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary-light/10 rounded-lg">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<h3 className="text-xl text-primary-light font-bold">Monthly Details</h3>
						</div>
						<div className="flex items-center gap-4">
							{showBranchSelect && (
									<select
										value={selectedBranchId}
										onChange={(e) => onBranchChange(e.target.value)}
										className="border rounded px-2 py-1 text-xs outline-none border-primary-light/30 text-primary-light cursor-pointer"
									>
										{branches.map(branch => (
											<option key={branch.id} value={branch.id}>
												{branch.name}
											</option>
										))}
									</select>
								)}
							<ExportBtn data={currentMonthData} filename={`${title.toLowerCase().replace(/\s+/g, '-')}-month-data`} />
						</div>
					</div>

					<div className="flex items-center justify-between mb-4">
						<DateRangeSelect
							selectedYear={selectedYearForMonth}
							selectedMonth={selectedMonthView}
							onYearChange={handleYearForMonthChange}
							onMonthChange={handleMonthViewChange}
						/>
					</div>

					<div className="w-full">
						<BarChart
							data={currentMonthData}
							xAxisKey="name"
							yAxisKey="value"
							barKey="value"
							fill={{
								bar: "#FACC15",
								label: "#0a0a0a",
								current: "#FD8733"
							}}
							customCell={(entry) => (
								<Cell
									key={`cell-${entry.name}`}
									fill={entry.isCurrentDay ? "#FD8733" : "#FACC15"}
								/>
							)}
						/>
					</div>
				</div>
			</div>
		);
	};

	/**
	 * Performance Cards component
	 * @returns The Performance Cards component
	 */
	const performanceCards = () => {
		return (
			<div className="grid grid-cols-2 gap-8 mb-12">
				<div className="bg-gray-100 rounded-lg p-4">
					<div className="flex items-center justify-between mb-2">
						<div className="flex gap-2">
							<input type="date" className="border rounded px-2 py-1 text-xs" placeholder="From" />
							<span className="text-xs">To</span>
							<input type="date" className="border rounded px-2 py-1 text-xs" placeholder="To" />
						</div>
						<ExportBtn data={queuePerformance} filename="queue-performance" />
					</div>
					<div className="text-xs">
						{queuePerformance.map(item => (
							<div key={item.label} className="flex justify-between mb-1">
								<span>{item.label}</span>
								<span>{item.value}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	};
	
	/**
	 * Transforms the data to a format that can be used by the BarChart component
	 * @param data - The data to transform
	 * @param selectedYear - The selected year
	 * @param selectedMonth - The selected month
	 * @returns The transformed data
	 */
	const useTransformedData = (data: Record<string, Record<string, Record<string, number>>>, selectedYear: string, selectedMonth: string | null) => {
		return useMemo(() => {
			if (!selectedYear) return [];
	
			const yearData = data[selectedYear];
			if (!yearData) return [];
	
			if (!selectedMonth) {
				return MONTHS.map(month => ({
					name: month,
					value: Object.values(yearData[month] || {}).reduce((sum, val) => sum + val, 0)
				}));
			}
	
			const monthData = yearData[selectedMonth] || {};
			return Object.entries(monthData).map(([day, value]) => ({
				name: day,
				value
			}));
		}, [data, selectedYear, selectedMonth]);
	}

	return (
		<div className="p-8 min-h-screen font-regular-eng">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-3xl mb-8 text-primary-light font-bold">Analytics</h1>
			</div>

			{/* Summary Cards */}
			<div>
				<ExportBtn data={summaryData} filename="summary-data" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:w-[70%] lg:w-[80%]">

					{summaryData.map((item, idx) => (
						<NumberCard key={item.label} title={item.label} value={Number(item.value)} unit={item.unit} icon={<Users size={32} className="text-primary-light" />} />
					))}
				</div>
			</div>

			{/* Total Service Time */}
			<div className="flex items-center bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-5 shadow-sm w-fit pr-40 mx-auto min-h-[100px] my-15">
				<div className={`flex items-center justify-center w-20 h-20 rounded-full bg-orange-200 mr-4`}>
					<Clock size={60} className="text-primary-light" />
				</div>
				
				<div>
					<div className="text-6xl font-bold text-primary-light">{11234}</div>
					<div className="text-base font-semibold text-primary-light mt-1">Total Queues Served</div>
				</div>
        	</div>

			
			{/* Current Data Summary */}
			<CurrentDataSummary />

			{/* Performance Cards */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
				{/* Queue Performance */}
				<div className="bg-white rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary-light/10 rounded-lg">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-bold text-primary-light">Queue Performance</h3>
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
							<ExportBtn data={queuePerformance} filename="queue-performance" />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						{queuePerformance.map(item => (
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

				{/* Feedback Performance */}
				<div className="bg-white rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary-light/10 rounded-lg">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
								</svg>
							</div>
							<h3 className="text-xl font-bold text-primary-light">Customer Feedback</h3>
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
							<ExportBtn data={feedbackPerformance} filename="feedback-performance" />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						{feedbackPerformance.map(item => (
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
			</div>

			{/* Branches Performance Section */}
			<CurrentDataSummary 
				title="Branch Performance"
				showBranchSelect={true}
				selectedBranchId={selectedBranch}
				onBranchChange={(branchId) => setSelectedBranch(branchId)}
				customData={selectedBranch === "all" ? dummyData : {
					[selectedYear]: {
						...dummyData[selectedYear],
						// Here you would normally filter/transform data based on selected branch
						// For now, we're just using the dummy data
					}
				}}
			/>
		</div>
	);
};

export default Analytics;