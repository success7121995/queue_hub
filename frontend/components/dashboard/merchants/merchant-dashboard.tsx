"use client";

import {
	ViewLiveQueues,
	ManageQueueEntries,
	AddBranch,
	BranchInfo,
	ViewQueueHistory,
	Feedback,
	RegisterNewEmployee,
	ManageEmployees,
	Analytics,
	SystemHealth,
	Profile,
	Account,
	Billing,
	Setting,
} from "@/components";
import { useAuth } from "@/hooks/auth-hooks";
import { hasMerchantAccess } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingIndicator from "@/components/common/loading-indicator";

interface MerchantDashboardProps {
	slug: string;
}

const MerchantDashboard = ({ slug }: MerchantDashboardProps) => {
	const { data: userData } = useAuth();
	const merchantRole = userData?.user?.UserMerchant?.role;
	const router = useRouter();

	const isRouteAllowed = (): boolean => {
		return hasMerchantAccess(merchantRole as any, slug);
	};

	// Redirect to 404 if user doesn't have permission
	useEffect(() => {
		if (userData && !isRouteAllowed()) {
			router.push('/404');
		}
	}, [userData, merchantRole, slug, router]);

	// Show loading while checking permissions
	if (!userData) {
		return (
			<div className="pt-24 2xl:p-10">
				<div className="flex items-center justify-center min-h-[400px]">
					<LoadingIndicator />
				</div>
			</div>
		);
	}

	// Don't render anything if user doesn't have permission (will redirect to 404)
	if (!isRouteAllowed()) {
		return null;
	}

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
			case "register-new-employee":
				return <RegisterNewEmployee />;
			case "manage-employees":
				return <ManageEmployees />;
			case "analytics":
				return <Analytics />;
			case "system-health":
				return <SystemHealth />;
			case "profile":
				return <Profile />;
			case "account":
				return <Account />;
			case "billing":
				return <Billing />;		
			case "settings":
				return <Setting />;
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