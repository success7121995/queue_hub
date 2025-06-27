"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "@/constant/form-provider";
import type { UseFormReturn } from "react-hook-form";
import { AddAdminFormFields } from "@/types/form";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/auth-hooks";
import { CountryDialingDropdown, useDialingCode } from "@/constant/dialing-code-provider";

const COOKIE_KEY = "signupForm";

const roleOptions = [
    { value: "OWNER", label: "Owner" },
    { value: "MANAGER", label: "Manager" },
    { value: "FRONTLINE", label: "Frontline" },
];

const adminRoleOptions = [
    { value: "OPS_ADMIN", label: "Operations Admin" },
    { value: "SUPPORT_AGENT", label: "Support Agent" },
    { value: "DEVELOPER", label: "Developer" }
]

interface UserInfoProps {
    onNext?: () => void;
    onPrev?: () => void;
    formType: "add-admin" | "add-employee";
}

const UserInfo: React.FC<UserInfoProps> = ({ onNext, formType }) => {
    const { formMethods } = useForm();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = (formMethods as unknown) as UseFormReturn<AddAdminFormFields["userInfo"]>;

    // Get current user's role for role-based access control
    const { data: currentUser } = useAuth();
    const currentUserRole = currentUser?.user?.UserMerchant?.role;

    // Filter role options based on current user's role
    const getFilteredRoleOptions = () => {
        if (formType === "add-admin") {
            return adminRoleOptions;
        }

        // For add-employee form, apply role-based restrictions
        if (formType === "add-employee") {
            if (currentUserRole === "OWNER") {
                // Owners can assign all roles
                return roleOptions;
            } else if (currentUserRole === "MANAGER") {
                // Managers can only assign FRONTLINE and MANAGER roles
                return roleOptions.filter(option => 
                    option.value === "FRONTLINE" || option.value === "MANAGER"
                );
            } else {
                // FRONTLINE users cannot assign any roles (should not have access to this form anyway)
                return [];
            }
        }

        return roleOptions;
    };

    const filteredRoleOptions = getFilteredRoleOptions();

    const { dialingCode, setDialingCode } = useDialingCode();
    const [localPhone, setLocalPhone] = useState("");

    // Load phone from cookie if available
    useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);
        if (cookie) {
            try {
                const parsed = JSON.parse(cookie);
                if (parsed.userInfo && parsed.userInfo.phone) {
                    const parts = parsed.userInfo.phone.split("-");
                    if (parts.length === 2) {
                        setDialingCode(parts[0]);
                        setLocalPhone(parts[1]);
                    }
                }
            } catch {}
        }
    }, [setDialingCode]);

    // Combine dialing code and local phone for form value
    useEffect(() => {
        if (localPhone) {
            setValue("phone", `${dialingCode}-${localPhone}`);
        }
    }, [dialingCode, localPhone, setValue]);

    // Load from cookie if available
    React.useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);
        if (cookie) {
            try {
                const parsed = JSON.parse(cookie);
                if (parsed.userInfo) {
                    Object.entries(parsed.userInfo).forEach(([key, value]) => {
                        setValue(key as keyof AddAdminFormFields["userInfo"], value as string);
                    });
                }
            } catch {}
        }
    }, [setValue]);

    const onSubmit = (data: AddAdminFormFields["userInfo"]) => {
        console.log(data);
        // Save to cookie
        const cookie = Cookies.get(COOKIE_KEY);
        let cookieData = {};
        if (cookie) {
            try {
                cookieData = JSON.parse(cookie);
            } catch {}
        }
        Cookies.set(COOKIE_KEY, JSON.stringify({ ...cookieData, userInfo: data }));

        // Advance to next step
        if (onNext) onNext();
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex justify-center items-center py-8 font-regular-eng"
        >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-100 relative">
                <h2 className="text-3xl font-bold text-center mb-4 text-primary-light">User Information</h2>

                {/* First Name & Last Name */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="firstName" className="block mb-1 font-semibold text-text-main text-sm">First Name</label>
                        <input
                            id="firstName"
                            className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.fname ? "border-red-500" : "border-gray-400"
                            }`}
                            {...register("fname", { required: "First name is required" })}
                            placeholder="Enter first name"
                        />
                        {errors.fname && <span className="text-red-500 text-xs">{errors.fname.message}</span>}
                    </div>

                    <div className="flex-1">
                        <label htmlFor="lastName" className="block mb-1 font-semibold text-text-main text-sm">Last Name</label>
                        <input
                            id="lastName"
                            className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.lname ? "border-red-500" : "border-gray-400"
                            }`}
                            {...register("lname", { required: "Last name is required" })}
                            placeholder="Enter last name"
                        />
                        {errors.lname && <span className="text-red-500 text-xs">{errors.lname.message}</span>}
                    </div>
                </div>

                {/* Staff ID */}
                <div>
                    <label htmlFor="staffId" className="block mb-1 font-semibold text-text-main text-sm">Staff ID</label>
                    <input
                        id="staffId"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.staff_id ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("staff_id")}
                        placeholder="Enter staff ID"
                    />
                    {errors.staff_id && <span className="text-red-500 text-xs">{errors.staff_id.message}</span>}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block mb-1 font-semibold text-text-main text-sm">Email</label>
                    <input
                        id="email"
                        type="email"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.email ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("email", { 
                            required: "Email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                            }
                        })}
                        placeholder="Enter email"
                    />
                    {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                </div>

                {/* Phone */}
                <div>
                    <label htmlFor="phone" className="block mb-1 font-semibold text-text-main text-sm">Phone Number</label>
                    <div className="flex gap-2 items-center">
                        <CountryDialingDropdown />
                        <input
                            id="phone"
                            className={`flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.phone ? "border-red-500" : "border-gray-400"
                            }`}
                            value={localPhone}
                            onChange={e => setLocalPhone(e.target.value)}
                            placeholder="Enter phone number"
                        />
                    </div>
                    {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                </div>

                {/* Position */}
                <div>
                    <label htmlFor="position" className="block mb-1 font-semibold text-text-main text-sm">Position</label>
                    <input
                        id="position"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.position ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("position", { required: "Position is required" })}
                        placeholder="Enter position"
                    />
                    {errors.position && <span className="text-red-500 text-xs">{errors.position.message}</span>}
                </div>

                {/* Role */}
                <div>
                    <label htmlFor="role" className="block mb-1 font-semibold text-text-main text-sm">Role</label>
                    <select
                        id="role"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.role ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("role", { required: "Role is required" })}
                        defaultValue=""
                    >
                        <option value="" disabled>Select Role</option>
                        {formType === "add-admin" ? adminRoleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        )) : filteredRoleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.role && <span className="text-red-500 text-xs">{errors.role.message}</span>}
                    {formType === "add-employee" && filteredRoleOptions.length === 0 && (
                        <span className="text-orange-500 text-xs">
                            You don't have permission to assign roles.
                        </span>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">

                    {/* First Button */}
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

export default UserInfo;