"use client";

import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useForm } from "@/constant/form-provider";
import type { UseFormReturn } from "react-hook-form";
import { SignupFormFields, } from "@/types/form";

const COOKIE_KEY = "signupForm";

interface PaymentProps {
    onNext?: () => void;
    onPrev?: () => void;
}

const Payment: React.FC<PaymentProps> = ({ onNext, onPrev }) => {
    const { formMethods } = useForm();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
    } = (formMethods as unknown) as UseFormReturn<SignupFormFields["payment"]>;

    /**
     * Get the last four digits of the card number
     */
    const lastFourDigits = watch("card_number")?.slice(-4);

    // Load from cookie if available
    useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);

        if (cookie) {
            try {
            const parsed = JSON.parse(cookie);
            if (parsed.payment) {
                Object.entries(parsed.payment).forEach(([key, value]) => {
                setValue(key as keyof SignupFormFields["payment"], value as any);
                });
            }
            } catch {}
        }
    }, [setValue]);

    /**
     * On submit, save the data to the cookie and call the onNext function
     * 
     * @param data - The data to save to the cookie
     */
    const onSubmit = (data: SignupFormFields["payment"]) => {
        // Save to cookie
        const cookie = Cookies.get(COOKIE_KEY);
        let cookieData = {};
        if (cookie) {
            try {
                cookieData = JSON.parse(cookie);
            } catch {}
        }
        // Flatten and store all payment fields at the top level
        Cookies.set(COOKIE_KEY, JSON.stringify({
            ...cookieData,
            card_number: "**** **** **** " + lastFourDigits,
            card_name: data.card_name,
            expiry_date: data.expiry_date,
            saved_card: data.saved_card,
            auto_renewal: data.auto_renewal,
            card_token: data.card_token,
        }));
        if (onNext) onNext();
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex justify-center items-center py-8 font-regular-eng"
        >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 border border-gray-300 relative">
            <h2 className="text-2xl font-bold mb-6 text-primary-light">Payment Method</h2>
            <div className="mb-6 flex items-center gap-2">
                <input
                    type="checkbox"
                    id="saved_card"
                    className="accent-primary-light w-4 h-4"
                    {...register("saved_card")}
                />
                <label htmlFor="saved_card" className="text-sm">Save payment info for next time?</label>
            </div>

            <h3 className="text-xl font-bold mb-2 mt-6">Credit Card</h3>

            {/* Name on Card */}
            <div className="mb-4">
                <label htmlFor="card_name" className="block mb-1 font-semibold text-text-main text-sm">Name on Card</label>
                <input
                    id="card_name"
                    className={`w-full border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${errors.card_name ? "border-red-500" : "border-gray-400"}`}
                    {...register("card_name", { required: "Name on card is required" })}
                    placeholder="Enter your full name on your card"
                />
                {errors.card_name && <span className="text-red-500 text-xs">{errors.card_name.message}</span>}
            </div>

            {/* Card Number */}
            <div className="mb-4">
                <label htmlFor="card_number" className="block mb-1 font-semibold text-text-main text-sm">Card Number</label>
                <input
                    id="card_number"
                    className={`w-full border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${errors.card_number ? "border-red-500" : "border-gray-400"}`}
                        {...register("card_number", { required: "Card number is required" })}
                    placeholder="Enter your card number"
                    inputMode="numeric"
                    maxLength={19}
                />
                {errors.card_number && <span className="text-red-500 text-xs">{errors.card_number.message}</span>}
            </div>

            {/* Expiration Date & CVC */}
            <div className="flex gap-3 mb-4">
                <div className="flex-1">
                    <label htmlFor="expiry_date" className="block mb-1 font-semibold text-text-main text-sm">Expiration Date</label>
                    <input
                        id="expiry_date"
                        className={`w-full border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${errors.expiry_date ? "border-red-500" : "border-gray-400"}`}
                        {...register("expiry_date", { required: "Expiration date is required" })}
                        placeholder="MM / YY"
                        maxLength={7}
                    />
                    {errors.expiry_date && <span className="text-red-500 text-xs">{errors.expiry_date.message}</span>}
                </div>
                <div className="flex-1">
                    <label htmlFor="cvv" className="block mb-1 font-semibold text-text-main text-sm">CVC</label>
                    <input
                        id="cvv"
                        className={`w-full border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.cvv ? "border-red-500" : "border-gray-400"}`}
                        {...register("cvv", { required: "CVC is required" })}
                        placeholder="123"
                        maxLength={4}
                        inputMode="numeric"
                    />
                    {errors.cvv && <span className="text-red-500 text-xs">{errors.cvv.message}</span>}
                </div>
            </div>

            {/* Save Payment Method */}
            <div className="mb-2 flex items-center gap-2">
                <input
                type="checkbox"
                id="saved_card"
                className="accent-primary-light w-4 h-4"
                {...register("saved_card")}
                />
                <label htmlFor="saved_card" className="text-sm">Save Payment Method</label>
            </div>

            {/* Enable Auto Renewal */}
            <div className="mb-6 flex items-center gap-2">
                <input
                type="checkbox"
                id="auto_renewal"
                className="accent-primary-light w-4 h-4"
                {...register("auto_renewal")}
                />
                <label htmlFor="autoRenewal" className="text-sm">Enable Auto Renewal</label>
            </div>

            {/* Previous & Purchase Buttons */}
            <div className="flex justify-between mt-6">
                {/* Previous Button */}
                <button
                    type="button"
                    className="border border-gray-300 bg-gray-200 text-gray-700 rounded-[10px] px-8 py-2 text-base font-semibold shadow-sm hover:bg-gray-100 transition-all cursor-pointer"
                    onClick={onPrev}
                >
                Previous
                </button>

                {/* Purchase Button */}
                <button
                    type="submit"
                    className="bg-primary-light text-white rounded-[10px] px-8 py-2 text-base font-semibold shadow-sm hover:bg-primary-dark transition-all cursor-pointer"
                >
                Purchase
                </button>
            </div>
            </div>
        </form>
    );
};

export default Payment;