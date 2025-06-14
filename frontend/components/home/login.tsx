"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import LoadingIndicator from "@/components/common/loading-indicator";
import { useLogin, LoginFormInputs } from "@/hooks/auth-hooks";
import { getFirstAdminSlug, getFirstMerchantSlug } from "@/lib/utils";
import Cookies from 'js-cookie';

const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const loginMutation = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormInputs>();

    const onSubmit = async (data: LoginFormInputs) => {
        setError(null);
        try {
            const res = await loginMutation.mutateAsync(data);
            const { result, sessionId } = res;

            // Set session and role cookies
            if (sessionId) {
                Cookies.set('session_id', sessionId, {
                    path: '/',
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax'
                });
            }

            if (result.user.role) {
                Cookies.set('role', result.user.role, {
                    path: '/',
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax'
                });
            }

            // Handle redirect based on role and return URL
            const returnUrl = searchParams.get('from') || '/';
            const isAdmin = ['SUPER_ADMIN', 'OPS_ADMIN', 'SUPPORT_AGENT', 'DEVELOPER'].includes(result.user.role);
            
            if (isAdmin) {
                const firstAdminSlug = getFirstAdminSlug();
                router.push(returnUrl.startsWith('/admin') ? returnUrl : `/admin/${firstAdminSlug}`);
            } else if (result.user.role === 'MERCHANT') {
                const firstMerchantSlug = getFirstMerchantSlug();
                router.push(returnUrl.startsWith('/merchant') ? returnUrl : `/merchant/${firstMerchantSlug}`);
            } else {
                router.push(returnUrl);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        }
    };

    const isLoading = loginMutation.isPending;

    return (
        <div className="min-h-screen flex items-center justify-center max-w-[1200px] mx-auto font-regular-eng">
            {/* Loading overlay */}
            {isLoading && (
                <LoadingIndicator 
                    fullScreen 
                    text="Signing in..." 
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
                                {...register("email", { 
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                {...register("password", { 
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters"
                                    }
                                })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>
                                        {/* Privacy Policy and Terms of Service */}
                        <div className="text-xs mb-2">
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

                        <div className="text-center">
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
