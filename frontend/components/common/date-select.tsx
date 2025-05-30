"use client"

import React, { useCallback, useMemo } from "react"

export const MONTHS = [
	'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

export type Month = typeof MONTHS[number];

export const YEARS = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() + i).toString());

interface DateSelectProps<T extends string> {
	value: T;
	onChange: (value: T) => void;
	options: readonly T[];
	placeholder: string;
}

const Select = <T extends string>({ 
	value, 
	onChange, 
	options,
}: DateSelectProps<T>) => {
	const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		onChange(e.target.value as T);
	}, [onChange]);

	return (
		<select
			value={value}
			onChange={handleChange}
			className="border rounded px-2 py-1 text-xs outline-none border-primary-light text-primary-light cursor-pointer"
		>
			{options.map((option) => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
	);
};

interface DateRangeSelectProps {
	selectedYear: string;
	selectedMonth: Month | "";
	onYearChange: (year: string) => void;
	onMonthChange: (month: Month | "") => void;
	showMonthSelect?: boolean;
}

const DateRangeSelect = ({
	selectedYear,
	selectedMonth,
	onYearChange,
	onMonthChange,
	showMonthSelect = true
}: DateRangeSelectProps) => {
	return (
		<div className="flex items-center gap-2">
			<Select<string>
				value={selectedYear}
				onChange={onYearChange}
				options={YEARS}
				placeholder="Select Year"
			/>
			{showMonthSelect && (
				<Select<Month | "">
					value={selectedMonth}
					onChange={onMonthChange}
					options={["", ...MONTHS]}
					placeholder="Select Month"
				/>
			)}
		</div>
	);
};

export default DateRangeSelect;