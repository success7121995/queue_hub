"use client";

import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useForm } from "@/constant/form-provider";
import type { UseFormReturn } from "react-hook-form";
import { SignupFormFields, Payment as PaymentType } from "@/types/form";

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
    } = (formMethods as unknown) as UseFormReturn<PaymentType>;

    // Load from cookie if available
    useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);

        if (cookie) {
            try {
            const parsed = JSON.parse(cookie);
            if (parsed.payment) {
                Object.entries(parsed.payment).forEach(([key, value]) => {
                setValue(key as keyof PaymentType, value as any);
                });
            }
            } catch {}
        }
    }, [setValue]);

    /**
     * On submit, save the data to the cookie and call the onNext function
     * @param data - The data to save to the cookie
     */
    const onSubmit = (data: PaymentType) => {
        // Save to cookie
        const cookie = Cookies.get(COOKIE_KEY);
        let cookieData = {};
        if (cookie) {
            try {
            cookieData = JSON.parse(cookie);
            } catch {}
        }

        Cookies.set(COOKIE_KEY, JSON.stringify({ ...cookieData, payment: data }));
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
                    id="saveAddress"
                    className="accent-primary-light w-4 h-4"
                    {...register("saveAddress")}
                />
                <label htmlFor="saveAddress" className="text-sm">Use saved billing address</label>
            </div>

            <h3 className="text-xl font-bold mb-2 mt-6">Credit Card</h3>

            {/* Name on Card */}
            <div className="mb-4">
                <label htmlFor="name" className="block mb-1 font-semibold text-text-main text-sm">Name on Card</label>
                <input
                    id="name"
                    className={`w-full border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? "border-red-500" : "border-gray-400"}`}
                    {...register("name", { required: "Name on card is required" })}
                    placeholder="Enter your full name on your card"
                />
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>

            {/* Card Number */}
            <div className="mb-4">
                <label htmlFor="cardNumber" className="block mb-1 font-semibold text-text-main text-sm">Card Number</label>
                <input
                    id="cardNumber"
                    className={`w-full border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.cardNumber ? "border-red-500" : "border-gray-400"}`}
                    {...register("cardNumber", { required: "Card number is required" })}
                    placeholder="Enter your card number"
                    inputMode="numeric"
                    maxLength={19}
                />
                {errors.cardNumber && <span className="text-red-500 text-xs">{errors.cardNumber.message}</span>}
            </div>

            {/* Expiration Date & CVC */}
            <div className="flex gap-3 mb-4">
                <div className="flex-1">
                    <label htmlFor="expiryDate" className="block mb-1 font-semibold text-text-main text-sm">Expiration Date</label>
                    <input
                        id="expiryDate"
                        className={`w-full border rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.expiryDate ? "border-red-500" : "border-gray-400"}`}
                        {...register("expiryDate", { required: "Expiration date is required" })}
                        placeholder="MM / YY"
                        maxLength={7}
                    />
                    {errors.expiryDate && <span className="text-red-500 text-xs">{errors.expiryDate.message}</span>}
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
                id="saveCard"
                className="accent-primary-light w-4 h-4"
                {...register("saveCard")}
                />
                <label htmlFor="saveCard" className="text-sm">Save Payment Method</label>
            </div>

            {/* Enable Auto Renewal */}
            <div className="mb-6 flex items-center gap-2">
                <input
                type="checkbox"
                id="autoRenewal"
                className="accent-primary-light w-4 h-4"
                {...register("autoRenewal")}
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