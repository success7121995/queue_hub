"use client";

import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useForm } from "@/constant/form-provider";
import type { UseFormReturn } from "react-hook-form";
import { SignupFormFields, Address as AddressType } from "@/types/form";

const COOKIE_KEY = "signupForm";

const countryList = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Hong Kong",
    "Singapore",
    "Malaysia",
    "China",
    "Japan",
    "Other",
];

interface AddressProps {
onNext?: () => void;
onPrev?: () => void;
}

const Address: React.FC<AddressProps> = ({ onNext, onPrev }) => {
    const { formMethods } = useForm();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = (formMethods as unknown) as UseFormReturn<AddressType>;

    // Load from cookie if available
    useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);
        if (cookie) {
            try {
            const parsed = JSON.parse(cookie);
            if (parsed.address) {
                Object.entries(parsed.address).forEach(([key, value]) => {
                setValue(key as keyof SignupFormFields["address"], value as string);
                });
            }
            } catch {}
        }
    }, [setValue]);

    /**
     * On submit, save the data to the cookie and call the onNext function
     * @param data - The data to save to the cookie
     */
    const onSubmit = (data: AddressType) => {
        // Save to cookie
        const cookie = Cookies.get(COOKIE_KEY);
        let cookieData = {};
        if (cookie) {
            try {
            cookieData = JSON.parse(cookie);
            } catch {}
        }
        Cookies.set(COOKIE_KEY, JSON.stringify({ ...cookieData, address: data }));
        // Advance to next step
        if (onNext) onNext();
    };

    // Listen for stepper-next event to trigger parent stepper (for compatibility)
    useEffect(() => {
        const handler = () => {
            // This is a placeholder; actual stepper logic is in parent
        };
        window.addEventListener("stepper-next", handler);
        return () => window.removeEventListener("stepper-next", handler);
    }, []);

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex justify-center items-center py-8 font-regular-eng"
        >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-100 relative">
            <h2 className="text-3xl font-bold text-center mb-4 text-primary-light">Address</h2>

            {/* Country */}
            <div>
                <label htmlFor="country" className="block mb-1 font-semibold text-text-main text-sm">Country</label>
                <select
                    id="country"
                    className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.country ? "border-red-500" : "border-gray-400"
                    }`}
                    {...register("country", { required: "Country is required" })}
                    defaultValue=""
                >
                    <option value="" disabled>
                    Select Country
                    </option>
                    {countryList.map((country) => (
                    <option key={country} value={country}>
                        {country}
                    </option>
                    ))}
                </select>
                {errors.country && <span className="text-red-500 text-xs">{errors.country.message}</span>}
            </div>

            {/* Street Address */}
            <div>
                <label htmlFor="street" className="block mb-1 font-semibold text-text-main text-sm">Street Address</label>
                <input
                    id="street"
                    className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.street ? "border-red-500" : "border-gray-400"
                    }`}
                    {...register("street", { required: "Street address is required" })}
                    placeholder="Enter street address"
                />
                {errors.street && <span className="text-red-500 text-xs">{errors.street.message}</span>}
            </div>

            {/* Apt / Suite / Floor (Optional) */}
            <div> 
                <label htmlFor="street" className="block mb-1 font-semibold text-text-main text-sm">Apt / Suite / Floor<span className="text-xs text-gray-400 ml-2">Optional</span></label>
                <input
                    id="street"
                    className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.street ? "border-red-500" : "border-gray-400"
                    }`}
                    {...register("apt")}
                    placeholder="Enter Apt # / Suite # / Floor #"
                />
                {errors.street && <span className="text-red-500 text-xs">{errors.street.message}</span>}
            </div>

            {/* City */}
            <div>               
                <label htmlFor="city" className="block mb-1 font-semibold text-text-main text-sm">City</label>
                <input
                    id="city"
                    className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.city ? "border-red-500" : "border-gray-400"
                    }`}
                    {...register("city", { required: "City is required" })}
                    placeholder="Enter City"
                />
                {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
            </div>

            {/* State / Province / Region and ZIP or Postal Code */}
            <div className="flex gap-3">

                {/* State / Province / Region */}
                <div className="flex-1">
                    <label htmlFor="state" className="block mb-1 font-semibold text-text-main text-sm">State / Province / Region</label>
                    <input
                        id="state"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.state ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("state", { required: "State / province / region is required" })}
                        placeholder="Enter State / province / region"
                    />
                    {errors.state && <span className="text-red-500 text-xs">{errors.state.message}</span>}
                </div>

                {/* ZIP or Postal Code */}
                <div className="flex-1">
                    <label htmlFor="zip" className="block mb-1 font-semibold text-text-main text-sm">ZIP or Postal Code</label>
                    <input
                        id="zip"
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.zip ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register("zip", { required: "ZIP / Postal code is required" })}
                        placeholder="Enter ZIP / Postal"
                    />
                    {errors.zip && <span className="text-red-500 text-xs">{errors.zip.message}</span>}
                </div>
            </div>

                {/* Next & Previous Buttons */}
                <div className="flex justify-between">
                    {/* Previous Button */}
                    <button
                        type="button"
                        className="border border-gray-300 bg-gray-200  text-gray-700 rounded-[10px] px-8 py-2 text-base font-semibold shadow-sm hover:bg-gray-100 transition-all cursor-pointer"
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

export default Address;