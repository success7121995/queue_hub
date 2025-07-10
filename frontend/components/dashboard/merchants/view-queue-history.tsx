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
		accessor: (row) => `${row.user.fname} ${row.user.lname}`,
		sortable: true,
	},
	{
		header: "Username",
		accessor: (row) => (
			<div className="flex items-center gap-2">
				{row.user?.Avatar && (
					<Image src={row.user.Avatar.image_url} alt="avatar" width={32} height={32} />
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
		accessor: (row) => row.user.phone,
		sortable: true,
	},
	{
		header: "Queue Name",
		accessor: (row) => row.queue.queue_name,
		sortable: true,
	},
	{
		header: "Queue Number",
		accessor: (row) => row.queue.number,
		sortable: true,
	},
	{
		header: "Joined At",
		accessor: (row) => row.queue.entries?.[0]?.joined_at?.toLocaleString(),
		sortable: true,
	},
	{
		header: "Completed At",
		accessor: (row) => row.queue.entries?.[0]?.left_at?.toLocaleString(),
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
			user_id: 'as',
			username: "John Doe",
			email: "john.doe@example.com",
			fname: "John",
			lname: "Doe",
			role: "CUSTOMER",
			status: "ACTIVE",
			Avatar: {
				image_url: "https://via.placeholder.com/150",
			},
			phone: "1234567890",
		},
		queue: {
			queue_name: "Queue 1",
			number: 1,
			queue_status: "OPEN",	
			created_at: "2025-05-29T10:00:00",
			updated_at: "2025-05-29T12:12:00",
			entries: [
				{
					id: 1,
					userId: 1,
					status: "SERVED",
					joined_at: new Date("2025-05-29T10:00:00"),
					left_at: new Date("2025-05-29T12:12:00"),
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
					dateColumnKey={(row) => row.queue.entries?.[0]?.left_at}
				/>
			</div>
		</div>
	);
};

export default ViewQueueHistory;