"use client";

import {
	Metrics,
	AddAdmin,
	Logs,
	ViewMerchant,
	ApproveMerchant,
	AdminOrgChart,
	SystemHealth,
	Tickets,
	UnresolvedTickets,
	ResolvedTickets,
	AssignedTickets,
	ApiLogs,
	AdminActions,
	LoginLogs,
	Notifications,
	Legal,
	Account,
	Profile
} from "@/components";
import { useAuth } from "@/hooks/auth-hooks";
import { hasAdminAccess } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingIndicator from "@/components/common/loading-indicator";
import { Settings } from "lucide-react";

interface AdminDashboardProps {
	slug: string;
}

const AdminDashboard = ({ slug }: AdminDashboardProps) => {
	const { data: userData } = useAuth();
	const userRole = userData?.user?.role;
	const adminRole = userData?.user?.UserAdmin?.role;
	const router = useRouter();

	const isRouteAllowed = (): boolean => {
		// Check if user has admin access - either through main role or UserAdmin relationship
		const isAdmin = userRole === 'ADMIN' || adminRole;
		if (!isAdmin) return false;
		
		// If user has specific admin role, check access rules
		if (adminRole) {
			const hasAccess = hasAdminAccess(adminRole as any, slug);
			return hasAccess;
		}
		
		return true;
	};

	// Redirect to 404 if user doesn't have permission
	useEffect(() => {
		if (userData && !isRouteAllowed()) {
			router.push('/404');
		}
	}, [userData, adminRole, slug, router]);

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
			case "metrics":
				return <Metrics />;
			case "system-health":
				return <SystemHealth />;
			case "add-admin":
				return <AddAdmin />;
			case "org-chart":
				return <AdminOrgChart />;
			case "view-merchants":
				return <ViewMerchant />;
			case "approve-merchants":
				return <ApproveMerchant />;
			case "tickets":
				return <Tickets title="All Tickets" />;
			case "unresolved-tickets":
				return <UnresolvedTickets />;
			case "resolved-tickets":
				return <ResolvedTickets />;
			case "assigned-tickets":
				return <AssignedTickets />;
			case "logs":
				return <Logs />;
			case "api-logs":
				return <ApiLogs />;
			case "admin-actions":
				return <AdminActions />;
			case "login-logs":
				return <LoginLogs />;
			case "notifications":
				return <Notifications />;
			case "legal":
				return <Legal />;
			case "profile":
				return <Profile />;
			case "account":
				return <Account />;
			case "settings":
				return <Settings />;
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

export default AdminDashboard;