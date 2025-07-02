"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { SignupFormFields } from "@/types/form";
import { useForm } from "@/constant/form-provider";
import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import Link from "next/link";
import { useLang } from "@/constant/lang-provider";
import { useDialingCode, CountryDialingDropdown } from "@/constant/dialing-code-provider";
import { CountryDialingCode } from "@/types/form";
import { fetchUniqueUsernameAndEmail } from "@/hooks/auth-hooks";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";

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
    const { langsOptions } = useLang();
    const { dialingCodes, dialingCode, setDialingCode } = useDialingCode();
    const { formMethods } = useForm();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors },
    } = formMethods as UseFormReturn<SignupFormFields["signup"]>;

    // Plan selection managed locally
    const [selectedPlan, setSelectedPlan] = useState<Plan>("TRIAL");
    const [localPhoneNumber, setLocalPhoneNumber] = useState("");

    // Validation states
    const [usernameChecked, setUsernameChecked] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false);
    const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
    const [emailValid, setEmailValid] = useState<boolean | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    // Password visibility states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Watch form values
    const watchedUsername = watch("username");
    const watchedEmail = watch("email");

    // Reset validation when values change
    useEffect(() => {
        if (watchedUsername) {
            setUsernameChecked(false);
            setUsernameValid(null);
        }
    }, [watchedUsername]);

    useEffect(() => {
        if (watchedEmail) {
            setEmailChecked(false);
            setEmailValid(null);
        }
    }, [watchedEmail]);

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

    // Check email uniqueness
    const handleCheckEmail = async () => {
        if (!watchedEmail || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(watchedEmail)) {
            return;
        }
        setIsCheckingEmail(true);
        setEmailChecked(true);
        
        try {
            const result = await fetchUniqueUsernameAndEmail(undefined, watchedEmail);
            setEmailValid(result.isUniqueEmail);
        } catch (error) {
            console.error('Error checking email uniqueness:', error);
            setEmailValid(false);
        } finally {
            setIsCheckingEmail(false);
        }
    };

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
                    
                    // Extract dialing code and local number from stored phone
                    if (parsed.signup.phone) {
                        const phoneParts = parsed.signup.phone.split('-');
                        if (phoneParts.length === 2) {
                            const storedDialingCode = phoneParts[0];
                            const storedLocalNumber = phoneParts[1];
                            
                            // Update dialing code in context if it exists in our list
                            const matchingCode = dialingCodes.find(code => code.code === storedDialingCode);
                            if (matchingCode) {
                                setDialingCode(storedDialingCode as CountryDialingCode);
                            }
                            setLocalPhoneNumber(storedLocalNumber);
                        }
                    }
                }
                if (parsed.plan) {
                    setSelectedPlan(parsed.plan);
                }
            } catch (error) {
                console.error("Error parsing cookie:", error);
            }
        }
    }, [setValue, dialingCodes, setDialingCode]);

    // Update form value when dialing code or local number changes
    useEffect(() => {
        if (localPhoneNumber) {
            const combinedPhone = `${dialingCode}-${localPhoneNumber}`;
            setValue("phone", combinedPhone);
        }
    }, [dialingCode, localPhoneNumber, setValue]);

    const onSubmit = (data: SignupFormFields["signup"]) => {
        // Validate that both username and email have been checked and are valid
        if (!usernameChecked || !emailChecked) {
            alert("Please check both username and email availability before proceeding.");
            return;
        }

        if (usernameValid === false || emailValid === false) {
            alert("Please ensure both username and email are available before proceeding.");
            return;
        }

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
                        
                        {langsOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}

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

                {/* Username with Check Button */}
                <div>
                    <label htmlFor="username" className="block mb-1 font-semibold text-text-main text-sm">Username</label>
                    <div className="flex gap-2">
                        <input
                            id="username"
                            className={`flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                errors.username ? "border-red-500" : "border-gray-400"
                            }`}
                            {...register("username", { required: "Username is required" })}
                            placeholder="Enter your username"
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

                {/* Email with Check Button */}
                <div>
                    <label htmlFor="email" className="block mb-1 font-semibold text-text-main text-sm">Email</label>
                    <div className="flex gap-2">
                        <input
                            id="email"
                            className={`flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
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
                        <button
                            type="button"
                            onClick={handleCheckEmail}
                            disabled={!watchedEmail || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(watchedEmail) || isCheckingEmail}
                            className="px-3 py-1 bg-primary-light text-white rounded text-sm font-medium hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isCheckingEmail ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Check"
                            )}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        {emailChecked && emailValid !== null && (
                            <>
                                {emailValid ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className={`text-xs ${emailValid ? 'text-green-600' : 'text-red-600'}`}>
                                    {emailValid ? 'Email is available' : 'Email is already taken'}
                                </span>
                            </>
                        )}
                    </div>
                    {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                </div>

                {/* Business Tel with Dialing Code */}
                <div>
                    <label htmlFor="phone" className="block mb-1 font-semibold text-text-main text-sm">Business Tel</label>
                    <div className="flex gap-2 items-center">
                        {/* Reusable Country Dialing Dropdown */}
                        <CountryDialingDropdown />
                        {/* Phone Number Input */}
                        <Controller
                            name="phone"
                            control={control}
                            rules={{
                                required: "Business Tel is required",
                                pattern: {
                                    value: /^\+[0-9]+-[0-9]{7,15}$/,
                                    message: "Invalid phone number format"
                                }
                            }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    value={localPhoneNumber}
                                    onChange={(e) => setLocalPhoneNumber(e.target.value)}
                                    className={`flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                        errors.phone ? "border-red-500" : "border-gray-400"
                                    }`}
                                    placeholder="Enter phone number"
                                />
                            )}
                        />
                    </div>
                    {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                </div>

                {/* Password with Visibility Toggle */}
                <div>
                    <label htmlFor="password" className="block mb-1 font-semibold text-text-main text-sm">Password</label>
                    <div className="relative">
                        <input
                            id="password"
                            className={`w-full border rounded px-2 py-1 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                errors.password ? "border-red-500" : "border-gray-400"
                            }`}
                            type={showPassword ? "text" : "password"}
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
                            className={`w-full border rounded px-2 py-1 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                errors.confirm_password ? "border-red-500" : "border-gray-400"
                            }`}
                            type={showConfirmPassword ? "text" : "password"}
                            {...register("confirm_password", { 
                                required: "Please confirm your password",
                                validate: value => value === watch("password") || "Passwords do not match"
                            })}
                            placeholder="Confirm your password"
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