"use client";

import React from "react";
import { useForm } from "@/constant/form-provider";
import type { UseFormReturn } from "react-hook-form";
import { AddAdminFormFields } from "@/types/form";
import Cookies from "js-cookie";

const COOKIE_KEY = "signupForm";

const languageOptions = [
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-HK', label: '繁體中文 (香港)' },
    { value: 'zh-TW', label: '繁體中文 (台灣)' },
];

interface AccountSetupProps {
    onNext?: () => void;
    onPrev?: () => void;
}

const AccountSetup: React.FC<AccountSetupProps> = ({ onNext, onPrev }) => {
    const { formMethods } = useForm();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = (formMethods as unknown) as UseFormReturn<AddAdminFormFields["accountSetup"]>;

    const password = watch("password");

    // Load from cookie if available
    React.useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);
        if (cookie) {
            try {
                const parsed = JSON.parse(cookie);
                if (parsed.accountSetup) {
                    Object.entries(parsed.accountSetup).forEach(([key, value]) => {
                        setValue(key as keyof AddAdminFormFields["accountSetup"], value as string);
                    });
                }
            } catch {}
        }
    }, [setValue]);

    const onSubmit = (data: AddAdminFormFields["accountSetup"]) => {
        // Save to cookie
        const cookie = Cookies.get(COOKIE_KEY);
        let cookieData = {};
        if (cookie) {
            try {
                cookieData = JSON.parse(cookie);
            } catch {}
        }
        Cookies.set(COOKIE_KEY, JSON.stringify({ ...cookieData, accountSetup: data }));
        // Advance to next step
        if (onNext) onNext();
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex justify-center items-center py-8 font-regular-eng"
        >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-100 relative">
                <h2 className="text-3xl font-bold text-center mb-4 text-primary-light">Account Setup</h2>

                {/* Username */}
                <div>
                    <label htmlFor="username" className="block mb-1 font-semibold text-text-main text-sm">Username</label>
                    <input
                        id="username"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.username ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("username", { required: "Username is required" })}
                        placeholder="Enter username"
                    />
                    {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block mb-1 font-semibold text-text-main text-sm">Password</label>
                    <input
                        id="password"
                        type="password"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.password ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("password", { 
                            required: "Password is required",
                            minLength: {
                                value: 8,
                                message: "Password must be at least 8 characters"
                            },
                            pattern: {
                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
                            }
                        })}
                        placeholder="Enter password"
                    />
                    {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block mb-1 font-semibold text-text-main text-sm">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.confirmPassword ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("confirmPassword", { 
                            required: "Please confirm your password",
                            validate: value => value === password || "Passwords do not match"
                        })}
                        placeholder="Confirm password"
                    />
                    {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>}
                </div>

                {/* Language Selection */}
                <div>
                    <label htmlFor="lang" className="block mb-1 font-semibold text-text-main text-sm">Preferred Language</label>
                    <select
                        id="lang"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.lang ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("lang", { required: "Please select your preferred language" })}
                        defaultValue=""
                    >
                        <option value="" disabled>Select Language</option>
                        {languageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.lang && <span className="text-red-500 text-xs">{errors.lang.message}</span>}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <button
                        type="button"
                        className="border border-gray-300 bg-gray-200 text-gray-700 rounded-[10px] px-8 py-2 text-base font-semibold shadow-sm hover:bg-gray-100 transition-all cursor-pointer"
                        onClick={onPrev}
                    >
                        Previous
                    </button>

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

export default AccountSetup;