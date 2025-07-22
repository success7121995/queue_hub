import { ReactNode } from "react";
import DashboardNavbar from "@/components/dashboard/merchants/dashboard-navbar";
import DashboardSidenav from "@/components/dashboard/merchants/dashboard-sidenav";
import { prefetchBranches, prefetchMerchant, prefetchQueues } from "@/hooks/merchant-hooks";
import { getQueryClient } from "@/lib/query-client";
import { prefetchAuth, useAuth } from "@/hooks/auth-hooks";
import { queueKeys } from "@/hooks/merchant-hooks";
import { Chatbox } from "@/components";
import { redirect } from "next/navigation";

interface MerchantLayoutProps {
	children: ReactNode;
}

const MerchantLayout = async ({ children }: MerchantLayoutProps) => {
	const queryClient = getQueryClient();

	try {
		const userData = await prefetchAuth(queryClient);

		// Check if user is authenticated
		if (!userData?.user) {
			console.error('User not authenticated');
			redirect('/login');
		}

		// Check if user has merchant permissions
		if (!userData?.user?.UserMerchant) {
			console.error('User merchant not found - user may not have merchant permissions');
			redirect('/unauthorized');
		}

		const merchantId = userData.user.UserMerchant.merchant_id;
		const selectedBranchId = userData.user.UserMerchant.selected_branch_id;
		const userId = userData.user.UserMerchant.user_id;

		// Only prefetch data if we have valid IDs
		if (merchantId && userId) {
			try {
				const merchantData = await prefetchMerchant(queryClient, merchantId);
				queryClient.setQueryData(['merchant', merchantId], merchantData);

				const branchesData = await prefetchBranches(queryClient, merchantId, userId);
				queryClient.setQueryData(['branches', merchantId, userId], branchesData);

				if (selectedBranchId) {
					const queuesData = await prefetchQueues(queryClient, selectedBranchId);
					queryClient.setQueryData(queueKeys.list(selectedBranchId), queuesData);
				}
			} catch (prefetchError) {
				console.error('Error prefetching merchant data:', prefetchError);
				// Continue with layout even if prefetch fails
			}
		}
		
	} catch (error) {
		console.error('Error prefetching user data:', error);
	}

	return (
		<div className="flex flex-col h-screen overflow-hidden">
			{/* Navbar */}
			<div className="shrink-0">
				<DashboardNavbar />
			</div>

			{/* Main layout container (fills remaining space) */}
			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar */}
				<div className="sticky top-0 h-[calc(100vh-73px)] md:block z-50">
					<DashboardSidenav />
				</div>

				{/* Scrollable main content */}
				<main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50">
					{children}
				</main>

				{/* Chatbox */}
				<div className="fixed bottom-2 right-2 z-50">
					<Chatbox />
				</div>
			</div>
		</div>
	);
};

export default MerchantLayout;