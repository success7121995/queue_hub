"use client";

import React, { useState } from "react";
import { CirclePlus } from "lucide-react";
import { BranchDetail, BranchCard } from "@/components";
import { Branch } from "@/types/merchant";
import { useAuth } from "@/hooks/auth-hooks";
import { useBranches, useUpdateBranch } from "@/hooks/merchant-hooks";
import Link from "next/link";
import LoadingIndicator from "@/components/common/loading-indicator";

const BranchInfo = () => {
	const [selectedBranchIdx, setSelectedBranchIdx] = useState<number | null>(null);
	const { data: currentUser } = useAuth();
	const { data: branchesData, isLoading: isBranchesDataLoading } = useBranches(currentUser?.user?.UserMerchant?.merchant_id as string);

	const handleReadMore = (idx: number) => {
		setSelectedBranchIdx(idx);
	};

	const handleCloseDetail = () => {
		setSelectedBranchIdx(null);
	};

	const handleSaveDetail = (updatedBranch: any) => {
		handleCloseDetail();
	};

	if (isBranchesDataLoading) {
		return <LoadingIndicator fullScreen={true} />;
	}

	return (
		<div className="min-h-screen px-8 py-8 font-regular-eng">
			<h1 className="text-3xl mb-8 text-primary-light font-bold">Branch Info</h1>

			{selectedBranchIdx === null ? (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-center w-full">
					<Link href="/dashboard/1/add-branch" className="flex flex-col items-center justify-center max-w-xl cursor-pointer my-32">
						<CirclePlus className="w-10 h-10 text-primary-light" /> 
						<h4 className="text-primary-light text-xl font-semibold">Expand Your Business</h4>
					</Link>

					{branchesData?.branches.map((branch, idx) => (
						<BranchCard
							branch={{
								branch_id: branch.branch_id ?? '',
								branch_name: branch.branch_name ?? '',
								merchant_id: branch.merchant_id ?? '',
								contact_person: branch.contact_person ?? null,
								is_active: branch.is_active ?? false,
								BranchFeature: branch.BranchFeature ?? [],
								BranchImage: branch.BranchImage ?? [],
								BranchOpeningHour: branch.BranchOpeningHour ?? [],
								Address: branch.Address ?? null,
								UserMerchantOnBranch: branch.UserMerchantOnBranch ?? [],
								updated_at: branch.updated_at ?? '',
								contact_person_id: branch.contact_person_id ?? '',
								created_at: branch.created_at ?? '',
							}}
							key={idx}
							idx={idx}
							onReadMore={handleReadMore}
						/>
					))}
				</div>
			) : (
				<BranchDetail
					branch={{
						...(branchesData?.branches[selectedBranchIdx] as any),
						branch_id: branchesData?.branches[selectedBranchIdx]?.branch_id ?? '',
						branch_name: branchesData?.branches[selectedBranchIdx]?.branch_name ?? '',
						merchant_id: branchesData?.branches[selectedBranchIdx]?.merchant_id ?? '',
						contact_person: branchesData?.branches[selectedBranchIdx]?.contact_person ?? null,
						is_active: branchesData?.branches[selectedBranchIdx]?.is_active ?? false,
						phone: branchesData?.branches[selectedBranchIdx]?.phone ?? '',
						email: branchesData?.branches[selectedBranchIdx]?.email ?? '',
						description: branchesData?.branches[selectedBranchIdx]?.description ?? '',
						created_at: branchesData?.branches[selectedBranchIdx]?.created_at ?? '',
						updated_at: branchesData?.branches[selectedBranchIdx]?.updated_at ?? '',
					}}
					onClose={handleCloseDetail}
					onSave={handleSaveDetail}
				/>
			)}
		</div>
	);
};

export default BranchInfo;