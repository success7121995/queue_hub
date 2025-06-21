"use client";

import React, { useState } from "react";
import { CirclePlus } from "lucide-react";
import { BranchDetail, BranchCard } from "@/components";
import { Branch } from "@/types/merchant";
import { useAuth } from "@/hooks/auth-hooks";
import { useBranches } from "@/hooks/merchant-hooks";
import Link from "next/link";
import LoadingIndicator from "@/components/common/loading-indicator";

const BranchInfo = () => {
	const [selectedBranchIdx, setSelectedBranchIdx] = useState<number | null>(null);
	const { data: currentUser, status } = useAuth();
	
	const merchantId = currentUser?.user?.UserMerchant?.merchant_id;
	const { data: branchesData, isLoading: isBranchesDataLoading, refetch } = useBranches(
		merchantId as string,
		{ enabled: status === 'success' && !!merchantId }
	);
	
	const handleReadMore = (idx: number) => {
		setSelectedBranchIdx(idx);
	};

	const handleCloseDetail = () => {
		setSelectedBranchIdx(null);
		refetch();
	};

	if (isBranchesDataLoading || status === 'pending') {
		return <LoadingIndicator fullScreen={true} />;
	}

	// Handle case where there is no authenticated user
	if (status !== 'success' || !currentUser) {
		return (
			<div className="flex items-center justify-center h-full">
				<p>Please log in to view branch information.</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen px-8 py-8 font-regular-eng">
			<h1 className="text-3xl mb-8 text-primary-light font-bold">Branch Info</h1>

			{selectedBranchIdx !== null && branchesData?.branches?.[selectedBranchIdx] ? (
				<BranchDetail 
					branch={branchesData.branches[selectedBranchIdx]} 
					onClose={handleCloseDetail}
					onBack={handleCloseDetail}
				/>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Link href="/merchant/add-branch">
						<div className="h-full min-h-[200px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
							<CirclePlus className="w-12 h-12 text-gray-400 mb-2" />
							<p className="text-gray-500 font-semibold">Expand your business</p>
						</div>
					</Link>
					{branchesData?.branches?.map((branch: Branch, idx: number) => (
						<BranchCard key={branch.branch_id} branch={branch} idx={idx} onReadMore={() => handleReadMore(idx)} />
					))}
				</div>
			)}
		</div>
	);
};

export default BranchInfo;