"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { SignupFormFields } from "@/types/form";
import { useForm } from "@/constant/form-provider";
import type { UseFormReturn } from "react-hook-form";
import Link from "next/link";

type Plan = "TRIAL" | "ESSENTIAL" | "GROWTH";

interface SignupProps {
  onNext?: () => void;
}

interface CookieData {
    address?: Record<string, any>;
    branchAddress?: Record<string, any>;
    signup?: Record<string, any>;
    plan?: string;
    [key: string]: any;
}

const plans = [
  { name: "Free Trial", description: "Start 30-day trial", price: "FREE", value: "TRIAL" },
  { name: "Essential Plan", description: "Perfect for individual shops, restaurants, clinics, and service providers.", price: "50 USD / per month", value: "ESSENTIAL" },
  { name: "Growth Plan", description: "Best for businesses with multiple branches and growing customer volume.", price: "75 USD / per month", value: "GROWTH" },
];

const COOKIE_KEY = "signupForm";

const Signup: React.FC<SignupProps> = ({ onNext }) => {
    const { formMethods } = useForm();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = formMethods as UseFormReturn<SignupFormFields["signup"]>;

    // Plan selection managed locally
    const [selectedPlan, setSelectedPlan] = useState<Plan>("TRIAL");

    // Load from cookie if available
    useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);
        if (cookie) {
            try {
                const parsed = JSON.parse(cookie);
                if (parsed.signup) {
                    Object.entries(parsed.signup).forEach(([key, value]) => {
                        if (key !== 'password' && key !== 'confirm_password') {
                            setValue(key as keyof SignupFormFields["signup"], value as string);
                        }
                    });
                }
                if (parsed.plan) {
                    setSelectedPlan(parsed.plan);
                }
            } catch (error) {
                console.error("Error parsing cookie:", error);
            }
        }
    }, [setValue]);

    const onSubmit = (data: SignupFormFields["signup"]) => {
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

        // Only store signup-specific data
        const signupData = {
            plan: selectedPlan,
            lang: data.lang,
            business_name: data.business_name,
            fname: data.fname,
            lname: data.lname,
            username: data.username,
            email: data.email,
            phone: data.phone,
            password: data.password,
            confirm_password: data.confirm_password,
            use_same_address: cookieData.signup?.use_same_address ?? true
        };

        // Preserve existing data but update signup and plan
        const { signup, plan, ...existingData } = cookieData;
        Cookies.set(COOKIE_KEY, JSON.stringify({
            ...existingData,
            signup: signupData,
            plan: selectedPlan
        }));

        if (onNext) onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-10 w-full justify-center items-center py-8 lg:items-start font-regular-eng">
            {/* Plan Selection */}
            <div className="w-full md:w-1/2 max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-primary-light">Choose Your Plan</h2>
                <div className="flex flex-col gap-5">
                    {plans.map((plan) => (
                        <button
                            key={plan.value}
                            type="button"
                            className={`w-full text-left border-2 rounded-2xl px-6 py-5 transition-all duration-200 shadow-sm flex items-center justify-between gap-4 focus:outline-none text-base font-medium ${
                                selectedPlan === plan.value
                                    ? "bg-primary-light/10 border-primary-light ring-2 ring-primary-light"
                                    : "bg-white border-gray-200 hover:border-primary-light"
                            }`}
                            onClick={() => setSelectedPlan(plan.value as Plan)}
                        >
                            <div>
                                <div className="font-bold text-lg mb-1 text-primary-light">{plan.name}</div>
                                <div className="text-xs text-gray-600 font-normal">{plan.description}</div>
                            </div>
                            <div className="text-right font-semibold text-base whitespace-nowrap text-primary-light">
                                {plan.price}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sign Up Form */}
            <div className="w-full md:w-1/2 max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border border-gray-100 relative">
                <h2 className="text-3xl font-bold text-center mb-4 text-primary-light">Sign Up</h2>

                {/* Language */}
                <div>
                    <label htmlFor="lang" className="block mb-1 font-semibold text-text-main text-sm">Language</label>
                    <select 
                        id="lang" 
                        className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                        {...register("lang", { required: "Language is required" })}
                    >
                        <option value="EN">English</option>
                        <option value="ZH_HK">繁體中文 (香港)</option>
                        <option value="ZH_TW">繁體中文 (台灣)</option>
                        <option value="ZH_CH">简体中文 (中国大陆)</option>
                    </select>
                    {errors.lang && <p className="text-xs text-red-500 mt-1">{errors.lang.message}</p>}
                </div>

                {/* Business Name */}
                <div>
                    <label htmlFor="business_name" className="block mb-1 font-semibold text-text-main text-sm">Business Name</label>
                    <input
                        id="business_name"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            errors.business_name ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("business_name", { required: "Business name is required" })}
                        placeholder="Enter your business name"
                    />
                    {errors.business_name && <p className="text-xs text-red-500 mt-1">{errors.business_name.message}</p>}
                </div>

                {/* First Name and Last Name */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label htmlFor="fname" className="block mb-1 font-semibold text-text-main text-sm">First Name</label>
                        <input
                            id="fname"
                            className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                errors.fname ? "border-red-500" : "border-gray-400"
                            }`}
                            {...register("fname", { required: "First name is required" })}
                            placeholder="Enter your first name"
                        />
                        {errors.fname && <span className="text-red-500 text-xs">{errors.fname.message}</span>}
                    </div>
                    <div className="flex-1">
                        <label htmlFor="lname" className="block mb-1 font-semibold text-text-main text-sm">Last Name</label>
                        <input
                            id="lname"
                            className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                errors.lname ? "border-red-500" : "border-gray-400"
                            }`}
                            {...register("lname", { required: "Last name is required" })}
                            placeholder="Enter your last name"
                        />
                        {errors.lname && <span className="text-red-500 text-xs">{errors.lname.message}</span>}
                    </div>
                </div>

                {/* Username */}
                <div>
                    <label htmlFor="username" className="block mb-1 font-semibold text-text-main text-sm">Username</label>
                    <input
                        id="username"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            errors.username ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("username", { required: "Username is required" })}
                        placeholder="Enter your username"
                    />
                    {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block mb-1 font-semibold text-text-main text-sm">Email</label>
                    <input
                        id="email"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            errors.email ? "border-red-500" : "border-gray-400"
                        }`}
                        type="email"
                        {...register("email", { 
                            required: "Email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                            }
                        })}
                        placeholder="Enter your email"
                    />
                    {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                </div>

                {/* Business Tel */}
                <div>
                    <label htmlFor="phone" className="block mb-1 font-semibold text-text-main text-sm">Business Tel</label>
                    <input
                        id="phone"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            errors.phone ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("phone", { 
                            required: "Business Tel is required",
                            pattern: {
                                value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                                message: "Invalid telephone number"
                            }
                        })}
                        placeholder="Enter your business tel"
                    />
                    {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block mb-1 font-semibold text-text-main text-sm">Password</label>
                    <input
                        id="password"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            errors.password ? "border-red-500" : "border-gray-400"
                        }`}
                        type="password"
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
                        placeholder="Enter your password"
                    />
                    {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirm_password" className="block mb-1 font-semibold text-text-main text-sm">Confirm Password</label>
                    <input
                        id="confirm_password"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            errors.confirm_password ? "border-red-500" : "border-gray-400"
                        }`}
                        type="password"
                        {...register("confirm_password", { 
                            required: "Please confirm your password",
                            validate: value => value === watch("password") || "Passwords do not match"
                        })}
                        placeholder="Confirm your password"
                    />
                    {errors.confirm_password && <span className="text-red-500 text-xs">{errors.confirm_password.message}</span>}
                </div>

                {/* Privacy Policy and Terms of Service */}
                <div className="text-xs mb-2">
                    By proceeding, I agree to <span className="font-bold text-primary">QueueHub</span>'s <br />
                    <Link href="/privacy-policy" className="underline">Privacy Policy</Link> and <Link href="/terms-of-service" className="underline">Terms of Service</Link>
                </div>

                {/* Next Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-primary-light text-white rounded-[10px] px-8 py-2 text-base font-semibold shadow-md hover:bg-primary-dark transition-all cursor-pointer"
                    >
                        Next
                    </button>
                </div>
            </div>
        </form>
    );
};

export default Signup;