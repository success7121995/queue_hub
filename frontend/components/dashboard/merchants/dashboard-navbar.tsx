"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, Globe, Mail, UserCircle } from "lucide-react";
import { Dropdown } from '@/components';
import { type DropdownItem } from "@/components/common/dropdown";
import Link from "next/link";
import { useLogout, useAuth } from "@/hooks/auth-hooks";
import { useMerchant, useBranches } from "@/hooks/merchant-hooks";
import { useUpdateUserProfile } from "@/hooks/user-hooks";
import { useLang, type Lang } from "@/constant/lang-provider";
import LoadingIndicator from "@/components/common/loading-indicator";
import { Branch } from "@/types/merchant";

const DashboardNavbar = () => {
	const [profileOpen, setProfileOpen] = useState(false);
	const [mailOpen, setMailOpen] = useState(false);
	const [branchOpen, setBranchOpen] = useState(false);
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const [profileAccordion, setProfileAccordion] = useState(false);
	const mobileMenuRef = useRef<HTMLDivElement>(null);
	const profileRef = useRef<HTMLDivElement>(null);
	const mailRef = useRef<HTMLDivElement>(null);
	const branchRef = useRef<HTMLDivElement>(null);
	const updateUserProfile = useUpdateUserProfile();

	const { data: userData, isLoading: isUserDataLoading } = useAuth();
	const { data: merchantData, isLoading: isMerchantDataLoading } = useMerchant(userData?.user?.UserMerchant?.merchant_id as string);
	const { data: branchesData, isLoading: isBranchesDataLoading } = useBranches(userData?.user?.UserMerchant?.merchant_id as string);
	
	const { langsOptions, lang, setLang } = useLang();

	// Extract user info for navbar display - with better fallbacks
	const username = userData?.user?.username || userData?.user?.fname || 'User';
	const position = userData?.user?.UserMerchant?.position || userData?.user?.role || '';
	const merchantName = merchantData?.merchant?.business_name || 'Business';
	const messageReceived = userData?.user?.message_received || [];

	// Branch selection - use prefetched branch_id or first available branch
	const [selectedBranch, setSelectedBranch] = useState(branchesData?.branches[0]?.branch_id || "");

	// Find the selected branch object
	const selectedBranchObj: Branch | undefined = branchesData?.branches?.find(
		(branch: Branch) => branch.branch_id === selectedBranch
	) || branchesData?.branches?.[0];

	const selectedBranchName = selectedBranchObj?.branch_name || '';
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const { mutate: logout } = useLogout();

	useEffect(() => {
		if (!selectedBranch && branchesData?.branches?.length) {
		  setSelectedBranch(userData?.user?.branch_id || branchesData.branches[0].branch_id);
		}

	  }, [branchesData, selectedBranch, userData]);

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
			if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
				setBranchOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	/**
	 * Logout handler
	 */
	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await logout();
			window.location.href = '/';
		} catch (error) {
			console.error('Logout failed:', error);
		} finally {
			setIsLoggingOut(false);
		}
	};

	/**
	 * Handle language change
	 */
	const handleLanguageChange = (lang: Lang) => {
		updateUserProfile.mutate({ lang }, {
			onSuccess: () => {
				setLang(lang);
			},
			onError: (error) => {
				console.error('Update user profile failed:', error);
			}
		});
	};

	/**
	 * Update branch selection dropdown items
	 */
	const branchItems: DropdownItem[] = (branchesData?.branches ?? []).map((branch: Branch) => ({
		label: branch.branch_name,
		value: branch.branch_id,
		icon: <Globe size={18} />
	}));

	return (
		<nav className="font-regular-eng fixed top-0 left-0 w-full z-[1000] flex items-center px-4 sm:px-8 py-3 sm:py-4 border-b border-gray-200 bg-primary shadow-sm">
			{/* Loading overlay */}
			{isLoggingOut && (
				<LoadingIndicator 
					fullScreen 
					text="Logging out..." 
					className="bg-white/80"
				/>
			)}

			{isMerchantDataLoading || isUserDataLoading && (
				<LoadingIndicator 
					fullScreen 
					text="Loading merchant data..." 
					className="bg-white/80"
				/>
			)}

			{/* Logo and QueueHub always visible */}
			<div className="flex items-center space-x-2">
				<span className="font-bold text-xl text-text-light cursor-pointer">QueueHub</span>
			</div>

			{/* Desktop navbar: left group (company + branch) */}
			<div className="hidden lg:flex items-center space-x-6 ml-8">
				<div className="flex items-center space-x-2">
					<div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center">
						<UserCircle size={28} className="text-text-light" />
					</div>


					<span className="text-base font-semibold text-text-light">
						{ isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
							merchantName
						}
					</span>
				
				</div>
				<div ref={branchRef} className="relative flex items-center ml-6">
					<span className="text-sm font-medium cursor-pointer text-text-light" onClick={() => setBranchOpen((v) => !v)}>
						Branch <ChevronDown size={16} className="inline ml-1" />
					</span>
					<span className="ml-2 text-base font-semibold text-text-light">
						{ isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
							selectedBranchName
						}
					</span>
					{branchOpen && (
						<div className="absolute left-0 top-10 bg-white border rounded shadow px-4 py-2 z-10">
							{branchItems.map((branch) => (
								<div
									key={branch.value}
									className="py-1 cursor-pointer"
									onClick={() => { setSelectedBranch(branch.value); setBranchOpen(false); }}
								>
									{branch.label}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
			{/* Spacer to push right group to the end */}

			<div className="flex-1 hidden lg:block" />
			{/* Desktop navbar: right group (language, mail, profile) */}
			<div className="hidden lg:flex items-center space-x-6">

				{/* Language */}
				<span className="flex items-center text-sm">
					<Dropdown
						className="w-[140px]"
						items={langsOptions}
						selected={langsOptions.find(option => option.value === lang)}
						onSelect={(item) => handleLanguageChange(item.value as Lang)}
					/>
				</span>

				{/* Mail */}
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
								{ isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
									messageReceived && messageReceived.length > 0 ? messageReceived.map((message: any) => (
										<li key={message.id} className="cursor-pointer">
											{message.title}
										</li>
									)) : "No new messages"
								}
							</ul>
						</div>
					)}
				</div>

				{/* Profile */}
				<div ref={profileRef}>
					<button className="flex items-center space-x-2" onClick={() => setProfileOpen((v) => !v)}>
						<div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center">
							<UserCircle size={28} className="text-text-light" />
						</div>
						<div className="flex flex-col items-start">
							<span className="text-base font-semibold text-text-light">
								{ isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
									"Hi, " + username									
								}
							</span>
							<span className="text-xs text-text-light font-medium">
								{ isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
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
							<button className="w-full text-left py-1">Billing</button>
							<button className="w-full text-left py-1">Settings</button>
							<hr className="my-2" />
							<button 
								onClick={handleLogout}
								disabled={isLoggingOut}
								className="w-full border border-gray-400 rounded px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-center"
							>
								{isLoggingOut ? (
									<LoadingIndicator size="sm" className="!mt-0" />
								) : (
									'Logout'
								)}
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Mobile hamburger and menu toggler always on the far right */}
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
					<div className="flex items-center space-x-2 mb-4">
						<div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center">
							<UserCircle size={28} />
						</div>
						<span className="text-lg font-medium">
							{ isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
								merchantName
							}
						</span>
					</div>
					<div className="flex items-center mb-4">
						<span className="text-lg font-medium cursor-pointer" onClick={() => setBranchOpen((v) => !v)}>
							Branch <ChevronDown size={16} className="inline ml-1" />
						</span>
						<span className="ml-2 text-lg">
							{ isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
								selectedBranchName
							}
						</span>
					</div>
					<span className="flex items-center text-sm mb-4">
						<Dropdown
							className="w-[140px]"
							items={langsOptions}
							selected={langsOptions.find(option => option.value === lang)}
							onSelect={(item) => setLang(item.value as Lang)}
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
									{ isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
										"Hi, " + username
									}
								</span>
								<span className="ml-2 text-xs text-gray-500">
									{ isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
										position
									}
								</span>
							</span>
							<ChevronDown size={18} className={profileAccordion ? "rotate-180 transition-transform" : "transition-transform"} />
						</button>

						{/* Profile accordion */}
						{profileAccordion && (
							<div className="flex flex-col pl-8 space-y-2 mt-1">
								<Link href="/profile" className="text-left">Profile</Link>
								<Link href="/account" className="text-left">Account</Link>
								<Link href="/billing" className="text-left">Billing</Link>
								<Link href="/settings" className="text-left">Settings</Link>
								<button 
									onClick={handleLogout}
									disabled={isLoggingOut}
									className="text-left border border-gray-400 rounded px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-center"
								>
									{isLoggingOut ? (
										<LoadingIndicator size="sm" className="!mt-0" />
									) : (
										'Logout'
									)}
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</nav>
	);
};

export default DashboardNavbar;