"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "@/constant/form-provider";
import type { UseFormReturn } from "react-hook-form";
import { AddAdminFormFields } from "@/types/form";
import { useLang, type Lang } from "@/constant/lang-provider";
import Cookies from "js-cookie";
import { fetchUniqueUsernameAndEmail } from "@/hooks/auth-hooks";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";

const COOKIE_KEY = "signupForm";

interface AccountSetupProps {
    onNext?: () => void;
    onPrev?: () => void;
}

const AccountSetup: React.FC<AccountSetupProps> = ({ onNext, onPrev }) => {
    const { lang, langsOptions } = useLang();
    const { formMethods } = useForm();
    const {
        register,
        handleSubmit,
        setValue,
        setError,
        watch,
        formState: { errors },
    } = (formMethods as unknown) as UseFormReturn<AddAdminFormFields["accountSetup"]>;

    const password = watch("password");

    // Validation states
    const [usernameChecked, setUsernameChecked] = useState(false);
    const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Password visibility states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Watch form values
    const watchedUsername = watch("username");

    // Reset validation when values change
    useEffect(() => {
        if (watchedUsername) {
            setUsernameChecked(false);
            setUsernameValid(null);
        }
    }, [watchedUsername]);

    // Check username uniqueness
    const handleCheckUsername = async () => {
        if (!watchedUsername || watchedUsername.length < 3) {
            return;
        }
        setIsCheckingUsername(true);
        setUsernameChecked(true);
        
        try {
            const result = await fetchUniqueUsernameAndEmail(watchedUsername, undefined);
            setUsernameValid(result.isUniqueUsername);
        } catch (error) {
            console.error('Error checking username uniqueness:', error);
            setUsernameValid(false);
        } finally {
            setIsCheckingUsername(false);
        }
    };

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
        // Validate that username has been checked and is valid
        if (!usernameChecked) {
            setError("username", {
                type: "manual",
                message: "Please check username availability before proceeding."
            });
            return;
        }

        if (usernameValid === false) {
            setError("username", {
                type: "manual",
                message: "Please ensure username is available before proceeding."
            });
            return;
        }

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

                {/* Username with Check Button */}
                <div>
                    <label htmlFor="username" className="block mb-1 font-semibold text-text-main text-sm">Username</label>
                    <div className="flex gap-2">
                        <input
                            id="username"
                            className={`flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.username ? "border-red-500" : "border-gray-400"
                            }`}
                            {...register("username", { required: "Username is required" })}
                            placeholder="Enter username"
                        />
                        <button
                            type="button"
                            onClick={handleCheckUsername}
                            disabled={!watchedUsername || watchedUsername.length < 3 || isCheckingUsername}
                            className="px-3 py-1 bg-primary-light text-white rounded text-sm font-medium hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isCheckingUsername ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Check"
                            )}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        {usernameChecked && usernameValid !== null && (
                            <>
                                {usernameValid ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className={`text-xs ${usernameValid ? 'text-green-600' : 'text-red-600'}`}>
                                    {usernameValid ? 'Username is available' : 'Username is already taken'}
                                </span>
                            </>
                        )}
                    </div>
                    {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
                </div>

                {/* Password with Visibility Toggle */}
                <div>
                    <label htmlFor="password" className="block mb-1 font-semibold text-text-main text-sm">Password</label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className={`w-full border rounded px-2 py-1 pr-10 focus:outline-none focus:ring-2 focus:ring-primary ${
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
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                </div>

                {/* Confirm Password with Visibility Toggle */}
                <div>
                    <label htmlFor="confirm_password" className="block mb-1 font-semibold text-text-main text-sm">Confirm Password</label>
                    <div className="relative">
                        <input
                            id="confirm_password"
                            type={showConfirmPassword ? "text" : "password"}
                            className={`w-full border rounded px-2 py-1 pr-10 focus:outline-none focus:ring-2 focus:ring-primary ${
                                errors.confirm_password ? "border-red-500" : "border-gray-400"
                            }`}
                            {...register("confirm_password", { 
                                required: "Please confirm your password",
                                validate: value => value === password || "Passwords do not match"
                            })}
                            placeholder="Confirm password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.confirm_password && <span className="text-red-500 text-xs">{errors.confirm_password.message}</span>}
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
                        {langsOptions.map((option: { label: string, value: Lang, icon: React.ReactNode }) => (
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