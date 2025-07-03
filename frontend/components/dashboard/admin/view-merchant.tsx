"use client";

import React from "react";
import { useAdminGetMerchants, useAdminUpdateMerchant, useAdminDeleteMerchant } from "@/hooks/admin-hooks";
import { Table, DateTimePicker } from "@/components";
import LoadingIndicator from "@/components/common/loading-indicator";
import { Column } from "@/components/common/table";
import { Merchant } from "@/types/merchant";
import Image from "next/image";
import { useDateTime } from "@/constant/datetime-provider";
import { useAuth } from "@/hooks/auth-hooks";
import { useState } from "react";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2, X, Landmark } from "lucide-react";
import { type Plan } from "@/types/form";	

const subscriptionOptions: { value: Plan, label: string }[] = [
	{ value: 'TRIAL', label: 'Trial' },
	{ value: 'ESSENTIAL', label: 'Essential' },
	{ value: 'GROWTH', label: 'Growth' },
	{ value: 'CANCELLED', label: 'Cancelled' },
	{ value: 'EXPIRED', label: 'Expired' },
];

const EditMerchantModal = ({ isOpen, onClose, merchant, onSave, isLoading }: {
	isOpen: boolean;
	onClose: () => void;
	merchant: Merchant | null;
	onSave: (status: string, dates: [Date | null, Date | null]) => void;
	isLoading: boolean;
}) => {
	const [subscriptionStatus, setSubscriptionStatus] = useState(merchant?.subscription_status || '');
	const [subscriptionDates, setSubscriptionDates] = useState<[Date | null, Date | null]>([
		merchant?.subscription_start ? new Date(merchant.subscription_start) : null,
		merchant?.subscription_end ? new Date(merchant.subscription_end) : null,
	]);

	// Update local state if merchant changes
	React.useEffect(() => {
		setSubscriptionStatus(merchant?.subscription_status || '');
		setSubscriptionDates([
			merchant?.subscription_start ? new Date(merchant.subscription_start) : null,
			merchant?.subscription_end ? new Date(merchant.subscription_end) : null,
		]);
	}, [merchant]);

	if (!isOpen || !merchant) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
				>
					<X className="w-5 h-5" />
				</button>
				<div className="flex flex-col items-center mb-4">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
						<Landmark className="w-8 h-8 text-primary-light" />
					</div>
					{/* <h2 className="text-xl font-bold text-primary-light mb-2">Edit Merchant</h2> */}
					<div className="text-gray-700 font-semibold">{merchant.business_name}</div>
				</div>
				<form
					onSubmit={e => {
						e.preventDefault();
						onSave(subscriptionStatus, subscriptionDates);
					}}
				>
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">Subscription Period</label>
						<DateTimePicker
							value={subscriptionDates}
							onChange={setSubscriptionDates}
							usePortal
						/>
					</div>
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">Subscription Status</label>
						<select
							value={subscriptionStatus}
							onChange={e => setSubscriptionStatus(e.target.value)}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-light focus:border-primary-light"
						>
							{subscriptionOptions.map(opt => (
								<option key={opt.value} value={opt.value}>{opt.label}</option>
							))}
						</select>
					</div>
					<div className="flex justify-end gap-3 mt-6">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
							disabled={isLoading}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isLoading}
							className="px-4 py-2 bg-primary-light text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
						>
							{isLoading ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

const ViewMerchant = () => {
	const { formatDate } = useDateTime();
	const { data: userData } = useAuth();
	const adminRole = userData?.user?.UserAdmin?.role;
	const { data: merchantsData, isLoading, error } = useAdminGetMerchants({
		approval_status: 'APPROVED',
	});

	const queryClient = useQueryClient();

	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editLoading, setEditLoading] = useState(false);

	let merchants: any[] = [];
	if (merchantsData?.result && typeof merchantsData.result === 'object' && 'merchants' in merchantsData.result && Array.isArray(merchantsData.result.merchants)) {
		merchants = merchantsData.result.merchants;
	} else if (Array.isArray(merchantsData?.result)) {
		merchants = merchantsData.result;
	}

	const { mutate: updateMerchant, isPending: updatePending } = useAdminUpdateMerchant({
		onMutate: async ({ merchant_id, data }) => {
			await queryClient.cancelQueries({ queryKey: ["admin", "merchants", {}] });
			const previousMerchants = queryClient.getQueryData(["admin", "merchants", {}]);
			
			queryClient.setQueryData(["admin", "merchants", {}], (old: any) => {
				if (!old || !old.result || !Array.isArray(old.result)) return old;
				return {
					...old,
					result: old.result.map((item: any) => 
						item.merchant.merchant_id === merchant_id 
							? { ...item, merchant: { ...item.merchant, ...data } }
							: item
					)
				};
			});
			
			return { previousMerchants };
		},
		onError: (err, variables, context) => {
			if ((context as any)?.previousMerchants) {
				queryClient.setQueryData(["admin", "merchants", {}], (context as any).previousMerchants);
			}
		},
		onSuccess: () => {
			setEditModalOpen(false);
			setSelectedMerchant(null);
		},
	});

	const { mutate: deleteMerchant, isPending: deletePending } = useAdminDeleteMerchant({
		onMutate: async ({ merchant_id }) => {
			await queryClient.cancelQueries({ queryKey: ["admin", "merchants", {}] });
			const previousMerchants = queryClient.getQueryData(["admin", "merchants", {}]);
			
			queryClient.setQueryData(["admin", "merchants", {}], (old: any) => {
				if (!old || !old.result || !Array.isArray(old.result)) return old;
				return {
					...old,
					result: old.result.filter((item: any) => item.merchant.merchant_id !== merchant_id)
				};
			});
			
			return { previousMerchants };
		},
		onError: (err, variables, context) => {
			if ((context as any)?.previousMerchants) {
				queryClient.setQueryData(["admin", "merchants", {}], (context as any).previousMerchants);
			}
		},
		onSuccess: () => {
			setDeleteModalOpen(false);
			setSelectedMerchant(null);
		},
	});

	// Actions
	const handleEdit = (row: any) => {
		setSelectedMerchant(row.merchant);
		setEditModalOpen(true);
	};

	const handleDelete = (row: any) => {
		setSelectedMerchant(row.merchant);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = () => {
		if (selectedMerchant) {
			deleteMerchant({ merchant_id: selectedMerchant.merchant_id });
		}
	};

	const handleSaveEdit = (status: string, dates: [Date | null, Date | null]) => {
		if (!selectedMerchant) return;
		const [start, end] = dates;
		updateMerchant({
			merchant_id: selectedMerchant.merchant_id,
			data: {
				subscription_status: status as Plan,
				subscription_start: start ? start.toISOString() : undefined,
				subscription_end: end ? end.toISOString() : undefined,
			},
		});
	};

	const canDelete = adminRole === 'SUPER_ADMIN' || adminRole === 'OPS_ADMIN';

	const columns: Column<any>[] = [
		{ 
			header: 'Business Name', 
			accessor: (row) => (
				<div className="flex items-center gap-2 min-w-[200px]">
					{ row.merchant.Logo?.logo_url && <Image src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${row.merchant.Logo.logo_url}`} className="rounded-[5px]" alt={row.merchant.business_name} width={32} height={32} /> }
					{row.merchant.business_name}
				</div>
			),
		},
		{ 
			header: 'Contact Person',
			accessor: (row) => {
				const cp = row.contactPerson;
				return (
					<div className="flex items-center gap-2 min-w-[200px]">
						{ cp?.Avatar?.image_url && <Image src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${cp.Avatar.image_url}`} className="rounded-full object-cover" alt={cp.fname} width={32} height={32} /> }
						{ cp ? `${cp.fname} ${cp.lname}` : '' }
					</div>
				)
			}
		},
		{ header: 'Email', accessor: (row) => row.merchant.email },
		{ header: 'Phone', accessor: (row) => row.merchant.phone },
		{
			header: 'Address',
			accessor: (row) => row.merchant.Address ? (
				<div className="min-w-[100px]">
					<p>{row.merchant.Address.street}</p>
					<p>{row.merchant.Address.city}</p>
					<p>{row.merchant.Address.state}</p>
					<p>{row.merchant.Address.country}</p>
					<p>{row.merchant.Address.zip}</p>
				</div>
			) : ''
		},
		{ header: 'Subscription Status', accessor: (row) => row.merchant.subscription_status, sortable: false },
		{
			header: 'Subscription',
			accessor: (row) => {
				return (
					<div className="flex items-center gap-2">
						{ row.merchant.subscription_start && row.merchant.subscription_end ? `${formatDate(row.merchant.subscription_start)} - ${formatDate(row.merchant.subscription_end)}` : 'N/A' }
					</div>
				)
			}
		},
		{ header: 'Approval Status', accessor: (row) => row.merchant.approval_status },
		{ header: 'Approval Date', accessor: (row) => row.merchant.approved_at ? formatDate(row.merchant.approved_at) : '' },
		{ header: 'Branch Count', accessor: (row) => row.branchCount ?? '0' },
		{ header: 'Created At', accessor: (row) => formatDate(row.merchant.created_at) },
		{
			header: '',
			accessor: (row) => (
				<div className="flex gap-3 items-center justify-center">
					<button
						onClick={() => handleEdit(row)}
						className="text-blue-500 rounded hover:text-blue-600 transition-colors flex items-center gap-1"
					>
						<Edit2 className="w-4 h-4" />
					</button>
					{canDelete && (
						<button
							onClick={() => handleDelete(row)}
							className="text-red-500 rounded hover:text-red-600 transition-colors flex items-center gap-1"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					)}
				</div>
			),
			sortable: false,
		},
	];

	if (isLoading) return <LoadingIndicator fullScreen />;
	if (error) {
		return <div>Error: {error.message}</div>;
	}

	return (
		<div className="min-h-screen font-regular-eng p-8">
			{/* Header Section */}
			<h1 className="text-3xl mb-8 text-primary-light font-bold">View Merchants</h1>

			{/* Table */}
			<div className="w-full overflow-x-auto">
				<Table columns={columns} data={merchants} />
			</div>

			<EditMerchantModal
				isOpen={editModalOpen}
				onClose={() => { setEditModalOpen(false); setSelectedMerchant(null); }}
				merchant={selectedMerchant}
				onSave={handleSaveEdit}
				isLoading={updatePending}
			/>

			<ConfirmationModal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleConfirmDelete}
				title="Delete Merchant"
				message={`Are you sure you want to delete ${selectedMerchant?.business_name || ''}? This action cannot be undone.`}
				isLoading={deletePending}
				confirmText="Delete"
			/>
		</div>
	);
};

export default ViewMerchant;