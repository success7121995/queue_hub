"use client";

import { ReactNode } from "react";
import AdminNavbar from "@/components/dashboard/admin/admin-navbar";
import AdminSidenav from "@/components/dashboard/admin/admin-sidenav";

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
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
