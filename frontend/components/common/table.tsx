"use client";

import { ReactNode, useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, Inbox } from "lucide-react";
import DateTimePicker from "./datetime-picker";
import LoadingIndicator from "./loading-indicator";

export interface Column<T> {
	header: string;
	accessor: keyof T | ((row: T) => ReactNode);
	className?: string;
	priority?: number; // Higher number = higher priority for mobile view
	sortable?: boolean; // Whether the column can be sorted
}

interface TableProps<T> {
	columns: Column<T>[];
	data: T[];
	actions?: (row: T) => ReactNode;
	rowsPerPage?: number;
	dateColumnKey?: keyof T | ((row: T) => Date | null | undefined);
	renderActions?: (row: T) => ReactNode;
	loading?: boolean;
	message?: string;
	getRowClassName?: (row: T) => string; // New prop for custom row styling
}

const Table = <T extends Record<string, any>>({ 
	columns, 
	data, 
	actions,
	rowsPerPage = 10,
	dateColumnKey,
	renderActions,
	loading = false,
	message = "No data available",
	getRowClassName,
}: TableProps<T>) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortConfig, setSortConfig] = useState<{ key: keyof T | ((row: T) => unknown); direction: 'asc' | 'desc' } | null>(null);
	const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
	const [isLoading, setIsLoading] = useState(loading);

	useEffect(() => {
		setIsLoading(loading);
	}, [loading]);

	/**
	 * Get value from accessor
	 * @param row - The row to get the value from
	 * @param accessor - The accessor to get the value from
	 * @returns The value from the accessor
	 */
	const getValueFromAccessor = (row: T, accessor: keyof T | ((row: T) => unknown)): unknown => {
		if (typeof accessor === 'function') {
			return accessor(row);
		}
		return row[accessor];
	};

	/**
	 * Stringify value for search
	 * @param value - The value to stringify
	 * @returns The stringified value
	 */
	const stringifyValue = (value: unknown): string => {
		if (value === null || value === undefined) return '';
		if (value instanceof Date) return value.toISOString();
		return String(value).toLowerCase();
	};

	/**
	 * Get the date from the row
	 * @param row - The row to get the date from
	 * @returns The date from the row
	 */
	const getRowDate = (row: T): Date | null => {
		if (!dateColumnKey) return null;
		if (typeof dateColumnKey === 'function') return dateColumnKey(row) ?? null;
		const key = dateColumnKey as string;

		// Support nested keys like 'queue.entries.0.leftAt'
		const val = key.split('.').reduce<any>((acc, k) => {
			if (acc == null) return undefined;
			if (/^\d+$/.test(k)) return acc[parseInt(k, 10)];
			return acc[k];
		}, row);
		if (typeof val === 'object' && val instanceof Date) return val;
		return null;
	};

	/**
	 * Filter and sort data
	 * @returns The filtered and sorted data
	 */
	const filteredData = useMemo(() => {
		let result = [...data];

		// Date filtering
		if (dateColumnKey && (dateRange.from || dateRange.to)) {
			result = result.filter(row => {
				const dateValue = getRowDate(row);

				if (!(dateValue instanceof Date)) return false;
				if (dateRange.from && dateValue < dateRange.from) return false;
				if (dateRange.to && dateValue > dateRange.to) return false;
				return true;
			});
		}

		// Search across all columns
		if (searchQuery) {
			const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
			
			result = result.filter(row => {
				return columns.some(column => {
					const value = getValueFromAccessor(row, column.accessor);
					const stringValue = stringifyValue(value);
					return searchTerms.every(term => stringValue.includes(term));
				});
			});
		}
		
		// Sort data
		if (sortConfig) {
			result.sort((a, b) => {
				const aValue = getValueFromAccessor(a, sortConfig.key);
				const bValue = getValueFromAccessor(b, sortConfig.key);

				if (aValue === bValue) return 0;
				if (aValue === null || aValue === undefined) return 1;
				if (bValue === null || bValue === undefined) return -1;

				// Handle Date objects
				if (aValue instanceof Date && bValue instanceof Date) {
					return sortConfig.direction === 'asc' 
						? aValue.getTime() - bValue.getTime()
						: bValue.getTime() - aValue.getTime();
				}

				// Handle other types
				const comparison = String(aValue) < String(bValue) ? -1 : 1;
				return sortConfig.direction === 'asc' ? comparison : -comparison;
			});
		}

		return result;
	}, [data, searchQuery, sortConfig, dateRange, dateColumnKey, columns]);

	const totalPages = Math.ceil(filteredData.length / rowsPerPage);
	const startIndex = (currentPage - 1) * rowsPerPage;
	const endIndex = startIndex + rowsPerPage;
	const currentData = filteredData.slice(startIndex, endIndex);

	/**
	 * Reset to first page when search or sort changes
	 */
	useMemo(() => {
		setCurrentPage(1);
	}, [searchQuery, sortConfig]);

	/**
	 * Handle page change
	 * @param page - The page to change to
	 */
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	/**
	 * Handle sort
	 * @param accessor - The accessor to sort by. Can be a keyof T or a function that returns a value
	 */
	const handleSort = (accessor: keyof T | ((row: T) => unknown)) => {
		setSortConfig(current => {
			if (!current || current.key !== accessor) {
				return { key: accessor, direction: 'asc' };
			}
			return current.direction === 'asc' 
				? { key: accessor, direction: 'desc' }
				: null;
		});
	};

	/**
	 * Handle search
	 * @param value - The value to search for
	 */
	const handleSearch = (value: string) => {
		setSearchQuery(value);
		setCurrentPage(1);
	};

	/**
	 * Render date filter
	 * @returns Date filter component
	 */
	const renderDateFilter = () => {
		if (!dateColumnKey) return null;
		return (
			<div className="flex flex-col gap-2">
				<div className="flex flex-col md:flex-row gap-4">
					<DateTimePicker
						value={[dateRange.from, dateRange.to]}
						onChange={([from, to]) => setDateRange({ from, to })}
						usePortal
					/>
				</div>
				{(dateRange.from || dateRange.to) && (
					<button
						onClick={() => setDateRange({ from: null, to: null })}
						className="text-sm text-primary hover:text-primary-dark transition-colors self-start cursor-pointer"
					>
						Clear Date Filter
					</button>
				)}
			</div>
		);
	};

	/**
	 * Render search
	 * @returns Search component
	 */
	const renderSearch = () => (
		<div className="w-full md:w-auto">
			<div className="relative w-full">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Search className="h-5 w-5 text-gray-400" />
				</div>
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => handleSearch(e.target.value)}
					placeholder="Search..."
					className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
				/>
			</div>
		</div>
	);

    /**
     * Sort columns by priority for mobile view
     * @returns Sorted columns
     */
	const sortedColumns = [...columns].sort((a, b) => (b.priority || 0) - (a.priority || 0));

    /**
     * Render pagination
     * @returns Pagination component
     */
	const renderPagination = () => {
		const pageNumbers: number[] = [];
		const maxVisiblePages = 5;
		let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
		if (endPage - startPage + 1 < maxVisiblePages) {
			startPage = Math.max(1, endPage - maxVisiblePages + 1);
		}
		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(i);
		}
		return (
			<div className="flex items-center justify-between px-4 py-3 bg-transparent m:px-6 overflow-x-hidden">
				<div className="flex justify-between flex-1 sm:hidden">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Previous
					</button>
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Next
					</button>
				</div>
				<div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
					<div>
						<p className="text-sm text-gray-700">
							Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
							<span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{" "}
							<span className="font-medium">{filteredData.length}</span> results
						</p>
					</div>
					<div>
						<nav className="inline-flex gap-2" aria-label="Pagination">
							<button
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
								className="inline-flex items-center px-3 py-1 rounded-full border border-gray-300 bg-white text-gray-400 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<span className="sr-only">Previous</span>
								<ChevronLeft className="w-5 h-5" aria-hidden="true" />
							</button>
							{pageNumbers.map((page) => (
								<button
									key={page}
									onClick={() => handlePageChange(page)}
									className={`inline-flex items-center px-4 py-1 rounded-full border text-sm font-medium transition-colors ${
										currentPage === page
											? "bg-primary text-white border-primary"
											: "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
									}`}
								>
									{page}
								</button>
							))}
							<button
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								className="inline-flex items-center px-3 py-1 rounded-full border border-gray-300 bg-white text-gray-400 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<span className="sr-only">Next</span>
								<ChevronRight className="w-5 h-5" aria-hidden="true" />
							</button>
						</nav>
					</div>
				</div>
			</div>
		);
	};

	const renderEmptyState = () => {
		if (filteredData.length > 0) return null;
		return (
			<div className="flex flex-col items-center justify-center py-8 text-gray-500">
				<Inbox size={48} className="mb-4" />
				<p>{message}</p>
			</div>
		);
	};

	if (isLoading) {
		return <LoadingIndicator fullScreen={true} size="lg" />;
	}

	return (
		<div className="flex flex-col w-full">
			{/* Redesigned Filter/Search Bar */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 p-4 rounded-xl shadow-sm">
				{dateColumnKey && renderDateFilter()}
				{renderSearch()}
			</div>
			
			{filteredData.length === 0 ? (
				renderEmptyState()
			) : (
				<div className="w-full overflow-x-auto">
					<div className="min-w-full inline-block align-middle">
						<div className="overflow-hidden rounded-xl border border-gray-200">
							<table className="min-w-full divide-y divide-gray-200">
								{/* Table Header */}
								<thead className="sticky top-0 z-10 bg-gradient-to-r from-primary-light/10 to-white shadow-sm">
									<tr>
										{sortedColumns.map((column, index) => (
											<th 
											key={index} 
											className={`px-6 py-4 text-left text-sm font-bold text-primary-light tracking-wider whitespace-nowrap ${
												index === 0 ? 'rounded-tl-xl' : ''
											}${index === sortedColumns.length - 1 && !actions ? 'rounded-tr-xl' : ''}`}
										>
											{column.sortable !== false ? (
												<button
													onClick={() => handleSort(column.accessor)}
													className="flex items-center gap-1 hover:bg-primary-light/20 px-2 py-1 rounded-md transition-colors cursor-pointer"
												>
													{column.header}
													<ArrowUpDown className="w-4 h-4" />
													{sortConfig?.key === column.accessor && (
														<span className="text-xs">
															({sortConfig.direction === 'asc' ? '↑' : '↓'})
														</span>
													)}
												</button>
											) : (
												column.header
											)}
										</th>
									))}
									{actions && (
										<th className="sticky right-0 px-6 py-4 text-left text-base font-bold text-primary-light tracking-wider rounded-tr-xl bg-gradient-to-r from-primary-light/10 to-white"></th>
									)}
								</tr>
								</thead>
								{/* Table Body */}
								<tbody className="bg-white divide-y divide-gray-100">
									{currentData.map((row, rowIndex) => (
										<tr key={rowIndex} className={`hover:bg-primary-light/10 transition-colors group ${getRowClassName ? getRowClassName(row) : ''}`}>
											{sortedColumns.map((column, colIndex) => (
												<td 
												key={colIndex} 
												className={`px-6 py-4 whitespace-nowrap text-sm text-text-main ${
													colIndex === 0 ? 'rounded-bl-xl group-hover:bg-primary-light/20' : ''
												}${colIndex === sortedColumns.length - 1 && !actions ? 'rounded-br-xl group-hover:bg-primary-light/20' : ''}
												}`}
											>
												{typeof column.accessor === 'function' 
													? column.accessor(row)
													: row[column.accessor]
												}
											</td>
										))}
											{renderActions && (
											<td className={`sticky right-0 px-6 py-4 whitespace-nowrap text-sm rounded-br-xl ${getRowClassName ? getRowClassName(row) : 'bg-white'}`}>
												{renderActions(row)}
											</td>
										)}
									</tr>
								))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}
			{filteredData.length > 0 && renderPagination()}
		</div>
	);
};

export default Table;   