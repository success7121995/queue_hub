"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { AddAdminFormFields, AddBranchFormFields, SignupFormFields, AddEmployeeFormFields, MerchantRole } from "@/types/form";
import { Lang } from "@/constant/lang-provider";
import Success from "./success";
import LoadingIndicator from "@/components/common/loading-indicator";
import { useCreateBranch, useUserMerchants } from "@/hooks/merchant-hooks";
import { useAuth, useCreateUser, useSignup } from "@/hooks/auth-hooks";
import { useAddAdmin } from "@/hooks/admin-hooks";
import { connectSocket, sendMerchantSignupNotification } from "@/lib/socket";

interface PreviewProps {
    form?: "signup" | "add-branch" | "add-admin" | "add-employee";
    onPrev: () => void;
    isSignupForm?: boolean;
}

const COOKIE_KEY = "signupForm";

interface CookieData {
    signup?: SignupFormFields["signup"];
    branchInfo?: SignupFormFields["branchInfo"] | AddBranchFormFields["branchInfo"];
    address?: SignupFormFields["address"] | AddBranchFormFields["address"];
    branchAddress?: SignupFormFields["branchAddress"];
    payment?: SignupFormFields["payment"] | AddBranchFormFields["payment"];
    userInfo?: {
        fname: string;
        lname: string;
        staff_id: string;
        email: string;
        phone: string;
        position: string;
        role: AddAdminFormFields["userInfo"]["role"] | AddEmployeeFormFields["userInfo"]["role"];
    };
    accountSetup?: {
        username: string;
        password: string;
        confirm_password: string;
        lang: Lang;
    };
    plan?: string;
    [key: string]: any;
}

const Preview: React.FC<PreviewProps> = ({ form, onPrev, isSignupForm = false }) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [addressError, setAddressError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CookieData | null>(null);

    // Get current user and merchant data for non-signup forms
    const { data: currentUser } = isSignupForm ? { data: null } : useAuth();
    const { data: userMerchants } = form?.includes("add-employee") 
        ? useUserMerchants(currentUser?.user?.UserMerchant?.merchant_id || '') 
        : { data: null };

    /**
     * Create branch
     */
    const createBranchMutation = useCreateBranch({
        onSuccess: () => {
            setShowSuccess(true);
            Cookies.remove(COOKIE_KEY);
        },
        onError: (error) => {
            console.error("Error creating branch:", error);
        }
    });

    /**
     * Create user
     */
    const createUserMutation = useCreateUser({
        onSuccess: () => {
            setShowSuccess(true);
            Cookies.remove(COOKIE_KEY);
        },
        onError: (error) => {
            console.error("Error creating user:", error);
        }
    });

    /**
     * Signup
     */
    const signupMutation = useSignup({
        onSuccess: (data) => {
            setShowSuccess(true);
            Cookies.remove(COOKIE_KEY);
            
            // Send notification to admins about new merchant signup
            if (data?.result?.merchant) {
                const merchantName = data.result.merchant.business_name;
                const merchantId = data.result.merchant.merchant_id;
                
                // Connect to socket and send notification
                connectSocket();
                sendMerchantSignupNotification(merchantName, merchantId);
            }
        },
        onError: (error) => {
            console.error("Error during signup:", error);
        }
    });

    /**
     * Create admin
     */
    const addAdminMutation = useAddAdmin({
        onSuccess: () => {
            setShowSuccess(true);
            Cookies.remove(COOKIE_KEY);
        },
        onError: (error) => {
            console.error("Error creating admin:", error);
        }
    });

    // Load form data from cookie
    useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);
        if (cookie) {
            try {
                const parsed: CookieData = JSON.parse(cookie);
                setFormData(parsed);
            } catch (error) {
                console.error("Error parsing cookie:", error);
                setFormData(null);
            }
        }
    }, []);

    // Helper functions
    const formatAddress = (address?: SignupFormFields["address"] | SignupFormFields["branchAddress"] | null): string => {
        if (!address) return "N/A";
        return [
            address.street,
            address.unit && `Unit ${address.unit}`,
            address.floor && `Floor ${address.floor}`,
            address.city,
            address.state,
            address.zip,
            address.country
        ].filter(Boolean).join(", ");
    };

    const getContactPersonName = (contactPersonId: string): string => {
        if (isSignupForm || !userMerchants?.user_merchants) {
            return contactPersonId;
        }
        
        const staff = userMerchants.user_merchants.find((s: any) => s.staff_id === contactPersonId);
        if (staff) {
            return `${staff.User?.fname || ''} ${staff.User?.lname || ''}`.trim() || staff.staff_id;
        }
        return contactPersonId;
    };

    const handleSubmit = () => {
        if (!formData) return;

        switch (form) {
            case "add-branch":
                handleAddBranch();
                break;
            case "add-employee":
                handleAddEmployee();
                break;
            case "add-admin":
                handleAddAdmin();
                break;
            case "signup":
                handleSignup();
                break;
            default:
                console.error("Invalid form type");
        }
    };

    const handleAddBranch = () => {
        if (!formData?.branchAddress || !formData?.branchInfo) return;
        
        const addressData = formData.branchAddress;
        if (!addressData.street || !addressData.city || !addressData.state || !addressData.country || !addressData.zip) {
            setAddressError("Branch address is required. Please complete the address step.");
            return;
        }
        setAddressError(null);
        
        const branchData = {
            branch_name: formData.branchInfo.branch_name,
            contact_person_id: formData.branchInfo.contact_person_id,
            phone: formData.branchInfo.phone,
            email: formData.branchInfo.email,
            description: formData.branchInfo.description,
            address: {
                street: addressData.street,
                city: addressData.city,
                state: addressData.state,
                country: addressData.country,
                zip: addressData.zip,
                unit: addressData.unit,
                floor: addressData.floor,
            },
        };
        createBranchMutation.mutate(branchData);
    };

    const handleAddEmployee = () => {
        if (!formData?.userInfo || !formData?.accountSetup) return;
        
        const employeeData: AddEmployeeFormFields = {
            userInfo: {
                ...formData.userInfo,
                role: formData.userInfo.role as MerchantRole
            },
            accountSetup: {
                username: formData.accountSetup.username,
                password: formData.accountSetup.password,
                confirm_password: formData.accountSetup.confirm_password,
                lang: formData.accountSetup.lang
            }
        };
        createUserMutation.mutate(employeeData);
    };

    const handleAddAdmin = () => {
        if (!formData?.userInfo || !formData?.accountSetup) return;
        
        const adminData: AddAdminFormFields = {
            userInfo: formData.userInfo as AddAdminFormFields["userInfo"],
            accountSetup: {
                username: formData.accountSetup.username,
                password: formData.accountSetup.password,
                confirm_password: formData.accountSetup.confirm_password,
                lang: formData.accountSetup.lang
            }
        };

        addAdminMutation.mutate(adminData);
    };

    const handleSignup = () => {
        if (!formData?.signup || !formData?.branchInfo || !formData?.address || !formData?.payment) return;
        
        const signupData: SignupFormFields = {
            signup: {
                ...formData.signup,
                plan: formData.signup.plan
            },
            branchInfo: formData.branchInfo,
            address: formData.address,
            branchAddress: formData.branchAddress,
            payment: formData.payment
        };
        signupMutation.mutate(signupData);
    };

    // Determine which mutation is pending
    const getPendingMutation = () => {
        switch (form) {
            case "add-branch":
                return createBranchMutation.isPending;
            case "add-employee":
                return createUserMutation.isPending;
            case "add-admin":
                return addAdminMutation.isPending;
            case "signup":
                return signupMutation.isPending;
            default:
                return false;
        }
    };

    if (showSuccess) {
        return <Success form={form || "signup"} />;
    }

    const isPending = getPendingMutation();

    return (
        <div className="w-full min-h-[60vh] flex justify-center items-center to-white py-16 font-regular-eng">
            {/* Loading overlay */}
            {isPending && (
                <LoadingIndicator 
                    fullScreen 
                    text="Submitting..." 
                    className="bg-white/80"
                />
            )}

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-10 border border-gray-100 relative flex flex-col items-center">
                <h2 className="text-3xl font-bold text-center mb-2 text-primary-light">Preview</h2>
                
                {/* Data Summary */}
                <div className="w-full bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
                    <h3 className="text-lg font-semibold mb-3 text-primary-light">Summary</h3>
                    {formData ? (
                        <ul className="text-sm text-gray-700 space-y-2">
                            {/* Plan (Signup only) */}
                            {formData.plan && (
                                <li><span className="font-semibold">Plan: </span> {formData.plan}</li>
                            )}

                            {/* Signup Info */}
                            {formData.signup && (
                                <>
                                    <li><span className="font-semibold">Language: </span> {formData.signup.lang}</li>
                                    <li><span className="font-semibold">Business Name: </span> {formData.signup.business_name}</li>
                                    <li><span className="font-semibold">Name: </span> {formData.signup.fname} {formData.signup.lname}</li>
                                    <li><span className="font-semibold">Email: </span> {formData.signup.email}</li>
                                    <li><span className="font-semibold">Tel: </span> {formData.signup.phone}</li>
                                </>
                            )}

                            {/* Branch Info */}
                            {formData.branchInfo && (
                                <>
                                    <li><span className="font-semibold">Branch Name: </span> {formData.branchInfo.branch_name}</li>
                                    {form === "add-branch" && formData.branchInfo.contact_person_id && (
                                        <li><span className="font-semibold">Contact Person: </span> {getContactPersonName(formData.branchInfo.contact_person_id)}</li>
                                    )}
                                    {formData.branchInfo.email && (
                                        <li><span className="font-semibold">Branch Email: </span> {formData.branchInfo.email}</li>
                                    )}
                                    {formData.branchInfo.phone && (
                                        <li><span className="font-semibold">Branch Tel: </span> {formData.branchInfo.phone}</li>
                                    )}
                                    {formData.branchInfo.description && (
                                        <li><span className="font-semibold">Description: </span> {formData.branchInfo.description}</li>
                                    )}
                                </>
                            )}

                            {/* Main Address */}
                            {(() => {
                                const mainAddress = formData?.address || null;
                                if (!mainAddress) return null;
                                return (
                                    <li>
                                        <span className="font-semibold">Main Address: </span>
                                        {formatAddress(mainAddress)}
                                    </li>
                                );
                            })()}

                            {/* Branch Address (Signup only) */}
                            {(() => {
                                const useSame = formData?.signup?.use_same_address;
                                const branchAddr = formData?.branchAddress || (useSame ? formData?.address : null);
                                if (!branchAddr) return null;
                                return (
                                    <li>
                                        <span className="font-semibold">Branch Address: </span>
                                        {formatAddress(branchAddr)}
                                    </li>
                                );
                            })()}

                            {/* Payment Info */}
                            {formData.payment && (
                                <>
                                    <li><span className="font-semibold">Save Card: </span> {formData.payment.save_card ? "Yes" : "No"}</li>
                                    <li><span className="font-semibold">Auto Renewal: </span> {formData.payment.auto_renewal ? "Yes" : "No"}</li>
                                </>
                            )}

                            {/* User Info (Admin/Employee only) */}
                            {formData.userInfo && (
                                <>
                                    <li><span className="font-semibold">Name: </span> {formData.userInfo.fname} {formData.userInfo.lname}</li>
                                    <li><span className="font-semibold">Email: </span> {formData.userInfo.email}</li>
                                    <li><span className="font-semibold">Phone: </span> {formData.userInfo.phone}</li>
                                    <li><span className="font-semibold">Role: </span> {formData.userInfo.role}</li>
                                    <li><span className="font-semibold">Position: </span> {formData.userInfo.position}</li>
                                </>
                            )}

                            {/* Account Setup (Admin/Employee only) */}
                            {formData.accountSetup && (
                                <>
                                    <li><span className="font-semibold">Username: </span> {formData.accountSetup.username}</li>
                                    <li><span className="font-semibold">Language: </span> {formData.accountSetup.lang}</li>
                                </>
                            )}
                        </ul>
                    ) : (
                        <div className="text-gray-400">No data found.</div>
                    )}
                </div>

                {addressError && (
                    <div className="text-red-500 text-center mb-4">{addressError}</div>
                )}

                {/* Submit Button */}
                <div className="flex justify-between w-full mt-6">
                    <button
                        type="button"
                        onClick={onPrev}
                        className="bg-gray-200 text-gray-700 rounded-[10px] px-8 py-2 text-base font-semibold shadow-md hover:bg-gray-300 transition-all cursor-pointer flex items-center justify-center min-w-[100px]"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="bg-primary-light text-white rounded-[10px] px-8 py-2 text-base font-semibold shadow-md hover:bg-primary-dark transition-all cursor-pointer flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <LoadingIndicator size="sm" className="!mt-0" />
                        ) : (
                            'Submit'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Preview;