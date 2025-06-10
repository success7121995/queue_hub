"use client";

import { useState } from "react";
import { Table } from "@/components";
import { Column } from "@/components/common/table";
import { Merchant } from "@/types/merchant";
import Image from "next/image";
import { useDateTime } from "@/constant/datetime-provider";
import { X, CheckCircle, XCircle } from "lucide-react";

const merchants: Merchant[] = [
	{
		merchantId: 1,
		name: "Queue Burger",
		address: "123 Burger Street, Hong Kong",
		subscription: "GROWTH",
		subscriptionStartDate: "2024-01-01T00:00:00Z",
		subscriptionEndDate: "2025-01-01T00:00:00Z",
		createdAt: new Date("2023-12-15T12:00:00Z"),
		updatedAt: new Date("2024-06-01T14:30:00Z"),
		logo: "",
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
];

const ApproveMerchant = () => {
	const { formatDate } = useDateTime();
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState("");
	const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
	const [reasonTouched, setReasonTouched] = useState(false);

	const handleRejectClick = (merchant: Merchant) => {
		setSelectedMerchant(merchant);
		setRejectReason("");
		setReasonTouched(false);
		setRejectModalOpen(true);
	};

	const handleRejectConfirm = () => {
		if (!rejectReason.trim()) {
			setReasonTouched(true);
			return;
		}
		// TODO: Handle rejection logic here (API call, etc.)
		setRejectModalOpen(false);
		setSelectedMerchant(null);
		setRejectReason("");
		setReasonTouched(false);
		// Optionally show a toast/notification
	};

	const handleRejectCancel = () => {
		setRejectModalOpen(false);
		setSelectedMerchant(null);
		setRejectReason("");
		setReasonTouched(false);
	};

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
			header: "Created At",
			accessor: (row) => formatDate(row.createdAt),
		},
		{
			header: "Actions",
			accessor: (row) => (
				<div className="flex gap-2">
					<button
						className="flex items-center gap-1 bg-primary-light hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light/50"
						title="Approve"
					>
						<CheckCircle className="w-4 h-4" /> Approve
					</button>
					<button
						className="flex items-center gap-1 bg-white border border-primary-light text-primary-light hover:bg-primary-light hover:text-white px-4 py-2 rounded-full text-sm font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light/50"
						title="Reject"
						onClick={() => handleRejectClick(row)}
					>
						<XCircle className="w-4 h-4" /> Reject
					</button>
				</div>
			),
		},
	];

	return (
		<div className="min-h-screen font-regular-eng p-8">
			{/* Header Section */}
			<h1 className="text-3xl mb-8 text-primary-light font-bold">Approve Merchants</h1>

			{/* Table */}
			<div className="w-full overflow-x-auto">
				<Table columns={columns} data={merchants} />
			</div>

			{/* Reject Modal */}
			{rejectModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[340px] relative border-2 border-primary-light animate-fade-in">
						<button
							className="absolute top-3 right-3 text-gray-400 hover:text-primary-light text-2xl font-bold"
							onClick={handleRejectCancel}
							aria-label="Close"
						>
							<X />
						</button>
						<div className="flex flex-col items-center">
							<XCircle className="w-12 h-12 text-primary-light mb-2" />
							<h2 className="text-xl font-bold text-primary-light mb-2">Reject Merchant</h2>
							<p className="text-gray-700 mb-4 text-center">Please provide a reason for rejection. This is required and will be sent to the merchant.</p>
							<textarea
								className={`w-full min-h-[80px] border rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-primary-light/30 ${reasonTouched && !rejectReason.trim() ? 'border-red-500' : 'border-gray-200'}`}
								placeholder="Enter rejection reason..."
								value={rejectReason}
								onChange={e => setRejectReason(e.target.value)}
								onBlur={() => setReasonTouched(true)}
								required
							/>
							{reasonTouched && !rejectReason.trim() && (
								<span className="text-red-500 text-xs mb-2">Reason is required.</span>
							)}
							<div className="flex gap-4 mt-2">
								<button
									className="flex items-center gap-1 bg-white border border-primary-light text-primary-light hover:bg-primary-light hover:text-white px-4 py-2 rounded-full text-sm font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light/50"
									onClick={handleRejectCancel}
								>
									Cancel
								</button>
								<button
									className={`flex items-center gap-1 bg-primary-light hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light/50 ${!rejectReason.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
									onClick={handleRejectConfirm}
									disabled={!rejectReason.trim()}
								>
									<XCircle className="w-4 h-4" /> Confirm Reject
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ApproveMerchant;