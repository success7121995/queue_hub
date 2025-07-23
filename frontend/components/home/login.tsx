"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingIndicator from "@/components/common/loading-indicator";
import { useLogin, useAuth, LoginFormInputs } from "@/hooks/auth-hooks";
import { AdminRole, getFirstAdminSlug, getFirstMerchantSlug, MerchantRole, checkExistingSession } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import Cookies from 'js-cookie';

// Define the backend base URL explicitly for production
const BACKEND_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://queue-hub-backend.onrender.com'
  : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5500');

const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const loginMutation = useLogin();
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Check for existing valid session on component mount
     */
    useEffect(() => {
        const checkSession = async () => {
            const { isAuthenticated, user } = await checkExistingSession();
            
            if (isAuthenticated && user) {
                // Valid session exists, redirect to appropriate dashboard
                const returnUrl = searchParams.get('from') || '/';
                
                if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'OPS_ADMIN' || user.role === 'SUPPORT_AGENT' || user.role === 'DEVELOPER') {
                    const firstAdminSlug = getFirstAdminSlug(user.UserAdmin?.role as AdminRole);
                    router.push(returnUrl.startsWith('/admin') ? returnUrl : `/admin/${firstAdminSlug}`);
                } else if (user.role === 'MERCHANT' || user.role === 'OWNER' || user.role === 'MANAGER' || user.role === 'FRONTLINE') {
                    const firstMerchantSlug = getFirstMerchantSlug(user.UserMerchant?.role as MerchantRole);
                    router.push(returnUrl.startsWith('/merchant') ? returnUrl : `/merchant/${firstMerchantSlug}`);
                } else {
                    router.push(returnUrl);
                }
                return;
            }
            
            setIsCheckingSession(false);
        };

        checkSession();
    }, [router, searchParams]);

    /**
     * Toggle password visibility
     */
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormInputs>();

    const onSubmit = async (data: LoginFormInputs) => {
        setError(null);
        setIsProcessing(true);
        
        try {
            const res = await loginMutation.mutateAsync(data);
            const { result } = res;

            // Handle redirect based on role and return URL
            const returnUrl = searchParams.get('from') || '/';
            const isAdmin = result.user.role === 'ADMIN';
            
            // Keep loading state active during navigation
            if (isAdmin) {
                const firstAdminSlug = getFirstAdminSlug(result.userAdmin?.role as AdminRole);
                router.push(returnUrl.startsWith('/admin') ? returnUrl : `/admin/${firstAdminSlug}`);
            } else if (result.user.role === 'MERCHANT') {
                const firstMerchantSlug = getFirstMerchantSlug(result.userMerchant?.role as MerchantRole);
                router.push(returnUrl.startsWith('/merchant') ? returnUrl : `/merchant/${firstMerchantSlug}`);
            } else {
                router.push(returnUrl);
            }
            // Note: isProcessing remains true during navigation to keep loading state
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
            setIsProcessing(false);
        }
    };

    const isLoading = loginMutation.isPending || isProcessing || isCheckingSession;
    
    // Determine loading text based on current state
    const getLoadingText = () => {
        if (isCheckingSession) return "Loading...";
        if (loginMutation.isPending) return "Signing in...";
        if (isProcessing) return "Redirecting...";
        return "Loading...";
    };

    // Show loading while checking session
    if (isCheckingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingIndicator 
                    fullScreen 
                    text={getLoadingText()} 
                    className="bg-white/80"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center max-w-[1200px] mx-auto font-regular-eng">
            {/* Loading overlay */}
            {isLoading && (
                <LoadingIndicator 
                    fullScreen 
                    text={getLoadingText()} 
                    className="bg-white/80"
                />
            )}

            {/* Left: Image Placeholder */}
            <div className="hidden lg:flex flex-1 items-center justify-center">
                <div className="w-[480px] h-[480px] rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">🖼️</span>
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex-1 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-primary-light">Welcome Back</h1>
                        <p className="mt-2 text-text-main">Please sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                disabled={isLoading}
                                {...register("email", { 
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                disabled={isLoading}
                                {...register("password", { 
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters"
                                    }
                                })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                                placeholder="Enter your password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-[68%] -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Privacy Policy and Terms of Service */}
                        <div className={`text-xs mb-2 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
                            By proceeding, I agree to <span className="font-bold text-primary">QueueHub</span>'s <br />
                            <Link href="/privacy-policy" className="underline">Privacy Policy</Link> and <Link href="/terms-of-service" className="underline">Terms of Service</Link>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-[100px] flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                {isLoading ? (
                                    <LoadingIndicator size="sm" className="!mt-0" />
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>

                        <div className={`text-center ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link href="/signup" className="font-medium text-primary hover:text-primary-hover">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
