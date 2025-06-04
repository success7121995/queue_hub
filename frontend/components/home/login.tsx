"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useDateTime } from "@/constant/datetime-provider";
import LoadingIndicator from "@/components/common/loading-indicator";

type LoginFormInputs = {
    email: string;
    password: string;
};

const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormInputs>();

    const loginMutation = useMutation({
        mutationFn: async (data: LoginFormInputs) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            return response.json();
        },
        onSuccess: (data) => {
            if (data.redirect) {
                router.push(data.redirect);
            } else {
                router.push('/404');
            }
        },
        onError: (error: Error) => {
            setError(error.message);
        }
    });

    const onSubmit = (data: LoginFormInputs) => {
        setError(null);
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center max-w-[1200px] mx-auto font-regular-eng">
            {/* Loading overlay */}
            {loginMutation.isPending && (
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
                        <h1 className="text-2xl font-bold">Welcome back</h1>
                        <p className="mt-2 text-gray-600">Please sign in to your account</p>
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

                        <div>
                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loginMutation.isPending ? (
                                    <LoadingIndicator size="sm" className="!mt-0" />
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link href="/signup" className="font-medium text-orange-600 hover:text-orange-500">
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
