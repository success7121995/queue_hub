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

		if (!userData?.user) {
			throw new Error('User not authenticated');
		}

		const merchantId = userData?.user.UserMerchant?.merchant_id;
		const selectedBranchId = userData?.user.UserMerchant?.selected_branch_id;
		const userId = userData?.user.UserMerchant?.user_id;

		await prefetchMerchant(queryClient, merchantId);
		
		if (merchantId) {
			await prefetchBranches(queryClient, merchantId, userId);
			throw new Error('Branches not found');
		}

		if (selectedBranchId) {
			await prefetchQueues(queryClient, selectedBranchId);
			throw new Error('Queues not found');
		}
	} catch (error) {
		console.error('Error prefetching data:', error);
		redirect('/login');
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