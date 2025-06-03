"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

type LoginFormInputs = {
    email: string;
    password: string;
};

// const loginMutation = useMutation({
//     mutationFn: async (data: LoginFormInputs) => {
//         const res = await fetch("/api/login", {
//             method: "POST",
//             body: JSON.stringify(data),
//             headers: { "Content-Type": "application/json" },
//             credentials: "include"
//     });
   
//       const result = await res.json();
  
//     if (!res.ok) {
//         throw new Error(result.message || "Login failed");
//     }
  
//         return result;
//     },
//     onSuccess: (data) => {
//         console.log("Login success", data);
//         // 例如 redirect：
//         window.location.href = data.redirect;
//     },
//     onError: (err: any) => {
//         console.error("Login error:", err.message);
//     }
//   });
  

const Login = () => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormInputs>();

    /**
     * Handle form submission
     * @param data - LoginFormInputs
     */
    const onSubmit = (data: LoginFormInputs) => {
        console.log("✅ Form Data:", data);
        // TODO: Call API or handle login logic here
    };

    return (
        <div className="min-h-screen flex items-center justify-center max-w-[1200px] mx-auto font-regular-eng">
            {/* Left: Image Placeholder */}
            <div className="hidden lg:flex flex-1 items-center justify-center">
                <div className="w-[480px] h-[480px] rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-4xl">🖼️</span>
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 font-regular-eng">
                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
                <h1 className="text-4xl text-center mb-6 font-semibold text-primary-light">Sign In</h1>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block mb-1 font-semibold text-text-main text-sm sm:text-base">Email</label>
                    <input
                    id="email"
                    type="email"
                    placeholder="Enter your Email"
                    autoComplete="email"
                    {...register("email", { required: "Email is required" })}
                    className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.email ? "border-red-500" : "border-gray-400"
                    }`}
                    />
                    {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block mb-1 font-semibold text-text-main text-sm sm:text-base">Password</label>
                    <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...register("password", { required: "Password is required" })}
                    className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.password ? "border-red-500" : "border-gray-400"
                    }`}
                    />
                    {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                    )}
                </div>

                <div className="flex justify-between text-xs">
                    <Link href="#" className="hover:underline text-primary-light font-semibold">Forgot password?</Link>
                    <Link href="#" className="hover:underline">Help</Link>
                </div>

                <div className="text-xs mb-2">
                    By signing in, I agree to <span className="font-bold text-primary">QueueHub</span>'s <br />
                    <Link href="#" className="underline">Privacy Policy</Link> and <Link href="#" className="underline">Terms of Service</Link>
                </div>

                <div className="flex justify-end">
                    <button
                    type="submit"
                    className="bg-primary-light text-white rounded-[5px] px-8 py-2 text-base font-semibold hover:bg-primary-dark transition-all cursor-pointer"
                    onClick={() => router.push("/dashboard/1/view-live-queues")}
                    >
                    Sign In
                    </button>
                </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
