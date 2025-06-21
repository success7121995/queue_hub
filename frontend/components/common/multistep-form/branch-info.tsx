"use client";

import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useForm } from "@/constant/form-provider";
import type { UseFormReturn } from "react-hook-form";
import { AddBranchFormFields, SignupFormFields } from "@/types/form";
import { useUserMerchants } from "@/hooks/merchant-hooks";
import { useAuth } from "@/hooks/auth-hooks";

const COOKIE_KEY = "signupForm";

interface BranchInfoProps {
    onNext?: () => void;
    onPrev?: () => void;
    formType?: "signup" | "add-branch";
}

interface CookieData {
    branchInfo?: AddBranchFormFields["branchInfo"] | SignupFormFields["branchInfo"];
    address?: Record<string, any>;
    branchAddress?: Record<string, any>;
    signup?: Record<string, any>;
    [key: string]: any;
}

const BranchInfo: React.FC<BranchInfoProps> = ({ onNext, onPrev, formType = "signup" }) => {
    const { formMethods } = useForm();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        formState: { errors },
    } = (formMethods as unknown) as UseFormReturn<AddBranchFormFields["branchInfo"] | SignupFormFields["branchInfo"]>;

    // Get merchant ID for fetching staff members
    const { data: currentUser } = useAuth();
    const merchantId = currentUser?.user?.UserMerchant?.merchant_id;
    const { data: userMerchants } = useUserMerchants(merchantId || '');

    // Load from cookie if available
    useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);
        if (cookie) {
            try {
                const parsed: CookieData = JSON.parse(cookie);
                if (parsed.branchInfo) {
                    Object.entries(parsed.branchInfo).forEach(([key, value]) => {
                        setValue(key as keyof (AddBranchFormFields["branchInfo"] | SignupFormFields["branchInfo"]), value as any);
                    });
                }
            } catch (error) {
                console.error("Error parsing cookie:", error);
            }
        }
    }, [setValue]);

    const onSubmit = (data: AddBranchFormFields["branchInfo"] | SignupFormFields["branchInfo"]) => {
        // Save to cookie
        const cookie = Cookies.get(COOKIE_KEY);
        let cookieData: CookieData = {};
        if (cookie) {
            try {
                cookieData = JSON.parse(cookie);
            } catch (error) {
                console.error("Error parsing cookie:", error);
            }
        }

        // Only store branch-specific data
        const branchInfoData = {
            contact_person_id: data.contact_person_id,
            branch_name: data.branch_name,
            email: data.email,
            phone: data.phone,
            description: data.description,
        };

        // Preserve existing data but update branchInfo
        const { branchInfo, ...existingData } = cookieData;
        Cookies.set(COOKIE_KEY, JSON.stringify({
            ...existingData,
            branchInfo: branchInfoData
        }));

        if (onNext) onNext();
    };

    // Get staff options for contact person selection
    const staffOptions = userMerchants?.user_merchants?.map((staff: any) => ({
        value: staff.staff_id,
        label: `${staff.User?.fname || ''} ${staff.User?.lname || ''}`.trim() || staff.staff_id
    })) || [];

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex justify-center items-center py-8 font-regular-eng"
        >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-100 relative">
                <h2 className="text-3xl font-bold text-center mb-4 text-primary-light">Branch Information</h2>

                {/* Branch Name */}
                <div>
                    <label htmlFor="branch_name" className="block mb-1 font-semibold text-text-main text-sm">Branch Name</label>
                    <input
                        id="branch_name"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.branch_name ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("branch_name", { required: "Branch name is required" })}
                        placeholder="Enter branch name"
                    />
                    {errors.branch_name && <span className="text-red-500 text-xs">{errors.branch_name.message}</span>}
                </div>

                {/* Contact Person - Only show for add-branch form */}
                {formType === "add-branch" && (
                    <div>
                        <label htmlFor="contact_person_id" className="block mb-1 font-semibold text-text-main text-sm">
                            Contact Person <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="contact_person_id"
                            className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.contact_person_id ? "border-red-500" : "border-gray-400"
                            }`}
                            {...register("contact_person_id", { 
                                required: "Contact person is required",
                                validate: (value) => value !== "" || "Please select a contact person"
                            })}
                        >
                            <option value="">Select a contact person</option>
                            {staffOptions.map((staff) => (
                                <option key={staff.value} value={staff.value}>
                                    {staff.label}
                                </option>
                            ))}
                        </select>
                        {errors.contact_person_id && (
                            <span className="text-red-500 text-xs">{errors.contact_person_id.message}</span>
                        )}
                        {staffOptions.length === 0 && (
                            <span className="text-orange-500 text-xs">
                                No staff members available. Please add staff members first.
                            </span>
                        )}
                    </div>
                )}

                {/* Email (Optional) */}
                <div>
                    <label htmlFor="email" className="block mb-1 font-semibold text-text-main text-sm">Email <span className="text-gray-500 text-xs">Optional</span></label>
                    <input
                        id="email"
                        type="email"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.email ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("email", { 
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                            }
                        })}
                        placeholder="Enter email address"
                    />
                    {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                </div>

                {/* Branch Tel (Optional) */}
                <div>
                    <label htmlFor="phone" className="block mb-1 font-semibold text-text-main text-sm">Branch Tel <span className="text-gray-500 text-xs">Optional</span></label>
                    <input
                        id="phone"
                        type="tel"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.phone ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("phone", { 
                            pattern: {
                                value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                                message: "Invalid telephone number"
                            }
                        })}
                        placeholder="Enter branch telephone number"
                    />
                    {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                </div>

                {/* Description (Optional) */}
                <div>
                    <label htmlFor="description" className="block mb-1 font-semibold text-text-main text-sm">Description <span className="text-gray-500 text-xs">Optional</span></label>
                    <textarea
                        id="description"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] ${
                            errors.description ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("description")}
                        placeholder="Enter branch description"
                    />
                    {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                </div>

                {/* Next & Previous Buttons */}
                <div className="flex justify-between mt-6">
                    {/* Previous Button */}
                    {onPrev && (
                        <button
                            type="button"
                            className="border border-gray-300 bg-gray-200 text-gray-700 rounded-[10px] px-8 py-2 text-base font-semibold shadow-sm hover:bg-gray-100 transition-all cursor-pointer"
                            onClick={onPrev}
                        >
                            Previous
                        </button>
                    )}

                    {/* Next Button */}
                    <button
                        type="submit"
                        className="bg-primary-light text-white rounded-[10px] px-8 py-2 text-base font-semibold shadow-sm hover:bg-primary-dark transition-all cursor-pointer"
                    >
                        Next
                    </button>
                </div>
            </div>
        </form>
    );
};

export default BranchInfo;