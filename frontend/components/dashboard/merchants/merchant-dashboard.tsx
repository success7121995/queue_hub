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

interface MerchantDashboardProps {
	slug: string;
}

const MerchantDashboard = ({ slug }: MerchantDashboardProps) => {
	// Mock merchant data
	const mockMerchant = {
		id: 1,
		name: "Demo Merchant",
		email: "demo@merchant.com",
		phone: "+1234567890",
		address: "123 Demo St, Demo City",
		status: "active",
		createdAt: new Date().toISOString(),
		branches: [
			{
				id: 1,
				name: "Main Branch",
				address: "123 Demo St, Demo City",
				status: "active"
			}
		]
	};

	const renderContent = () => {
		switch (slug) {
			case "view-live-queues":
				return <ViewLiveQueues />;
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