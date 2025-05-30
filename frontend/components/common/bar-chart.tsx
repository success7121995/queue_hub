// components/BarChart.tsx
"use client";

import {
	BarChart as RechartsBarChart,
	Bar,
	XAxis,
	YAxis,
	ResponsiveContainer,
	Cell
} from "recharts";

interface BarChartProps<T> {
	data: T[];
	xAxisKey: keyof T;
	yAxisKey: keyof T;
	barKey: keyof T;
	fill?: {
		bar?: string;
		current?: string;
		label?: string;
	};
	customCell?: (entry: T & { isCurrentDay?: boolean }) => React.ReactNode;
}

const BarChart = <T extends Record<string, any>>({
	data,
	xAxisKey,
	yAxisKey,
	barKey,
	fill = {
		bar: "#FACC15",
		current: "#FD8733",
		label: "#0a0a0a"
	},
	customCell
}: BarChartProps<T>) => {
	// Get the current month
	const currentMonth = new Date().toLocaleString('default', { month: 'long' });
	// Get today's date
	const today = new Date().toLocaleDateString('en-US', { day: 'numeric' });
	// Get the max value of the bar chart
	const maxValue = Math.max(...data.map((entry) => Number(entry[barKey])));

	/**
	 * Custom label for the bar chart
	 * @param param0 
	 * @returns 
	 */
	const CustomLabel = ({ value, x, y, width, height }: any) => {
		return (
			<text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#0a0a0a;" fontSize={10} fontWeight="bold">
				{value}
			</text>
		);
	};


	return (
		<ResponsiveContainer width="100%" height={300}>
			<RechartsBarChart data={data}>
				<XAxis dataKey={xAxisKey as string} />
				<YAxis dataKey={yAxisKey as string} domain={[0, maxValue + 40]} />
				<Bar
					dataKey={barKey as string}
					label={<CustomLabel />}
					radius={[4, 4, 0, 0]}
					barSize={25}
				>
					{data.map((entry, index) => {
						if (customCell) {
							return customCell(entry);
						}
						const isCurrentMonth = entry[xAxisKey] === currentMonth;
						return (
							<Cell
								key={`cell-${index}`}
								fill={isCurrentMonth ? fill.current : fill.bar}
							/>
						);
					})}
				</Bar>
			</RechartsBarChart>
		</ResponsiveContainer>
	);
};

export default BarChart;
