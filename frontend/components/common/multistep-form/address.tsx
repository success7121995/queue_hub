"use client";

import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useForm } from "@/constant/form-provider";
import type { UseFormReturn, FieldErrors } from "react-hook-form";
import { SignupFormFields, AddBranchFormFields } from "@/types/form";

const COOKIE_KEY = "signupForm";

export interface AddressProps {
    onNext?: () => void;
    onPrev?: () => void;
    showUseSameAddressCheckbox?: boolean;
    useSameAddress?: boolean;
    onUseSameAddressChange?: (checked: boolean) => void;
    isBranchAddress?: boolean;
    formType?: "signup" | "add-branch";
}

interface CookieData {
    address?: SignupFormFields["address"] | AddBranchFormFields["address"];
    branchAddress?: SignupFormFields["branchAddress"];
    signup?: {
        use_same_address?: boolean;
        [key: string]: any;
    };
    [key: string]: any;
}

const countryList = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Hong Kong",
    "Macau",
    "Taiwan",
    "Singapore",
    "Malaysia",
    "China",
    "Japan",
    "Other",
];

const Address: React.FC<AddressProps> = ({ 
    onNext, 
    onPrev,
    showUseSameAddressCheckbox = false,
    useSameAddress = true,
    onUseSameAddressChange,
    isBranchAddress = false,
    formType = "signup"
}) => {
    const { formMethods } = useForm();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = (formMethods as unknown) as UseFormReturn<SignupFormFields | AddBranchFormFields>;

    const prefix = isBranchAddress ? "branchAddress" : "address";

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
        
        // Extract address data from nested form data
        const addressObj = data[prefix] || {};
        const addressData: SignupFormFields["address"] = {
            street: addressObj.street || '',
            unit: addressObj.unit || undefined,
            floor: addressObj.floor || undefined,
            city: addressObj.city || '',
            state: addressObj.state || '',
            zip: addressObj.zip || '',
            country: addressObj.country || ''
        };

        // Create new cookie data with only the necessary fields
        const newCookieData = {
            ...cookieData,
            [prefix]: addressData
        };

        // Handle use_same_address for signup flow
        if (formType === "signup") {
            if (!isBranchAddress && useSameAddress) {
                // If using same address, copy main address to branch address
                newCookieData.branchAddress = addressData;
            }
            
            // Update use_same_address in signup data
            if (cookieData.signup) {
                newCookieData.signup = {
                    ...cookieData.signup,
                    use_same_address: useSameAddress
                };
            }
        }

        Cookies.set(COOKIE_KEY, JSON.stringify(newCookieData));

        if (onNext) onNext();
    };

    // Load from cookie if available
    useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);
        if (cookie) {
            try {
                const parsed: CookieData = JSON.parse(cookie);
                const addressData = isBranchAddress ? parsed.branchAddress : parsed.address;
                if (addressData) {
                    Object.entries(addressData).forEach(([key, value]) => {
                        setValue(`${prefix}.${key}` as any, value as string);
                    });
                }

                // Set use_same_address value if available
                if (!isBranchAddress && parsed.signup?.use_same_address !== undefined) {
                    onUseSameAddressChange?.(parsed.signup.use_same_address);
                }
            } catch (error) {
                console.error("Error parsing cookie:", error);
            }
        }
    }, [setValue, prefix, isBranchAddress, onUseSameAddressChange]);

    const getFieldError = (fieldName: string) => {
        const fieldPath = `${prefix}.${fieldName}` as keyof FieldErrors<SignupFormFields | AddBranchFormFields>;
        return errors[fieldPath]?.message;
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex justify-center items-center py-8 font-regular-eng"
        >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-100 relative">
                <h2 className="text-3xl font-bold text-center mb-4 text-primary-light">
                    {isBranchAddress ? "Branch Address" : "Address"}
                </h2>

                {showUseSameAddressCheckbox && !isBranchAddress && (
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            id="useSameAddress"
                            checked={useSameAddress}
                            onChange={(e) => onUseSameAddressChange?.(e.target.checked)}
                            className="mr-2 h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300 rounded"
                        />
                        <label htmlFor="useSameAddress" className="text-sm text-gray-700">
                            Use the same address for branch
                        </label>
                    </div>
                )}

                <h3 className="text-xl font-semibold mb-2 text-primary-light">Address Details</h3>

                {/* Country */}
                <div>
                    <label htmlFor={`${prefix}.country`} className="block mb-1 font-semibold text-text-main text-sm">Country</label>
                    <select
                        id={`${prefix}.country`}
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                            getFieldError('country') ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register(`${prefix}.country`, { required: "Country is required" })}
                        defaultValue=""
                    >
                        <option value="" disabled>Select Country</option>
                        {countryList.map((country) => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                    {getFieldError('country') && <span className="text-red-500 text-xs">{getFieldError('country')}</span>}
                </div>

                {/* Unit (Optional) */}
                <div>
                    <label htmlFor={`${prefix}.unit`} className="block mb-1 font-semibold text-text-main text-sm">Unit <span className="text-gray-500 text-xs">Optional</span></label>
                    <input
                        id={`${prefix}.unit`}
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            getFieldError('unit') ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register(`${prefix}.unit`)}
                        placeholder="Enter unit number (e.g. Apt #, Suite #)"
                    />
                    {getFieldError('unit') && <span className="text-red-500 text-xs">{getFieldError('unit')}</span>}
                </div>

                {/* Floor (Optional) */}
                <div>
                    <label htmlFor={`${prefix}.floor`} className="block mb-1 font-semibold text-text-main text-sm">Floor <span className="text-gray-500 text-xs">Optional</span></label>
                    <input
                        id={`${prefix}.floor`}
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            getFieldError('floor') ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register(`${prefix}.floor`)}
                        placeholder="Enter floor number"
                    />
                    {getFieldError('floor') && <span className="text-red-500 text-xs">{getFieldError('floor')}</span>}
                </div>

                {/* Street Address */}
                <div>
                    <label htmlFor={`${prefix}.street`} className="block mb-1 font-semibold text-text-main text-sm">Street Address</label>
                    <input
                        id={`${prefix}.street`}
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            getFieldError('street') ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register(`${prefix}.street`, { required: "Street address is required" })}
                        placeholder="Enter street address"
                    />
                    {getFieldError('street') && <span className="text-red-500 text-xs">{getFieldError('street')}</span>}
                </div>

                {/* City */}
                <div>               
                    <label htmlFor={`${prefix}.city`} className="block mb-1 font-semibold text-text-main text-sm">City</label>
                    <input
                        id={`${prefix}.city`}
                        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            getFieldError('city') ? "border-red-500" : "border-gray-400"
                        }`}
                        {...register(`${prefix}.city`, { required: "City is required" })}
                        placeholder="Enter City"
                    />
                    {getFieldError('city') && <span className="text-red-500 text-xs">{getFieldError('city')}</span>}
                </div>

                {/* State / Province / Region and ZIP or Postal Code */}
                <div className="flex gap-3">
                    {/* State / Province / Region */}
                    <div className="flex-1">
                        <label htmlFor={`${prefix}.state`} className="block mb-1 font-semibold text-text-main text-sm">State / Province / Region</label>
                        <input
                            id={`${prefix}.state`}
                            className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                getFieldError('state') ? "border-red-500" : "border-gray-400"
                            }`}
                            {...register(`${prefix}.state`, { required: "State / province / region is required" })}
                            placeholder="Enter State / province / region"
                        />
                        {getFieldError('state') && <span className="text-red-500 text-xs">{getFieldError('state')}</span>}
                    </div>

                    {/* ZIP or Postal Code */}
                    <div className="flex-1">
                        <label htmlFor={`${prefix}.zip`} className="block mb-1 font-semibold text-text-main text-sm">ZIP or Postal Code</label>
                        <input
                            id={`${prefix}.zip`}
                            className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                getFieldError('zip') ? "border-red-500" : "border-gray-400"
                            }`}
                            {...register(`${prefix}.zip`, { required: "ZIP / Postal code is required" })}
                            placeholder="Enter ZIP / Postal"
                        />
                        {getFieldError('zip') && <span className="text-red-500 text-xs">{getFieldError('zip')}</span>}
                    </div>
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

export default Address;