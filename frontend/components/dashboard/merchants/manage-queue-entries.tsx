"use client";

import Table, { type Column } from "@/components/common/table";
import Tag from "@/components/common/tag";
import NumberCard from "@/components/common/number-card";
import { UserCheck, Users } from "lucide-react";

const stats = [
	{ label: "Total Customer Served Today", value: 45 },
	{ label: "Total Queues", value: 4 },
	{ label: "Current Queue Volume", value: 7 },
];

const queueData = [
	{
		name: "A",
		status: "Online",
		createdAt: "2023-05-01 01:00",
		updatedAt: "2023-05-01 02:55",
		tags: ["3-4 Persons"],
		actions: "Online",
	},
	{
		name: "B",
		status: "Online",
		createdAt: "2023-05-01 02:30",
		updatedAt: "2023-05-01 02:55",
		tags: ["1-2 Persons"],
		actions: "Online",
	},
	{
		name: "Reserved",
		status: "Online",
		createdAt: "2023-05-01 02:30",
		updatedAt: "2023-05-01 02:55",
		tags: ["Reserved", "Express", "5-8 Persons"],
		actions: "Online",
	},
	{
		name: "C",
		status: "Offline",
		createdAt: "2023-05-01 02:30",
		updatedAt: "2023-05-01 02:30",
		tags: ["1-4 Persons"],
		actions: "Offline",
	},
];

const ManageQueueEntries = () => {

	/**
	 * Columns for the table
	 */
	const columns: Column<typeof queueData[0]>[] = [
		{ header: "Name", accessor: "name", priority: 3, sortable: true },
		{ header: "Status", accessor: "status", priority: 2, sortable: true },
		{ header: "Created At", accessor: "createdAt", priority: 2, sortable: true },
		{ header: "Updated At", accessor: "updatedAt", priority: 2, sortable: true },
		{
			header: "Tags",
			accessor: (row) => (
				<div className="flex flex-wrap gap-2">
					{row.tags.map((tag: string) => (
						<Tag key={tag} tagName={tag} />
					))}
				</div>
			),
			priority: 1,
			sortable: false,
		},
	];

	/**
	 * 
	 * @param row
	 * @returns 
	 */
	const renderActions = (row: typeof queueData[0]) => (
		<div className="flex gap-2">
			{row.status === "Online" ? (
				<button className="border px-3 py-1 rounded text-primary-light hover:bg-gray-100">Close</button>
			) : (
				<button className="border px-3 py-1 rounded text-primary-light hover:bg-gray-100">Open</button>
			)}
			<button className="border px-3 py-1 rounded text-primary-light hover:bg-gray-100">Edit</button>
			<button className="border px-3 py-1 rounded text-primary-light hover:bg-gray-100">Delete</button>
		</div>
	);

	return (
		<div className="font-regular-eng p-8 min-h-screen">
			<h1 className="text-3xl mb-8 text-primary-light font-bold">Manage Queue Entries</h1>
			<div className="flex flex-wrap gap-12 mb-8">
				
				{stats.map((stat) => (
					<NumberCard key={stat.label} title={stat.label} value={stat.value} icon={<Users size={32} className="text-primary-light" />} />
				))}
			</div>
			<div className="bg-white p-4 rounded-lg shadow-sm">
				<Table
					columns={columns}
					data={queueData}
					emptyMessage="No queues found"
				/>
			</div>
		</div>
	);
};

export default ManageQueueEntries;