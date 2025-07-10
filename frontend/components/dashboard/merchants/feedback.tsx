"use client";

import Table, { type Column } from "@/components/common/table";
import { type Review } from "@/types/review";
import { RatingStar } from "@/components";


const columns: Column<Review>[] = [
	{
		header: "User",
		accessor: (row) => row.user.username,
	},
	{
		header: "Rating",
		accessor: (row) => <RatingStar rating={row.rating} />,
	},
	{
		header: "Feedbacl",
		accessor: (row) => row.comment ?? "--",
	},
	{
		header: "Created At",
		accessor: (row) => row.createdAt.toLocaleString(),
	},
	{
		header: "Reply",
		accessor: (row) =>  (
			<div className="flex flex-col gap-2">
				{ row.replies && row.replies?.length === 0 ? (
					<p>--</p>
				) : (
					<p>{row.replies?.[0]?.comment}</p>
				)}
			</div>
		),
	},
	{
		header: 'Replied At',
		accessor: (row) => row.replies?.[0]?.createdAt?.toLocaleString() ?? "--",
	}
]

const feedback: Review[] = [
	{
		id: 1,
		user: {
			user_id: "1",
			username: "john.doe",
			email: "john.doe@example.com",
			fname: "John",
			lname: "Doe",
			phone: "1234567890",
			role: "CUSTOMER",
			status: "ACTIVE",
		},
		merchant: {
			merchant_id: '111',
			business_name: "John Doe Business",
			phone: "1234567890",
			email: "business@example.com",
			description: "A sample business",
			subscription_status: "TRIAL",
			subscription_start: "2025-01-01",
			subscription_end: "2025-12-31",
			auto_renewal: false,
			approved_at: "2025-01-01",
			approval_status: "APPROVED",
			created_at: "2025-01-01",
			updated_at: "2025-01-01",
			user: {
				user_id: "1",
				username: "john.doe",
				email: "john.doe@example.com",
				fname: "John",
				lname: "Doe",
				phone: "1234567890",
				role: "MERCHANT",
				status: "ACTIVE",
			},
		},
		rating: 5,
		createdAt: new Date('2025-05-29'),
		updatedAt: new Date('2025-05-29'),
		comment: "This is a comment",
		replies: [
			{
				id: 1,
				comment: "This is a reply",
				createdAt: new Date('2025-05-29'),
				updatedAt: new Date('2025-05-29'),
			}
		]
	},
	{
		id: 2,
		user: {
			user_id: "2",
			username: "john.doe",
			email: "john.doe@example.com",
			fname: "John",
			lname: "Doe",
			phone: "1234567890",
			role: "CUSTOMER",
			status: "ACTIVE",
		},
		merchant: {
			merchant_id: '111',
			business_name: "John Doe Business",
			phone: "1234567890",
			email: "business@example.com",
			description: "A sample business",
			subscription_status: "TRIAL",
			subscription_start: "2025-01-01",
			subscription_end: "2025-12-31",
			auto_renewal: false,
			approved_at: "2025-01-01",
			approval_status: "APPROVED",
			created_at: "2025-01-01",
			updated_at: "2025-01-01",
			user: {
				user_id: "1",
				username: "john.doe",
				email: "john.doe@example.com",
				fname: "John",
				lname: "Doe",
				phone: "1234567890",
				role: "MERCHANT",
				status: "ACTIVE",
			},
		},
		rating: 4.3,
		createdAt: new Date('2025-05-29'),
		updatedAt: new Date('2025-05-29'),
		replies: []
	}
]



const Feedback = () => {
	return (
		<div className="min-h-screen px-8 py-8 font-regular-eng">
			<h1 className="text-3xl mb-8 text-primary-light font-bold">Feedback</h1>
			<Table
				columns={columns}
				data={feedback}
				dateColumnKey={(row) => new Date(row.createdAt)}
			/>
		</div>
	);
};

export default Feedback;