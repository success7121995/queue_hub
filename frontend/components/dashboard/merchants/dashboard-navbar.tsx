"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, UserCircle, Settings, CreditCard, LogOut } from "lucide-react";
import { Dropdown, Notification } from '@/components';
import { type DropdownItem } from "@/components/common/dropdown";
import Link from "next/link";
import { useLogout, useAuth } from "@/hooks/auth-hooks";
import { useMerchant, useBranches, useSwitchBranch } from "@/hooks/merchant-hooks";
import { useUpdateUserProfile } from "@/hooks/user-hooks";
import { useLang, type Lang } from "@/constant/lang-provider";
import LoadingIndicator from "@/components/common/loading-indicator";
import { Branch } from "@/types/merchant";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { hasMerchantAccess, MerchantRole } from "@/lib/utils";

const DashboardNavbar = () => {
	const pathname = usePathname();
	const [profileOpen, setProfileOpen] = useState(false);
	const [branchOpen, setBranchOpen] = useState(false);
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const [profileAccordion, setProfileAccordion] = useState(false);
	const mobileMenuRef = useRef<HTMLDivElement>(null);
	const profileRef = useRef<HTMLDivElement>(null);
	const branchRef = useRef<HTMLDivElement>(null);
	const updateUserProfile = useUpdateUserProfile();
	const queryClient = useQueryClient();

	const { data: userData, isLoading: isUserDataLoading } = useAuth();
	const { data: merchantData, isLoading: isMerchantDataLoading } = useMerchant(userData?.user?.UserMerchant?.merchant_id as string);
	const { data: branchesData, isLoading: isBranchesDataLoading } = useBranches(
		userData?.user?.UserMerchant?.merchant_id as string,
		userData?.user?.UserMerchant?.user_id,
		{ enabled: !!userData?.user?.UserMerchant?.merchant_id }
	);
	const { mutate: switchBranch, isPending: isSwitchingBranch } = useSwitchBranch();
	
	const { langsOptions, lang, setLang } = useLang();

	// Extract user info for navbar display - with better fallbacks
	const username = userData?.user?.username || userData?.user?.fname || 'User';
	const firstName = userData?.user?.fname || '';
	const lastName = userData?.user?.lname || '';
	const position = userData?.user?.UserMerchant?.position || userData?.user?.role || '';
	const merchantName = merchantData?.merchant?.business_name || 'Business';

	// Branch selection - use selected_branch_id from UserMerchant
	const [selectedBranch, setSelectedBranch] = useState(userData?.user?.UserMerchant?.selected_branch_id || branchesData?.branches[0]?.branch_id || "");

	// Find the selected branch object
	const selectedBranchObj: Branch | undefined = branchesData?.branches?.find(
		(branch: Branch) => branch.branch_id === selectedBranch
	) || branchesData?.branches?.[0];

	const selectedBranchName = selectedBranchObj?.branch_name || '';
	const avatar = userData?.user?.Avatar?.image_url || '';
	const avatarUrl = avatar ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${avatar}` : '';
	const logo = merchantData?.merchant?.Logo?.logo_url || '';
	const logoUrl = logo ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${logo}` : '';

	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const { mutate: logout } = useLogout();

	// Close all dropdowns when pathname changes
	useEffect(() => {
		setProfileOpen(false);
		setBranchOpen(false);
		setMobileNavOpen(false);
		setProfileAccordion(false);
	}, [pathname]);

	useEffect(() => {
		if (userData?.user?.UserMerchant?.selected_branch_id) {
			const currentSelectedBranch = userData.user.UserMerchant.selected_branch_id;
			
			// Check if the current selected branch is accessible to the user
			if (userData.user.UserMerchant.role === 'OWNER') {
				// Owners can access all branches
				setSelectedBranch(currentSelectedBranch);
			} else {
				// Non-owners can only access their assigned branches
				const assignedBranchIds = userData.user.UserMerchant.UserMerchantOnBranch?.map(
					(umb: any) => umb.branch_id
				) || [];
				
				if (assignedBranchIds.includes(currentSelectedBranch)) {
					setSelectedBranch(currentSelectedBranch);
				} else if (assignedBranchIds.length > 0) {
					// If current branch is not accessible, switch to first available branch
					setSelectedBranch(assignedBranchIds[0]);
				}
			}
		} else if (!selectedBranch && branchesData?.branches?.length) {
			setSelectedBranch(branchesData.branches[0].branch_id);
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
		updateUserProfile.mutate({ username, lang }, {
			onSuccess: () => {
				setLang(lang);
			},
			onError: (error) => {
				console.error('Update user profile failed:', error);
			}
		});
	};

	/**
	 * Handle branch switching
	 */
	const handleBranchSwitch = (branchId: string) => {
		switchBranch(branchId, {
			onSuccess: (data) => {
				setBranchOpen(false);
				// Update the auth data with the new user data
				queryClient.setQueryData(['auth'], {
					success: true,
					user: data.user
				});
				// Invalidate queries to refresh data
				queryClient.invalidateQueries();
			},
			onError: (error) => {
				console.error('Branch switch failed:', error);
			}
		});
	};

	/**
	 * Update branch selection dropdown items
	 */
	const branchItems: DropdownItem[] = (() => {
		const allBranches = branchesData?.branches ?? [];
		
		// If user is owner, show all branches
		if (userData?.user?.UserMerchant?.role === 'OWNER') {
			return allBranches.map((branch: Branch) => ({
				label: branch.branch_name,
				value: branch.branch_id,
			}));
		}
		
		// For non-owners, only show branches they are assigned to
		const assignedBranchIds = userData?.user?.UserMerchant?.UserMerchantOnBranch?.map(
			(umb: any) => umb.branch_id
		) || [];
		
		return allBranches
			.filter((branch: Branch) => assignedBranchIds.includes(branch.branch_id))
			.map((branch: Branch) => ({
				label: branch.branch_name,
				value: branch.branch_id,
			}));
	})();

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

			{isSwitchingBranch && (
				<LoadingIndicator 
					fullScreen 
					text="Switching branch..." 
					className="bg-white/80"
				/>
			)}

			{isMerchantDataLoading || isUserDataLoading || isBranchesDataLoading && (
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
			
					{ logoUrl ? (
						<Image src={logoUrl} alt="Logo" width={48} height={48} className="rounded-[5px]" />
					) : (
						<UserCircle size={28} className="text-text-light" />
					) }

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
									onClick={() => handleBranchSwitch(branch.value)}
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

				{/* Notifications */}
				<Notification 
					isLoading={isUserDataLoading}
				/>

				{/* Profile */}
				<div ref={profileRef}>
					<button className="flex items-center space-x-2" onClick={() => setProfileOpen((v) => !v)}>
						<div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center">
							{ isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
								avatarUrl ? (
									<div className="w-10 h-10 rounded-full flex items-center justify-center">
										<Image src={avatarUrl} alt="Avatar" width={38} height={38} className="rounded-full object-cover w-full h-full" />
									</div>
								) : (
									<div className="w-10 h-10 rounded-full bg-text-light text-primary-light text-lg font-bold flex items-center justify-center">
										{ firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase() }
									</div>
								)
							}
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
						<ChevronDown size={16} className="text-text-light" />
					</button>

					{profileOpen && (
						<div className="absolute right-6 top-12 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-3 z-10 min-w-[220px]">
							<div className="flex flex-col gap-1">
								<Link 
									href="/merchant/profile" 
									className="flex items-center gap-3 w-full text-left py-2.5 px-3 hover:bg-gray-50 rounded-md duration-200 text-sm font-medium text-gray-700 hover:text-primary-600"
								>
									<UserCircle size={16} className="text-gray-500" />
									Profile
								</Link>
								<Link 
									href="/merchant/account" 
									className="flex items-center gap-3 w-full text-left py-2.5 px-3 hover:bg-gray-50 rounded-md duration-200 text-sm font-medium text-gray-700 hover:text-primary-600"
								>
									<Settings size={16} className="text-gray-500" />
									Account
								</Link>

								{
									hasMerchantAccess(userData?.user?.UserMerchant?.role as MerchantRole, "billing") && (				
										<Link 
											href="/merchant/billing" 
											className="flex items-center gap-3 w-full text-left py-2.5 px-3 hover:bg-gray-50 rounded-md duration-200 text-sm font-medium text-gray-700 hover:text-primary-600"
										>
											<CreditCard size={16} className="text-gray-500" />
											Billing
										</Link>
									)
								}
								
								<Link 
									href="/merchant/settings" 
									className="flex items-center gap-3 w-full text-left py-2.5 px-3 hover:bg-gray-50 rounded-md duration-200 text-sm font-medium text-gray-700 hover:text-primary-600"
								>
									<Settings size={16} className="text-gray-500" />
									Settings
								</Link>
								
								<div className="border-t border-gray-200 my-2"></div>
								
								<button 
									onClick={handleLogout}
									disabled={isLoggingOut}
									className="flex items-center gap-3 w-full text-left py-2.5 px-3 hover:bg-red-50 rounded-md duration-200 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoggingOut ? (
										<LoadingIndicator size="sm" className="!mt-0" />
									) : (
										<>
											<LogOut size={16} className="text-red-500" />
											Logout
										</>
									)}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Mobile hamburger and menu toggler always on the far right */}
			<div className="lg:hidden ml-auto flex items-center space-x-2 sm:space-x-3">
				{/* Notifications - Mobile */}
				<div className="flex items-center">
					<Notification 
						isLoading={isUserDataLoading}
						className="!relative"
					/>
				</div>
				
				{/* Hamburger Menu */}
				<button
					className="text-text-light cursor-pointer p-1"
					onClick={() => setMobileNavOpen((v) => !v)}
					aria-label="Open menu"
				>
					{mobileNavOpen ? <X size={24} className="sm:w-7 sm:h-7" /> : <Menu size={24} className="sm:w-7 sm:h-7" />}
				</button>
			</div>

			{/* Mobile dropdown */}
			{mobileNavOpen && (
				<div ref={mobileMenuRef} className="absolute top-full left-0 w-full bg-white shadow z-50 flex flex-col p-4 2xl:hidden">
					<div className="flex items-center space-x-2 mb-4">
						{ logoUrl ? (
							<Image src={logoUrl} alt="Logo" width={48} height={48} className="rounded-[5px]" />
						) : (
							<UserCircle size={28} className="text-text-light" />
						) }
						<span className="text-lg font-medium">
							{ isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
								merchantName
							}
						</span>
					</div>
					<span className="flex items-center text-sm mb-4">
						<Dropdown
							className="w-[200px] text-lg"
							items={branchItems}
							selected={branchItems.find(option => option.value === selectedBranch)}
							onSelect={(item) => handleBranchSwitch(item.value as string)}
						/>
					</span>
					<span className="flex items-center text-sm mb-4">
						<Dropdown
							className="w-[140px]"
							items={langsOptions}
							selected={langsOptions.find(option => option.value === lang)}
							onSelect={(item) => setLang(item.value as Lang)}
						/>
					</span>
					{/* Profile accordion */}
					<div className="flex flex-col mb-2">
						<button
							type="button"
							className="flex items-center w-full justify-between py-2 cursor-pointer"
							onClick={() => setProfileAccordion((v) => !v)}
						>
							<span className="flex items-center">
								{ isUserDataLoading ? <LoadingIndicator size="sm" className="!mt-0" /> : 
									avatarUrl ? (
										<Image src={avatarUrl} alt="Avatar" width={48} height={48} className="rounded-full border-[3px] border-primary-light" />
									) : (
										<div className="w-10 h-10 rounded-full bg-primary text-text-light text-lg font-bold flex items-center justify-center">
											{ firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase() }
										</div>
									)
								}
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
								<Link href="/merchant/profile" className="text-left">Profile</Link>
								<Link href="/merchant/account" className="text-left">Account</Link>
								<Link href="/merchant/billing" className="text-left">Billing</Link>
								<Link href="/merchant/settings" className="text-left">Settings</Link>
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