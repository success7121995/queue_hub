import {
	LineChart as RechartsLineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart as RechartsBarChart,
	Bar,
	PieChart as RechartsPieChart,
	Pie,
	Cell,
	Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartProps {
	data: any[];
	className?: string;
}

interface LineChartProps extends ChartProps {
	xKey: string;
	yKey: string;
	stroke?: string;
}

interface BarChartProps extends ChartProps {
	xKey: string;
	yKey: string;
	fill?: string;
}

interface PieChartProps extends ChartProps {
	nameKey: string;
	valueKey: string;
	colors?: string[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function LineChart({ data, xKey, yKey, stroke = "#8884d8", className }: LineChartProps) {
	return (
		<div className={cn("h-[300px] w-full", className)}>
			<ResponsiveContainer width="100%" height="100%">
				<RechartsLineChart
					data={data}
					margin={{
						top: 5,
						right: 30,
						left: 20,
						bottom: 5,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey={xKey} />
					<YAxis />
					<Tooltip />
					<Line
						type="monotone"
						dataKey={yKey}
						stroke={stroke}
						activeDot={{ r: 8 }}
					/>
				</RechartsLineChart>
			</ResponsiveContainer>
		</div>
	);
}

export function BarChart({ data, xKey, yKey, fill = "#8884d8", className }: BarChartProps) {
	return (
		<div className={cn("h-[300px] w-full", className)}>
			<ResponsiveContainer width="100%" height="100%">
				<RechartsBarChart
					data={data}
					margin={{
						top: 5,
						right: 30,
						left: 20,
						bottom: 5,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey={xKey} />
					<YAxis />
					<Tooltip />
					<Bar dataKey={yKey} fill={fill} />
				</RechartsBarChart>
			</ResponsiveContainer>
		</div>
	);
}

export function PieChart({ data, nameKey, valueKey, colors = COLORS, className }: PieChartProps) {
	return (
		<div className={cn("h-[300px] w-full", className)}>
			<ResponsiveContainer width="100%" height="100%">
				<RechartsPieChart>
					<Pie
						data={data}
						dataKey={valueKey}
						nameKey={nameKey}
						cx="50%"
						cy="50%"
						outerRadius={80}
						label
					>
						{data.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
						))}
					</Pie>
					<Tooltip />
					<Legend />
				</RechartsPieChart>
			</ResponsiveContainer>
		</div>
	);
} 