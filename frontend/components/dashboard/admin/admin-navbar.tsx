"use client";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, Globe, Mail, UserCircle } from "lucide-react";
import { Dropdown } from '@/components';
import { type DropdownItem } from "@/components/common/dropdown";
import Link from "next/link";
// TODO: Enable when backend is ready
// import { useMutation, useQuery } from "@tanstack/react-query";
import LoadingIndicator from "@/components/common/loading-indicator";

const AdminNavbar = () => {
	const [profileOpen, setProfileOpen] = useState(false);
	const [mailOpen, setMailOpen] = useState(false);
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const [profileAccordion, setProfileAccordion] = useState(false);
	const mobileMenuRef = useRef<HTMLDivElement>(null);
	const profileRef = useRef<HTMLDivElement>(null);
	const mailRef = useRef<HTMLDivElement>(null);

	// TODO: Enable when backend is ready
	/*
	const { data: user, isLoading: isUserDataLoading } = useQuery({
		queryKey: ['user'],
		queryFn: async () => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
				credentials: 'include',
			});
			if (!res.ok) {
				throw new Error('Failed to fetch user data');
			}
			return res.json();
		},
	});
	*/

	// Mock data for UI development
	const mockUser = {
		user: {
			user: {
				username: "Admin User",
				role: "Administrator",
				language: "en"
			},
			message_received: []
		}
	};

	// Use mock data instead of query data
	const user = mockUser;
	const isUserDataLoading = false;

	// Extract user info for navbar display
	const username = user?.user?.user?.username || "";
	const position = user?.user?.user?.role || "";
	const language = user?.user?.user?.language || "en";
	const messageReceived = user?.user?.message_received || [];
	const messageCount = messageReceived.length;

	const languages = [
		{ label: "English", value: "en", icon: <Globe size={18} /> },
		{ label: "繁體（香港）", value: "zh-HK", icon: <Globe size={18} /> },
		{ label: "繁體（台灣）", value: "zh-TW", icon: <Globe size={18} /> },
		{ label: "简体", value: "zh-CN", icon: <Globe size={18} /> },
	];

	const [selectedLanguage, setSelectedLanguage] = useState<DropdownItem>(languages[0]);

	// Close mobile menu on outside click
	useEffect(() => {
		if (!mobileNavOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
				setMobileNavOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [mobileNavOpen]);

	// Close dropdowns on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
				setProfileOpen(false);
			}
			if (mailRef.current && !mailRef.current.contains(event.target as Node)) {
				setMailOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Mock logout function
	const handleLogout = async () => {
		try {
			// TODO: Enable when backend is ready
			// await logoutMutation.mutateAsync();
			console.log('Logging out...');
			window.location.href = '/';
		} catch (error: unknown) {
			console.error('Logout failed:', error);
			window.location.href = '/';
		}
	};

	return (
		<nav className="font-regular-eng fixed top-0 left-0 w-full z-[1000] flex items-center px-4 sm:px-8 py-3 sm:py-4 border-b border-gray-200 bg-primary shadow-sm">
			{/* Loading overlay */}
			{/* {logoutMutation.isPending && (
				<LoadingIndicator 
					fullScreen 
					text="Logging out..." 
					className="bg-white/80"
				/>
			)} */}

			{/* Logo and QueueHub always visible */}
			<div className="flex items-center space-x-2">
				<span className="font-bold text-xl text-text-light cursor-pointer">QueueHub Admin</span>
			</div>

			{/* Spacer to push right group to the end */}
			<div className="flex-1 hidden lg:block" />

			{/* Desktop navbar: right group (language, mail, profile) */}
			<div className="hidden lg:flex items-center space-x-6">
				<span className="flex items-center text-sm">
					<Dropdown
						className="w-[140px]"
						items={languages}
						selected={selectedLanguage}
						onSelect={(item) => setSelectedLanguage(item)}
					/>
				</span>
				<div ref={mailRef} className="relative">
					<button 
						className="flex items-center" 
						onClick={() => setMailOpen((v) => !v)}
					>
						<Mail size={22} className="text-text-light" />
						<ChevronDown size={16} className="text-text-light" />
					</button>
					{mailOpen && (
						<div className="absolute right-0 top-10 bg-white border rounded shadow px-4 py-2 z-10 min-w-[120px]">
							<ul className="py-1">
								{isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
									messageReceived.length > 0 ? messageReceived.map((message: any) => (
										<li key={message.id} className="cursor-pointer">
											{message.title}
										</li>
									)) : "No new messages"
								}
							</ul>
						</div>
					)}
				</div>
				<div ref={profileRef}>
					<button className="flex items-center space-x-2" onClick={() => setProfileOpen((v) => !v)}>
						<div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center">
							<UserCircle size={28} className="text-text-light" />
						</div>
						<div className="flex flex-col items-start">
							<span className="text-base font-semibold text-text-light">
								{isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
									"Hi, " + username									
								}
							</span>
							<span className="text-xs text-text-light font-medium">
								{isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
									position
								}
							</span>
						</div>
						<ChevronDown size={16} />
					</button>
					{profileOpen && (
						<div className="absolute right-0 top-12 bg-white border rounded shadow px-4 py-2 z-10 min-w-[160px]">
							<button className="w-full text-left py-1">Profile</button>
							<button className="w-full text-left py-1">Account</button>
							<button className="w-full text-left py-1">Settings</button>
							<hr className="my-2" />
							<button 
								className="w-full border border-gray-400 rounded px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-center" 
								onClick={handleLogout}
								disabled={/* logoutMutation.isPending */ false}
							>
								{/* logoutMutation.isPending ? (
									<LoadingIndicator size="sm" className="!mt-0" />
								) : ( */}
									'Logout'
								{/* )} */}
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Mobile hamburger and menu toggler */}
			<button
				className="lg:hidden ml-auto text-text-light cursor-pointer"
				onClick={() => setMobileNavOpen((v) => !v)}
				aria-label="Open menu"
			>
				{mobileNavOpen ? <X size={28} /> : <Menu size={28} />}
			</button>

			{/* Mobile dropdown */}
			{mobileNavOpen && (
				<div ref={mobileMenuRef} className="absolute top-full left-0 w-full bg-white shadow z-50 flex flex-col p-4 2xl:hidden">
					<span className="flex items-center text-sm mb-4">
						<Dropdown
							className="w-[140px]"
							items={languages}
							selected={selectedLanguage}
							onSelect={(item) => setSelectedLanguage(item)}
						/>
					</span>
					<div className="flex items-center mb-4">
						<Mail size={22} />
						<span className="ml-2">Mail</span>
					</div>
					{/* Profile accordion */}
					<div className="flex flex-col mb-2">
						<button
							type="button"
							className="flex items-center w-full justify-between py-2 cursor-pointer"
							onClick={() => setProfileAccordion((v) => !v)}
						>
							<span className="flex items-center">
								<UserCircle size={28} />
								<span className="ml-2 text-lg font-medium">
									{isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
										"Hi, " + username
									}
								</span>
								<span className="ml-2 text-xs text-gray-500">
									{isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
										position
									}
								</span>
							</span>
							<ChevronDown size={18} className={profileAccordion ? "rotate-180 transition-transform" : "transition-transform"} />
						</button>

						{profileAccordion && (
							<div className="flex flex-col pl-8 space-y-2 mt-1">
								<Link href="/profile" className="text-left">Profile</Link>
								<Link href="/account" className="text-left">Account</Link>
								<Link href="/settings" className="text-left">Settings</Link>
								<button 
									className="text-left border border-gray-400 rounded px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-center" 
									onClick={handleLogout}
									disabled={/* logoutMutation.isPending */ false}
								>
									{/* logoutMutation.isPending ? (
										<LoadingIndicator size="sm" className="!mt-0" />
									) : ( */}
										'Logout'
									{/* )} */}
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</nav>
	);
};

export default AdminNavbar;