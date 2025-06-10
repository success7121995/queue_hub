"use client";

import { useQuery } from "@tanstack/react-query";
import { Table } from "@/components";
import LoadingIndicator from "@/components/common/loading-indicator";
import { Column } from "@/components/common/table";
import { Merchant } from "@/types/merchant";
import Image from "next/image";
import { useDateTime } from "@/constant/datetime-provider";

const merchants: Merchant[] = [
	{
		merchantId: 1,
		logo: "",
		name: "Queue Burger",
		address: "123 Burger Street, Hong Kong",
		subscription: "Pro",
		subscriptionStartDate: "2024-01-01T00:00:00Z",
		subscriptionEndDate: "2025-01-01T00:00:00Z",
		registrationDate: "2023-12-15T12:00:00Z",
		createdAt: new Date("2023-12-15T12:00:00Z"),
		updatedAt: new Date("2024-06-01T14:30:00Z"),
		user: {
			id: 1,
			username: "queue.burger",
			email: "manager@queueburger.com",
			createdAt: new Date("2023-12-15T12:00:00Z"),
			updatedAt: new Date("2024-06-01T14:30:00Z"),
			profile: {
				id: 1,
				firstName: "John",
				lastName: "Doe",
				avatarUrl: "",
				position: "Manager",
				phone: "+852 1234 5678",
				address: "123 Burger Street, Hong Kong",
				createdAt: new Date("2023-12-15T12:00:00Z"),
				updatedAt: new Date("2024-06-01T14:30:00Z"),
			},
		},
	},
	{
		merchantId: 2,
		logo: "",
		name: "Noodle Palace",
		address: "88 Wan Chai Road, Hong Kong",
		subscription: "Free Trial",
		subscriptionStartDate: undefined,
		subscriptionEndDate: undefined,
		registrationDate: "2024-05-01T08:30:00Z",
		createdAt: new Date("2024-05-01T08:30:00Z"),
		updatedAt: new Date("2024-06-01T16:45:00Z"),
		user: {
			id: 2,
			username: "noodle.palace",
			email: "manager@noodlepalace.com",
			createdAt: new Date("2024-05-01T08:30:00Z"),
			updatedAt: new Date("2024-06-01T16:45:00Z"),
			profile: {
				id: 2,
				firstName: "Jane",
				lastName: "Smith",
				avatarUrl: "",
				position: "Manager",
				phone: "+852 2345 6789",
				address: "88 Wan Chai Road, Hong Kong",
				createdAt: new Date("2024-05-01T08:30:00Z"),
				updatedAt: new Date("2024-06-01T16:45:00Z"),
			},
		},
	},
	{
		merchantId: 3,
		logo: "",
		name: "Hotpot Heaven",
		address: "456 Mong Kok Avenue, Hong Kong",
		subscription: "Enterprise",
		subscriptionStartDate: "2023-11-15T00:00:00Z",
		subscriptionEndDate: "2024-11-15T00:00:00Z",
		registrationDate: "2023-11-10T10:00:00Z",
		createdAt: new Date("2023-11-10T10:00:00Z"),
		updatedAt: new Date("2024-05-28T09:15:00Z"),
		user: {
			id: 3,
			username: "hotpot.heaven",
			email: "manager@hotpotheaven.com",
			createdAt: new Date("2023-11-10T10:00:00Z"),
			updatedAt: new Date("2024-05-28T09:15:00Z"),
			profile: {
				id: 3,
				firstName: "Alice",
				lastName: "Wong",
				avatarUrl: "",
				position: "Manager",
				phone: "+852 3456 7890",
				address: "456 Mong Kok Avenue, Hong Kong",
				createdAt: new Date("2023-11-10T10:00:00Z"),
				updatedAt: new Date("2024-05-28T09:15:00Z"),
			},
		},
	},
];

const ViewMerchant = () => {
	const { formatDate } = useDateTime();

	const columns: Column<Merchant>[] = [
		{
			header: "Logo",
			accessor: (row) => row.logo ? <Image src={row.logo} alt="Logo" width={50} height={50} /> : "No logo",
		},
		{
			header: "Name",
			accessor: "name",
		},
		{
			header: "Manager",
			accessor: (row) => row.user?.profile ? `${row.user.profile.firstName || ''} ${row.user.profile.lastName || ''}`.trim() : 'N/A',
		},
		{
			header: "Email",
			accessor: (row) => row.user?.email || 'N/A',
		},
		{
			header: "Phone",
			accessor: (row) => row.user?.profile?.phone || 'N/A',
		},
		{
			header: "Address",
			accessor: "address",
		},
		{
			header: "Subscription",
			accessor: "subscription",
		},
		{
			header: "Subscription Start Date",
			accessor: (row) => row.subscriptionStartDate ? formatDate(new Date(row.subscriptionStartDate)) : "N/A",
		},
		{
			header: "Subscription End Date",
			accessor: (row) => row.subscriptionEndDate ? formatDate(new Date(row.subscriptionEndDate)) : "N/A",
		},
		{
			header: "Registration Date",
			accessor: (row) => row.registrationDate ? formatDate(new Date(row.registrationDate)) : "N/A",
		},
		{
			header: "Created At",
			accessor: (row) => row.createdAt ? formatDate(new Date(row.createdAt)) : "N/A",
		},
		{
			header: "Updated At",
			accessor: (row) => row.updatedAt ? formatDate(new Date(row.updatedAt)) : "N/A",
		},
		{
			header: "Actions",
			accessor: (row) => (
				<div className="flex gap-2">
					<button className="bg-primary-light text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">
						Delete
					</button>
				</div>
			),
		},
	];

	return (
		<div className="min-h-screen font-regular-eng p-8">
			{/* Header Section */}
			<h1 className="text-3xl mb-8 text-primary-light font-bold">View Merchants</h1>

			{/* Table */}
			<div className="w-full overflow-x-auto">
				<Table columns={columns} data={merchants} />
			</div>
		</div>
	);
};

export default ViewMerchant;