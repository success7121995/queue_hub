"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

interface DashboardSidenavProps {
	merchantId: string;
}

const DashboardSidenav = ({ merchantId }: DashboardSidenavProps) => {
	const pathname = usePathname();
	const currentSlug = pathname.split('/').pop();

	const menuData = [
		{
			label: "Queues",
			items: [
				{ label: "View Live Queues", href: `/dashboard/${merchantId}/view-live-queues` },
				{ label: "Manage Queue Entries", href: `/dashboard/${merchantId}/manage-queue-entries` },
			],
		},
		{
			label: "Branch",
			items: [
				{ label: "Add Branch", href: `/dashboard/${merchantId}/add-branch` },
				{ label: "Branch Info", href: `/dashboard/${merchantId}/branch-info` },
			],
		},
		{
			label: "Customers",
			items: [
				{ label: "View Queue History", href: `/dashboard/${merchantId}/view-queue-history` },
				{ label: "Feedback", href: `/dashboard/${merchantId}/feedback` },
			],
		},
		{
			label: "Employees",
			items: [
				{ label: "Register New User", href: `/dashboard/${merchantId}/register-new-user` },
				{ label: "Manage Users", href: `/dashboard/${merchantId}/manage-users` },
			],
		},
		{
			label: "Analytics",
			items: [
				{ label: "Analytics", href: `/dashboard/${merchantId}/analytics` },
				{ label: "System Health", href: `/dashboard/${merchantId}/system-health` },
			],
		},
	];
	
	const [open, setOpen] = useState(false);
	const [accordion, setAccordion] = useState<string | null>(null);
	const sidenavRef = useRef<HTMLDivElement>(null);

	const handleAccordion = (label: string) => {
		setAccordion((prev) => (prev === label ? null : label));
	};

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
				className="fixed top-[53px] md:top-[60px] lg:top-[73px] 2xl:top-[80px] left-0 bg-white p-2 2xl:hidden border-b border-gray-200 w-full flex justify-between items-center cursor-pointer z-[999]"
				onClick={() => setOpen(true)}
				aria-label="Open sidenav"
			>
				<span className="font-bold italic text-xl text-primary-light flex items-center">
					<Menu size={24} className="mr-2" />
				</span>
			</button>

			{/* Sidenav drawer */}
			<aside
				ref={sidenavRef}
				className={`fixed top-0 left-0 h-screen w-[180px] md:w-[220px] z-[998] pt-[64px] 2xl:pt-[32px] px-2 md:px-6 flex flex-col space-y-2 font-regular-eng border-r border-gray-200 bg-white overflow-hidden
				${open ? 'block' : 'hidden'} 2xl:block 2xl:relative`}
			>
				
				{/* Mobile: accordion format */}
				<div className="block 2xl:hidden mt-15 pt-20">
					{menuData.map((section) => (
						<div key={section.label} className="mb-2">
							<button
								className="w-full flex items-center justify-between font-semibold text-base py-2 px-2 rounded hover:bg-gray-200 transition cursor-pointer"
								onClick={() => handleAccordion(section.label)}
								type="button"
							>
								<span>{section.label}</span>
								<ChevronDown size={18} className={accordion === section.label ? "rotate-180 transition-transform" : "transition-transform"} />
							</button>
							{accordion === section.label && (
								<div className="ml-2 mt-1 rounded py-2 px-2 flex flex-col space-y-1">
									{section.items.map((item) => {
										const isActive = item.href.split('/').pop() === currentSlug;
										return (
											<Link
												key={item.label}
												href={item.href}
												className={`block text-sm cursor-pointer px-2 py-1 rounded ${
													isActive 
														? 'text-primary-600 bg-primary-50 hover:bg-primary-100' 
														: 'text-gray-500 hover:bg-gray-100'
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
											className={`block text-sm cursor-pointer px-2 py-1 rounded ${
												isActive 
													? 'text-primary-600 bg-primary-50 hover:bg-primary-100' 
													: 'text-gray-700 hover:bg-gray-100'
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

export default DashboardSidenav;