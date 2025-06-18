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
		<div className="pt-24 2xl:p-10">
			{renderContent()}
		</div>
	)
}

export default MerchantDashboard;