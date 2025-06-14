import { ReactNode } from "react";
import DashboardNavbar from "@/components/dashboard/merchants/dashboard-navbar";
import DashboardSidenav from "@/components/dashboard/merchants/dashboard-sidenav";

interface MerchantLayoutProps {
	children: ReactNode;
}

export default function MerchantLayout({ children }: MerchantLayoutProps) {
	return (
		<div className="h-screen flex flex-col bg-gray-50">
			{/* Navbar fixed height */}
			<DashboardNavbar />

			{/* Main content area */}
			<div className="flex flex-1 overflow-hidden">
				{/* Fixed sidebar (sticky within full height) */}
				<div className="sticky top-0 h-[calc(100vh-73px)] hidden md:block z-50">
					<DashboardSidenav merchantId="current" />
				</div>

				{/* Scrollable main area */}
				<main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full">
					{children}
				</main>
			</div>
		</div>
	);
}