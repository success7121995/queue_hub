"use client";

import Table, { type Column } from "@/components/common/table";
import { type Queue } from "@/types/queue";
import { type User } from "@/types/user";
import Image from "next/image";

interface QueueHistoryProps {
	user: User;
	queue: Queue;
}

const columns: Column<QueueHistoryProps>[] = [
	{
		header: "Customer Name",
		accessor: (row) => `${row.user.profile?.firstName} ${row.user.profile?.lastName}`,
		sortable: true,
	},
	{
		header: "Username",
		accessor: (row) => (
			<div className="flex items-center gap-2">
				{row.user.profile?.avatarUrl && (
					<Image src={row.user.profile?.avatarUrl} alt="avatar" width={32} height={32} />
				)}
				<span>{row.user.username}</span>
			</div>
		),
		sortable: true,
	},
	{
		header: "Email",
		accessor: (row) => row.user.email,
		sortable: true,
	},
	{
		header: "Phone",
		accessor: (row) => row.user.profile?.phone,
		sortable: true,
	},
	{
		header: "Queue Name",
		accessor: (row) => row.queue.name,
		sortable: true,
	},
	{
		header: "Queue Number",
		accessor: (row) => row.queue.entries?.[0]?.id,
		sortable: true,
	},
	{
		header: "Joined At",
		accessor: (row) => row.queue.entries?.[0]?.joinedAt.toLocaleString(),
		sortable: true,
	},
	{
		header: "Completed At",
		accessor: (row) => row.queue.entries?.[0]?.leftAt?.toLocaleString(),
		sortable: true,
	},
	{
		header: "Status",
		accessor: (row) => row.queue.entries?.[0]?.status,
		sortable: true,
	}
];

const queueHistory: QueueHistoryProps[] = [
	{
		user: {
			id: 1,
			username: "John Doe",
			email: "john.doe@example.com",
				createdAt: new Date("2021-01-01"),
			updatedAt: new Date("2021-01-01"),
			profile: {
				id: 1,
				firstName: "John",
				lastName: "Doe",
				createdAt: new Date("2021-01-01"),
				updatedAt: new Date("2021-01-01"),
			},
			settings: [
				{
					id: 1,
					key: "queue_history",
					value: "queue_history",
					createdAt: new Date("2021-01-01"),
					updatedAt: new Date("2021-01-01"),
				},
			],
		},
		queue: {
			id: 1,
			name: "Queue 1",
			description: "Queue 1",
			status: "active",
			createdAt: new Date("2021-01-01"),
			updatedAt: new Date("2021-01-01"),
			entries: [
				{
					id: 1,
					userId: 1,
					status: "served",
					joinedAt: new Date("2025-05-29T10:00:00"),
					leftAt: new Date("2025-05-29T12:12:00"),
				},
			],
		}
	}
];

const ViewQueueHistory = () => {
	return (
		<div className="min-h-screen px-8 py-8 font-regular-eng">
			<h1 className="text-3xl mb-8 text-primary-light font-bold">View Queue History</h1>

			<div className="bg-white p-4 rounded-lg shadow-sm">
				<Table
					columns={columns}
					data={queueHistory}
					dateColumnKey={(row) => row.queue.entries?.[0]?.leftAt}
				/>
			</div>
		</div>
	);
};

export default ViewQueueHistory;