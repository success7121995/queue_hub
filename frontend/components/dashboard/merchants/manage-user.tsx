"use client";

import { useState } from "react";
import Table, { type Column } from "@/components/common/table";
import type { User } from "@/types/user";
import { Edit2, Trash2 } from "lucide-react";
import { useDateTime } from "@/constant/datetime-provider";

// Mock data - replace with actual API call
const mockEmployees: User[] = [
	{
		id: 1,
		username: "john.doe",
		email: "john.doe@example.com",
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-01"),
		profile: {
			id: 1,
			firstName: "John",
			lastName: "Doe",
			position: "Manager",
			phone: "+1234567890",
			address: "123 Main St",
			createdAt: new Date("2024-01-01"),
			updatedAt: new Date("2024-01-01"),
		}
	},
	{
		id: 2,
		username: "jane.smith",
		email: "jane.smith@example.com",
		createdAt: new Date("2024-01-15"),
		updatedAt: new Date("2024-01-15"),
		profile: {
			id: 2,
			firstName: "Jane",
			lastName: "Smith",
			position: "Cashier",
			phone: "+1987654321",
			address: "456 Oak St",
			createdAt: new Date("2024-01-15"),
			updatedAt: new Date("2024-01-15"),
		}
	}
];

const ManageUsers = () => {
	const [employees, setEmployees] = useState<User[]>(mockEmployees);
	const { formatDate } = useDateTime();
	
	const columns: Column<User>[] = [
		{
			header: "Name",
			accessor: (row) => `${row.profile?.firstName || ''} ${row.profile?.lastName || ''}`.trim() || 'N/A',
			sortable: true,
		},
		{
			header: "Username",
			accessor: "username",
			sortable: true,
		},
		{
			header: "Email",
			accessor: "email",
			sortable: true,
		},
		{
			header: "Position",
			accessor: (row) => row.profile?.position || 'N/A',
			sortable: true,
		},
		{
			header: "Phone",
			accessor: (row) => row.profile?.phone || 'N/A',
			sortable: true,
		},
		{
			header: "Joined Date",
			accessor: (row) => formatDate(row.createdAt),
			sortable: true,
		},
		{
			header: "Actions",
			accessor: (row) => renderActions(row),
			sortable: false,
		}
	];

	const handleEdit = (employee: User) => {
		// TODO: Implement edit functionality
	};

	const handleDelete = (employee: User) => {
		// TODO: Implement delete functionality
		console.log('Delete employee:', employee);
	};

	const renderActions = (employee: User) => (
		<div className="flex items-center gap-2">
			<button
				onClick={() => handleEdit(employee)}
				className="p-1 hover:bg-primary-light/20 rounded-full transition-colors"
				title="Edit"
			>
				<Edit2 className="w-4 h-4 text-primary-light" />
			</button>
			<button
				onClick={() => handleDelete(employee)}
				className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
				title="Delete"
			>
				<Trash2 className="w-4 h-4 text-red-500" />
			</button>
		</div>
	);

	return (
		<div className="min-h-screen font-regular-eng p-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl text-primary-light font-bold">Manage Employees</h1>
				<button
					className="bg-primary-light text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
					onClick={() => {/* TODO: Implement add employee */}}
				>
					Add Employee
				</button>
			</div>

			<Table
				columns={columns}
				data={employees}
			/>
		</div>
	);
};

export default ManageUsers;