"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

interface AdminSidenavProps {
	merchantId: string;
}

const AdminSidenav = ({ merchantId }: AdminSidenavProps) => {
	const pathname = usePathname();
	const currentSlug = pathname.split('/').pop();

	const menuData = [
		{
			label: "Overview",
			items: [
			{ label: "Metrics & Graphs", href: `/admin/metrics` },
			{ label: "System Health", href: `/admin/system-health` },
			],
		},
		{
			label: "Users",
			items: [
			{ label: "Add User", href: `/admin/add-admin` },
			{ label: "View Users", href: `/admin/org-chart` },
			],
		},
		{
			label: "Merchants",
			items: [
			{ label: "View Merchants", href: `/admin/view-merchants` },
			{ label: "Pending Approvals", href: `/admin/approve-merchants` },
			],
		},
		{
			label: "Tickets",
			items: [
			{ label: "All Tickets", href: `/admin/tickets` },
			{ label: "Unresolved Tickets", href: `/admin/unresolved-tickets` },
			{ label: "Resolved Tickets", href: `/admin/resolved-tickets` },
			{ label: "Assigned Tickets", href: `/admin/assigned-tickets` },
			],
		},
		{
			label: "Logs",
			items: [
			{ label: "Recent Logs", href: `/admin/logs` },
			{ label: "API Logs", href: `/admin/api-logs` },
			{ label: "Admin Actions", href: `/admin/admin-actions` },
			{ label: "Login Attempts", href: `/admin/login-logs` },
			]
		},
		{
			label: "System",
			items: [
			{ label: "Notification Settings", href: `/admin/notifications` },
			{ label: "Legal Pages", href: `/admin/legal` },
			]
		}
	];
	  
	
	const [open, setOpen] = useState(false);
	const [accordion, setAccordion] = useState<string | null>(null);
	const sidenavRef = useRef<HTMLDivElement>(null);

	const handleAccordion = (label: string) => {
		setAccordion((prev) => (prev === label ? null : label));
	};

	// Close sidenav and accordion when pathname changes
	useEffect(() => {
		setOpen(false);
		setAccordion(null);
	}, [pathname]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (sidenavRef.current && !sidenavRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<>
			{/* Toggler under navbar, only on mobile (below md) */}
			<button
				className="fixed top-[53px] md:top-[60px] lg:top-[73px] 2xl:top-[80px] left-0 bg-white p-3 2xl:hidden border-b border-gray-200 w-full flex justify-between items-center cursor-pointer z-[999] shadow-sm"
				onClick={() => setOpen(true)}
				aria-label="Open sidenav"
			>
				<span className="font-bold text-lg text-primary-light flex items-center">
					<Menu size={20} className="mr-2" />
					Admin Dashboard
				</span>
			</button>

			{/* Sidenav drawer */}
			<aside
				ref={sidenavRef}
				className={`fixed top-0 left-0 h-screen w-[280px] md:w-[300px] z-[998] pt-[64px] 2xl:pt-[32px] px-4 md:px-6 flex flex-col space-y-2 font-regular-eng border-r border-gray-200 bg-white overflow-hidden shadow-lg
				${open ? 'block' : 'hidden'} 2xl:block 2xl:relative`}
			>
				
				{/* Mobile: accordion format */}
				<div className="block 2xl:hidden mt-15 pt-20">
					{menuData.map((section) => (
						<div key={section.label} className="mb-3">
							<button
								className="w-full flex items-center justify-between font-semibold text-base py-2.5 px-3 rounded-lg hover:bg-primary-50 transition cursor-pointer text-primary-light"
								onClick={() => handleAccordion(section.label)}
								type="button"
							>
								<span>{section.label}</span>
								<ChevronDown size={18} className={`${accordion === section.label ? "rotate-180" : ""} transition-transform duration-200 text-primary-light`} />
							</button>
							{accordion === section.label && (
								<div className="ml-2 mt-1 rounded-lg py-2 px-2 flex flex-col space-y-1.5 bg-gray-50">
									{section.items.map((item) => {
										const isActive = item.href.split('/').pop() === currentSlug;
										return (
											<Link
												key={item.label}
												href={item.href}
												className={`block text-sm cursor-pointer px-3 py-2 rounded-md transition-colors ${
													isActive 
														? 'text-primary-600 bg-primary-50 hover:bg-primary-100 font-medium' 
														: 'text-gray-600 hover:bg-gray-100'
												}`}
											>
												{item.label}
											</Link>
										);
									})}
								</div>
							)}
						</div>
					))}
				</div>

				{/* Desktop: expanded sections, no accordion */}
				<div className="hidden 2xl:block mt-20 pt-16">
					{menuData.map((section) => (
						<div key={section.label} className="mb-4">
							<div className="font-bold text-base mb-2 text-primary-light">{section.label}</div>
							<div className="space-y-1">
								{section.items.map((item) => {
									const isActive = item.href.split('/').pop() === currentSlug;
									return (
										<Link
											key={item.label}
											href={item.href}
											className={`block text-sm cursor-pointer px-2 py-1.5 rounded-md transition-colors ${
												isActive 
													? 'text-primary-600 bg-primary-50 hover:bg-primary-100 font-medium' 
													: 'text-gray-600 hover:bg-gray-100'
											}`}
										>
											{item.label}
										</Link>
									);
								})}
							</div>
						</div>
					))}
				</div>
			</aside>
		</>
	);
};

export default AdminSidenav;
