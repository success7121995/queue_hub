"use client";

import { useState, useEffect, useRef } from "react";
import { MoreVertical, UserCircle, Edit, Trash2, Users, UserCheck, AlertTriangle } from "lucide-react";
import Table, { type Column } from "@/components/common/table";
import Tag from "@/components/common/tag";
import NumberCard from "@/components/common/number-card";
import { useDateTime } from "@/constant/datetime-provider";
import { connectSocket, disconnectSocket, onQueueStatusChange } from "@/lib/socket";
import { useViewQueuesByBranch } from "@/hooks/merchant-hook";
import { useAuth } from "@/hooks/auth-hooks";
import { useQueryClient } from "@tanstack/react-query";

const mockStats = {
	servedToday: 45,
	queueVolume: 7,
};

const inQueue = [
	{ id: 'A13', label: "A",  number: 13},
	{ id: 'A14', label: "A", number: 14 },
	{ id: 'B15', label: "B", number: 15 },
	{ id: 'Reserved16', label: "Reserved", number: 16 },
	{ id: 'B17', label: "B", number: 17 },
	{ id: 'B18', label: "B", number: 18 },
	{ id: 'A19', label: "A", number: 19 },
];

const noShow = [
	{ id: 'A20', label: "A", number: 20 },
	{ id: 'A21', label: "A", number: 21 },
	{ id: 'A22', label: "A", number: 22 },
	{ id: 'A23', label: "A", number: 23 },
];

const completed = [
	{
		name: "A",
		number: 10,
		joinedAt: new Date("2025-03-01 15:00"),
		completedAt: new Date("2025-03-01 15:20"),
		serveTime: "00:20",
		servedBy: "Chan Tai Ming",
	},
];
const abandon = [
	{
		name: "A",
		number: 1,
		joinedAt: new Date("2025-03-01 15:00"),
		abandonAt: new Date("2025-03-01 15:20"),
		abandonedBy: "Chan Tai Ming",
	},
];

const queueMenuOptions = ["Call", "Serve", "Recall", "Abandon"];

const ViewLiveQueues = () => {
	const queryClient = useQueryClient();
	const [menuOpen, setMenuOpen] = useState<string | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const { formatDate } = useDateTime();
	const { data: currentUser } = useAuth();
	const { data: queuesData, isLoading: isLoadingQueue, refetch } = useViewQueuesByBranch();

	// Connect to socket and listen for queue status changes
	useEffect(() => {
		if (!currentUser?.user?.branchId) return;

		connectSocket();

		// Register callback for queue status changes
		const unregister = onQueueStatusChange(({ queueId, status }) => {
			// Optimistically update the UI
			queryClient.setQueryData(['queues', currentUser.user.branchId], (oldData: any) => {
				if (!oldData) return oldData;
				return oldData.map((queue: any) => 
					queue.queue_id === queueId 
						? { ...queue, queue_status: status }
						: queue
				);
			});

			refetch();
		});

		return () => {
			unregister();
			disconnectSocket();
		};
	}, [currentUser?.user?.branchId, refetch, queryClient]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuOpen(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const formatTimeFromMinutes = (minutes: number | null | undefined) => {
		if (minutes === null || minutes === undefined || isNaN(minutes)) {
			return 'N/A';
		}
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
	};

	const activeQueuesColumns: Column<typeof queuesData[0]>[] = [
		{ 
			header: "Name", 
			accessor: "queue_name",
			priority: 3,
			sortable: true
		},
		{ 
			header: "Status", 
			accessor: (row) => (
				<div className="flex items-center gap-2">
					<div className={`w-2 h-2 rounded-full ${
						row.queue_status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'
					}`} />
					<span>{row.queue_status}</span>
				</div>
			),
			priority: 2,
			sortable: true
		},
		{ 
			header: "Current Queue Volume", 
			accessor: "queue_volume",
			priority: 1,
			sortable: true
		},
		{ 
			header: "Average Wait Time", 
			accessor: (row) => formatTimeFromMinutes(row.avg_wait_time),
			priority: 1,
			sortable: true
		},
		{ 
			header: "Serving Time", 
			accessor: (row) => formatTimeFromMinutes(row.serving_time),
			priority: 1,
			sortable: true
		},
		{ 
			header: "Tags", 
			accessor: (row) => (
				<div className="flex flex-wrap gap-2">
					{row.tags.map((tag: { tag_id: string; tag_name: string }) => (
						<Tag key={tag.tag_id} tagName={tag.tag_name} />
					))}
				</div>
			),
			priority: 2,
			sortable: false
		}
	];

	const completedColumns: Column<typeof completed[0]>[] = [
		{ 
			header: "Name", 
			accessor: "name",
			priority: 2,
			sortable: true
		},
		{ 
			header: "Number", 
			accessor: "number",
			priority: 2,
			sortable: true
		},
		{ 
			header: "Joined At", 
			accessor: (row) => formatDate(row.joinedAt),
			priority: 1,
			sortable: true
		},
		{ 
			header: "Completed At", 
			accessor: (row) => formatDate(row.completedAt),
			priority: 1,
			sortable: true
		},
		{ 
			header: "Serve Time", 
			accessor: "serveTime",
			priority: 1,
			sortable: true
		},
		{
			header: "Served By",
			accessor: (row) => (
				<div className="flex items-center gap-2">
					<UserCircle size={22} className="text-gray-400" />
					<span>{row.servedBy}</span>
				</div>
			),
			priority: 2,
			sortable: true
		}
	];

	const abandonColumns: Column<typeof abandon[0]>[] = [
		{ 
			header: "Name", 
			accessor: "name",
			priority: 2,
			sortable: true
		},
		{ 
			header: "Number", 
			accessor: "number",
			priority: 2,
			sortable: true
		},
		{ 
			header: "Joined At", 
			accessor: (row) => formatDate(row.joinedAt),
			priority: 1,
			sortable: true
		},
		{ 
			header: "Abandon At", 
			accessor: (row) => formatDate(row.abandonAt),
			priority: 1,
			sortable: true
		},
		{
			header: "Abandoned By",
			accessor: (row) => (
				<div className="flex items-center gap-2">
					<UserCircle size={22} className="text-gray-400" />
					<span>{row.abandonedBy}</span>
				</div>
			),
			priority: 2,
			sortable: true
		}
	];

	/**
	 * Render actions
	 * @param row - The row data
	 * @returns The actions
	 */
	const renderActions = (row: typeof queuesData[0]) => (
		<div className="flex flex-col gap-2">

			<button className="px-4 py-1 border border-primary-light hover:bg-primary-light/20 rounded-[10px] text-primary-light cursor-pointer">Call Next</button>
			<button className="px-4 py-1 border border-primary-light hover:bg-primary-light/20 rounded-[10px] text-primary-light cursor-pointer">Recall</button>
			<button className="px-4 py-1 border border-primary-light hover:bg-primary-light/20 rounded-[10px] text-primary-light cursor-pointer">Serve</button>
			<button className="px-4 py-1 border border-primary-light hover:bg-primary-light/20 rounded-[10px] text-primary-light cursor-pointer">No Show</button>
		</div>
	);

	return (
		<div className="font-regular-eng p-8">
			{/* Header Section */}
			<h1 className="text-3xl mb-8 text-primary-light font-bold">View Live Queues</h1>

			{/* Redesigned Number Cards */}
			<div className="flex flex-wrap gap-8 mb-8">
				<NumberCard title="Total Served Today" value={mockStats.servedToday} icon={<UserCheck size={32} className="text-primary-light" />} />
				<NumberCard title="Current Queue Volume" value={mockStats.queueVolume} icon={<Users size={32} className="text-primary-light" />} />
			</div>

			{/* Redesigned In Queue & No Show */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mx-auto mb-12">
				{/* In Queue */}
				<div>
					<h3 className="text-xl mb-4 text-primary-light font-bold flex items-center gap-2">
						<Users size={20} className="text-primary-light" /> In Queue
					</h3>
					<div className="flex flex-wrap gap-4">
						{inQueue.map((q) => (
							<div key={q.id} className="relative flex flex-col items-center border-2 border-primary-light bg-white rounded-xl px-6 py-4 shadow-sm min-w-[90px] min-h-[90px]">
								<div className="absolute top-2 right-2">
									<button
										className="p-1 hover:bg-primary-light/20 rounded-full text-primary-light"
										onClick={() => setMenuOpen(menuOpen === q.id ? null : q.id)}
									>
										<MoreVertical size={18} />
									</button>
									{menuOpen === q.id && (
										<div className="absolute right-0 top-8 bg-white rounded-lg border border-gray-200 shadow px-4 py-2 z-10 min-w-[120px]">
											{queueMenuOptions.map((opt) => (
												<div key={opt} className="py-1 cursor-pointer hover:bg-gray-100">{opt}</div>
											))}
										</div>
									)}
								</div>
								<div className="text-2xl font-bold text-primary-light mb-1">{q.label}{q.number}</div>
								<div className="text-xs text-primary-light font-semibold">In Queue</div>
							</div>
						))}
					</div>
				</div>

				{/* No Show */}
				<div>
					<h3 className="text-xl mb-4 text-primary-light font-bold flex items-center gap-2">
						<AlertTriangle size={20} className="text-orange-500" /> No Show
					</h3>
					<div className="flex flex-wrap gap-4">
						{noShow.map((q) => (
							<div key={q.id} className="relative flex flex-col items-center border-2 border-orange-400 bg-white rounded-xl px-6 py-4 shadow-sm min-w-[90px] min-h-[90px]">
								<div className="absolute top-2 right-2">
									<button
										className="p-1 hover:bg-orange-100 rounded-full text-orange-500"
										onClick={() => setMenuOpen(menuOpen === q.id ? null : q.id)}
									>
										<MoreVertical size={18} />
									</button>
									{menuOpen === q.id && (
										<div className="absolute right-0 top-8 bg-white border rounded-lg shadow px-4 py-2 z-10 min-w-[120px]">
											{queueMenuOptions.map((opt) => (
												<div key={opt} className="py-1 cursor-pointer hover:bg-gray-100">{opt}</div>
											))}
										</div>
									)}
								</div>
								<div className="text-2xl font-bold text-orange-600 mb-1">{q.label}{q.number}</div>
								<div className="text-xs text-orange-500 font-semibold">No Show</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Tables Section */}
			<div className="space-y-12">
				{/* Active Queues */}
				<div className="bg-white rounded-lg p-8 shadow-sm">
					<div className="text-xl mb-2 text-primary-light font-bold">Active Queues</div>
					{isLoadingQueue ? (
						<div className="flex justify-center items-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
						</div>
					) : (
						<Table
							columns={activeQueuesColumns}
							data={queuesData || []}
							renderActions={renderActions}
						/>
					)}
				</div>

				{/* Completed */}
				<div className="bg-white rounded-lg p-8 shadow-sm">
					<div className="text-xl mb-2 text-primary-light font-bold">Completed</div>
					<Table
						columns={completedColumns}
						data={completed}
					/>
				</div>

				{/* Abandon */}
				<div className="bg-white rounded-lg p-8 shadow-sm">
					<div className="text-xl mb-2 text-primary-light font-bold">Abandon</div>
					<Table
						columns={abandonColumns}
						data={abandon}
					/>
				</div>
			</div>
		</div>
	);
};

export default ViewLiveQueues;