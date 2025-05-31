"use client";

import {
	ViewLiveQueues,
	ManageQueueEntries,
	AddBranch,
	BranchInfo,
	ViewQueueHistory,
	Feedback,
	RegisterNewUser,
	ManageUsers,
	Analytics,
	SystemHealth,
} from "@/components";
import { useEffect, useState } from "react";

export interface Merchant {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
}

interface MerchantDashboardProps {
	merchantId: string;
	slug: string;
}

const MerchantDashboard = ({ merchantId, slug }: MerchantDashboardProps) => {
	const [merchant, setMerchant] = useState<Merchant | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchMerchant = async () => {
			setLoading(true);
			try {
				// Replace with your actual API endpoint
				const res = await fetch(`https://jsonplaceholder.typicode.com/users/${merchantId}`);
				const data = await res.json();
				setMerchant(data);
			} catch (error) {
				console.error('Error fetching merchant data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchMerchant();
	}, [merchantId]);

	if (loading) {
		return (
			<div className="p-8 mt-20 md:mt-0 h-full">
				<div className="h-[calc(100vh-53px)] md:h-[calc(100vh-64px)] overflow-y-auto">
					<div className="p-8 text-center text-lg text-gray-500">Loading merchant dashboard...</div>
				</div>
			</div>
		);
	}

	if (!merchant) {
		return (
			<div className="p-8 mt-20 md:mt-0 h-full">
				<div className="h-[calc(100vh-53px)] md:h-[calc(100vh-64px)] overflow-y-auto">
					<div className="p-8 text-center text-lg text-red-500">Failed to load merchant data</div>
				</div>
			</div>
		);
	}

	const renderContent = () => {
		switch (slug) {
			case "view-live-queues":
				return <ViewLiveQueues merchant={merchant} />;
			case "manage-queue-entries":
				return <ManageQueueEntries />;
			case "add-branch":
				return <AddBranch />;
			case "branch-info":
				return <BranchInfo />;
			case "view-queue-history":
				return <ViewQueueHistory />;
			case "feedback":
				return <Feedback />;
			case "register-new-user":
				return <RegisterNewUser />;
			case "manage-users":
				return <ManageUsers />;
			case "analytics":
				return <Analytics />;
			case "system-health":
				return <SystemHealth />;
			default:
				return <div>No content found</div>;
		}
	}

	return (
		<div className="lg:p-8 mt-20 h-fit">
			{renderContent()}
		</div>
	)
}

export default MerchantDashboard;