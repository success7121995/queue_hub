"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useForm } from "@/constant/form-provider";
import type { UseFormReturn } from "react-hook-form";
import { SignupFormFields, AddBranchFormFields } from "@/types/form";

const COOKIE_KEY = "signupForm";

interface PaymentProps {
    onNext?: () => void;
    onPrev?: () => void;
    formType?: "signup" | "add-branch";
}

interface CookieData {
    payment?: SignupFormFields["payment"] | AddBranchFormFields["payment"];
    signup?: Record<string, any>;
    [key: string]: any;
}

const Payment: React.FC<PaymentProps> = ({ onNext, onPrev, formType = "signup" }) => {
    const { formMethods } = useForm();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = (formMethods as unknown) as UseFormReturn<SignupFormFields | AddBranchFormFields>;

    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");

    // Load from cookie if available
    useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);
        if (cookie) {
            try {
                const parsed: CookieData = JSON.parse(cookie);
                if (parsed.payment) {
                    // Only load non-sensitive data
                    if (parsed.payment.save_card !== undefined) {
                        setValue("payment.save_card", parsed.payment.save_card);
                    }
                    if (parsed.payment.auto_renewal !== undefined) {
                        setValue("payment.auto_renewal", parsed.payment.auto_renewal);
                    }
                }
            } catch (error) {
                console.error("Error parsing cookie:", error);
            }
        }
    }, [setValue]);

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || "";
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(" ");
        } else {
            return value;
        }
    };

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        if (v.length >= 3) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);
    };

    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiryDate(e.target.value);
        setExpiryDate(formatted);
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        setCvv(v.substring(0, 3));
    };

    const onSubmit = (data: Record<string, any>) => {
        const cookie = Cookies.get(COOKIE_KEY);
        let cookieData: CookieData = {};
        if (cookie) {
            try {
                cookieData = JSON.parse(cookie);
            } catch (error) {
                console.error("Error parsing cookie:", error);
            }
        }

        // Only save non-sensitive data to cookie
        const paymentData = {
            save_card: data.payment.save_card,
            auto_renewal: data.payment.auto_renewal
        };

        // Preserve existing data but update payment
        const { payment, ...existingData } = cookieData;
        Cookies.set(COOKIE_KEY, JSON.stringify({
            ...existingData,
            payment: paymentData
        }));

        if (onNext) onNext();
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex justify-center items-center py-8 font-regular-eng"
        >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-100 relative">
                <h2 className="text-3xl font-bold text-center mb-4 text-primary-light">Payment Information</h2>

                {/* Card Number */}
                <div>
                    <label htmlFor="payment.card_number" className="block mb-1 font-semibold text-text-main text-sm">Card Number</label>
                    <input
                        id="payment.card_number"
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            errors.payment?.card_number ? "border-red-500" : "border-gray-400"
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                    />
                    {errors.payment?.card_number && (
                        <span className="text-red-500 text-xs">{errors.payment.card_number.message}</span>
                    )}
                </div>

                {/* Card Name */}
                <div>
                    <label htmlFor="payment.card_name" className="block mb-1 font-semibold text-text-main text-sm">Card Name</label>
                    <input
                        id="payment.card_name"
                        type="text"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            errors.payment?.card_name ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("payment.card_name", { required: "Card name is required" })}
                        placeholder="JOHN DOE"
                        required
                    />
                    {errors.payment?.card_name && (
                        <span className="text-red-500 text-xs">{errors.payment.card_name.message}</span>
                    )}
                </div>

                {/* Expiry Date and CVV */}
                <div className="flex gap-3">
                    {/* Expiry Date */}
                    <div className="flex-1">
                        <label htmlFor="payment.expiry_date" className="block mb-1 font-semibold text-text-main text-sm">Expiry Date</label>
                        <input
                            id="payment.expiry_date"
                            type="text"
                            value={expiryDate}
                            onChange={handleExpiryDateChange}
                            className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                errors.payment?.expiry_date ? "border-red-500" : "border-gray-400"
                            }`}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                        />
                        {errors.payment?.expiry_date && (
                            <span className="text-red-500 text-xs">{errors.payment.expiry_date.message}</span>
                        )}
                    </div>

                    {/* CVV */}
                    <div className="flex-1">
                        <label htmlFor="payment.cvv" className="block mb-1 font-semibold text-text-main text-sm">CVV</label>
                        <input
                            id="payment.cvv"
                            type="text"
                            value={cvv}
                            onChange={handleCvvChange}
                            className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                errors.payment?.cvv ? "border-red-500" : "border-gray-400"
                            }`}
                            placeholder="123"
                            maxLength={3}
                            required
                        />
                        {errors.payment?.cvv && (
                            <span className="text-red-500 text-xs">{errors.payment.cvv.message}</span>
                        )}
                    </div>
                </div>

                {/* Save Card */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="payment.save_card"
                        className="mr-2 h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300 rounded"
                        {...register("payment.save_card")}
                    />
                    <label htmlFor="payment.save_card" className="text-sm text-gray-700">
                        Save card for future payments
                    </label>
                </div>

                {/* Auto Renewal */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="payment.auto_renewal"
                        className="mr-2 h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300 rounded"
                        {...register("payment.auto_renewal")}
                    />
                    <label htmlFor="payment.auto_renewal" className="text-sm text-gray-700">
                        Enable auto-renewal
                    </label>
                </div>

                {/* Next & Previous Buttons */}
                <div className="flex justify-between mt-6">
                    {/* Previous Button */}
                    <button
                        type="button"
                        className="border border-gray-300 bg-gray-200 text-gray-700 rounded-[10px] px-8 py-2 text-base font-semibold shadow-sm hover:bg-gray-100 transition-all cursor-pointer"
                        onClick={onPrev}
                    >
                        Previous
                    </button>

                    {/* Next Button */}
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

export default Payment;