import { ReactNode } from "react";
import AdminNavbar from "@/components/dashboard/admin/admin-navbar";
import AdminSidenav from "@/components/dashboard/admin/admin-sidenav";
import { getQueryClient } from "@/lib/query-client";
import { prefetchAuth } from "@/hooks/auth-hooks";

interface AdminLayoutProps {
	children: ReactNode;
}

const AdminLayout = async ({ children }: AdminLayoutProps) => {
	const queryClient = getQueryClient();

	try {
		const userData = await prefetchAuth(queryClient);
		queryClient.setQueryData(['auth'], userData);

		if (!userData?.user?.UserAdmin) throw Error("User admin not found");

	} catch (error) {
		console.error('Error prefetching user data:', error);
	}

	return (
		<div className="h-screen flex flex-col bg-gray-50 overflow-y-hidden">
			{/* Navbar fixed height */}
			<AdminNavbar />

			{/* Main content area */}
			<div className="flex flex-1 overflow-hidden">
				{/* Fixed sidebar (sticky within full height) */}
				<div className="sticky top-0 h-[calc(100vh-73px)] md:block z-50">
					<AdminSidenav merchantId="current" />
				</div>

				{/* Scrollable main area */}
				<main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full">
					{children}
				</main>
			</div>
		</div>
	);
}

export default AdminLayout;
