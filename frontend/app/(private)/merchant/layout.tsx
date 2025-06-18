import { ReactNode } from "react";
import DashboardNavbar from "@/components/dashboard/merchants/dashboard-navbar";
import DashboardSidenav from "@/components/dashboard/merchants/dashboard-sidenav";
import { prefetchBranches, prefetchMerchant, prefetchQueues } from "@/hooks/merchant-hooks";
import { getQueryClient } from "@/lib/query-client";
import { fetchAuth } from "@/hooks/auth-hooks";

interface MerchantLayoutProps {
	children: ReactNode;
}

const MerchantLayout = async ({ children }: MerchantLayoutProps) => {
	const queryClient = getQueryClient();

	try {
		const userData = await fetchAuth();
		queryClient.setQueryData(['auth'], userData);

		if (!userData.user?.UserMerchant) throw Error("User merchant not found");

		const merchantId = userData.user.UserMerchant[0].merchant_id;
		const branchId = userData.user.branch_id;

		const merchantData = await prefetchMerchant(queryClient, merchantId);
		queryClient.setQueryData(['merchant', merchantId], merchantData);

		const branchesData = await prefetchBranches(queryClient, merchantId);
		queryClient.setQueryData(['branches', merchantId], branchesData);

		const queuesData = await prefetchQueues(queryClient, branchesData.branches[0].branch_id);
		queryClient.setQueryData(['queues', branchId], queuesData);
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
			</div>
		</div>
	);
};


export default MerchantLayout;