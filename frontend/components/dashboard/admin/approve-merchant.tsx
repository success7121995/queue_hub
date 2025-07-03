"use client";

import { useState, useEffect } from "react";
import { Table, LoadingIndicator } from "@/components";
import { Column } from "@/components/common/table";
import { useAdminGetMerchants, useAdminApproveMerchant } from "@/hooks/admin-hooks";
import Image from "next/image";
import { useDateTime } from "@/constant/datetime-provider";
import { X, CheckCircle, XCircle } from "lucide-react";
import { Merchant } from "@/types/merchant";

const ApproveMerchant = () => {
	const { formatDate } = useDateTime();
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState("");
	const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
	const [reasonTouched, setReasonTouched] = useState(false);
	const [pendingMerchants, setPendingMerchants] = useState<any[]>([]);
	const [rejectedMerchants, setRejectedMerchants] = useState<any[]>([]);
	
	const { data: merchantsData, isLoading: isLoadingMerchants } = useAdminGetMerchants({
		approval_status: ["PENDING", "REJECTED"],
	});

	const approveMerchantMutation = useAdminApproveMerchant();


	let merchants: any[] = [];
	if (merchantsData?.result && typeof merchantsData.result === 'object' && 'merchants' in merchantsData.result && Array.isArray(merchantsData.result.merchants)) {
		merchants = merchantsData.result.merchants;
	} else if (Array.isArray(merchantsData?.result)) {
		merchants = merchantsData.result;
	}

	// Initialize local state arrays when merchants data changes (only on initial load or refetch)
	useEffect(() => {
		if (merchants.length > 0) {
			const pending = merchants.filter(merchant => merchant.merchant.approval_status === "PENDING");
			const rejected = merchants.filter(merchant => merchant.merchant.approval_status === "REJECTED");
			
			setPendingMerchants(pending);
			setRejectedMerchants(rejected);
		}
	}, [merchantsData]); // Only depend on merchantsData, not merchants array

	/**
	 * Handle approve merchant
	 * @param merchant - The merchant to approve
	 */
	const handleApproveClick = (merchant: any) => {
		approveMerchantMutation.mutate({
			merchant_id: merchant.merchant.merchant_id,
			approval_status: 'APPROVED'
		}, {
			onSuccess: () => {
				// Remove from pending list immediately
				setPendingMerchants(prev => prev.filter(m => m.merchant.merchant_id !== merchant.merchant.merchant_id));
			},
			onError: (error) => {
				console.error('Error approving merchant:', error);
			}
		});
	};

	/**
	 * Handle reject merchant
	 * @param merchant - The merchant to reject
	 */
	const handleRejectClick = (merchant: any) => {
		setSelectedMerchant(merchant);
		setRejectReason("");
		setReasonTouched(false);
		setRejectModalOpen(true);
	};

	/**
	 * Handle reject merchant
	 * @param merchant - The merchant to reject
	 */
	const handleRejectConfirm = () => {
		if (!rejectReason.trim()) {
			setReasonTouched(true);
			return;
		}
		
		if (selectedMerchant) {
			approveMerchantMutation.mutate({
				merchant_id: selectedMerchant.merchant.merchant_id,
				approval_status: 'REJECTED',
				reason: rejectReason.trim()
			}, {
				onSuccess: () => {
					// Remove from pending list and add to rejected list immediately
					setPendingMerchants(prev => prev.filter(m => m.merchant.merchant_id !== selectedMerchant.merchant.merchant_id));
					setRejectedMerchants(prev => [...prev, selectedMerchant]);
				},
				onError: (error) => {
					console.error('Error rejecting merchant:', error);
				}
			});
		}
		
		setRejectModalOpen(false);
		setSelectedMerchant(null);
		setRejectReason("");
		setReasonTouched(false);
	};

	/**
	 * Handle reject cancel
	 */
	const handleRejectCancel = () => {
		setRejectModalOpen(false);
		setSelectedMerchant(null);
		setRejectReason("");
		setReasonTouched(false);
	};

	/**
	 * Render the component
	 */
	if (isLoadingMerchants) {
		return (
			<div className="flex justify-center items-center h-full">
				<LoadingIndicator text="Loading merchants..." />
			</div>
		)
	}

	/**
	 * Render the columns
	 */
	const columns: Column<any>[] = [
		{
			header: "Logo",
			accessor: (row) => row.merchant?.Logo?.logo_url
				? <Image src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${row.merchant.Logo.logo_url}`} alt="Logo" width={50} height={50} />
				: "No logo",
		},
		{
			header: "Name",
			accessor: (row) => row.merchant?.business_name || '',
		},
		{
			header: "Manager",
			accessor: (row) => row.contactPerson ? `${row.contactPerson.fname} ${row.contactPerson.lname}` : 'N/A',
		},
		{
			header: "Email",
			accessor: (row) => row.contactPerson?.email || 'N/A',
		},
		{
			header: "Phone",
			accessor: (row) => row.merchant?.phone || 'N/A',
		},
		{
			header: "Address",
			accessor: (row) => row.merchant?.Address ? `${row.merchant.Address.street}, ${row.merchant.Address.city}` : 'N/A',
		},
		{
			header: "Subscription",
			accessor: (row) => row.merchant?.subscription_status,
		},
		{
			header: "Created At",
			accessor: (row) => row.merchant?.created_at ? formatDate(row.merchant.created_at) : '',
		},
		{
			header: "Actions",
			accessor: (row) => (
				<div className="flex gap-2">
					<button
						className={`flex items-center gap-1 bg-primary-light hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light/50 ${approveMerchantMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
						title="Approve"
						onClick={() => handleApproveClick(row)}
						disabled={approveMerchantMutation.isPending}
					>
						<CheckCircle className="w-4 h-4" /> {approveMerchantMutation.isPending ? 'Approving...' : 'Approve'}
					</button>
					<button
						className={`flex items-center gap-1 bg-white border border-primary-light text-primary-light hover:bg-primary-light hover:text-white px-4 py-2 rounded-full text-sm font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light/50 ${approveMerchantMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
						title="Reject"
						onClick={() => handleRejectClick(row)}
						disabled={approveMerchantMutation.isPending}
					>
						<XCircle className="w-4 h-4" /> Reject
					</button>
				</div>
			),
		},
	];

	/**
	 * Render the component
	 */
	return (
		<div className="min-h-screen font-regular-eng p-8">
			{/* Header Section */}
			<h1 className="text-3xl mb-8 text-primary-light font-bold">Approve Merchants</h1>

			{/* Pending Table */}
			<div className="w-full overflow-x-auto">
				<h2 className="text-2xl font-bold text-primary-light mb-4">Pending Merchants ({pendingMerchants.length})</h2>
				{pendingMerchants.length > 0 ? (
					<Table columns={columns} data={pendingMerchants} />
				) : (
					<div className="text-center py-8 text-gray-500">No pending merchants to approve</div>
				)}
			</div>

			{/* Rejected Table */}
			<div className="w-full overflow-x-auto mt-20">
				<h2 className="text-2xl font-bold text-primary-light mb-4">Rejected Merchants ({rejectedMerchants.length})</h2>
				{rejectedMerchants.length > 0 ? (
					<Table
						columns={columns}
						data={rejectedMerchants}
					/>
				) : (
					<div className="text-center py-8 text-gray-500">No rejected merchants</div>
				)}
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
									disabled={approveMerchantMutation.isPending}
								>
									Cancel
								</button>
								<button
									className={`flex items-center gap-1 bg-primary-light hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light/50 ${(!rejectReason.trim() || approveMerchantMutation.isPending) ? 'opacity-50 cursor-not-allowed' : ''}`}
									onClick={handleRejectConfirm}
									disabled={!rejectReason.trim() || approveMerchantMutation.isPending}
								>
									<XCircle className="w-4 h-4" /> {approveMerchantMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
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