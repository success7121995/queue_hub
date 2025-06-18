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
	Legal
} from "@/components";

interface AdminDashboardProps {
	slug: string;
}

const AdminDashboard = ({ slug }: AdminDashboardProps) => {
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