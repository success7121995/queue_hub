"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useMutation } from "@tanstack/react-query";
import { AddAdminFormFields, AddBranchFormFields, SignupFormFields } from "@/types/form";

interface CompleteProps {
    form?: "signup" | "add-branch" | "add-admin" | "add-employee";
}

const COOKIE_KEY = "signupForm";

const Complete: React.FC<CompleteProps> = ({ form }) => {
    let apiPath = "";
    switch (form) {
        case "signup":
            apiPath = "/merchant/signup";
            break;
        case "add-branch":
            apiPath = "/merchant/branch";
            break;
        case "add-admin":
            apiPath = "/merchant/admin";
            break;
        case "add-employee":
            apiPath = "/merchant/employee";
            break;
    }
    
    const [formData, setFormData] = useState<Record<string, any> | null>(null);

    useEffect(() => {
        const cookie = Cookies.get(COOKIE_KEY);

        if (cookie) {
            try {
                const parsed = JSON.parse(cookie);

                // Remove sensitive fields
                delete parsed.card_name
                delete parsed.card_number;
                delete parsed.cvv;
                
                setFormData(parsed);
                Cookies.remove(COOKIE_KEY);
            } catch {
                setFormData(null);
            }
        }
    }, []);

    const submitMutation = useMutation({
        mutationFn: async (data: SignupFormFields | AddBranchFormFields | AddAdminFormFields) => {
            const res = await fetch(`http://localhost:5500/api${apiPath}`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            }); 
    
            const result = await res.json();
    
            if (!res.ok) {
                throw new Error(result.message || "Signup failed");
            }
    
            return result;
        },
        onSuccess: (data) => {
            console.log("Signup success", data);
            // 例如 redirect：
            window.location.href = data.redirect;
        },
        onError: (err: any) => {
            console.error("Signup error:", err.message);
        }
    });

    /**
     * Handle submit button click
     */
    const handleSubmit = () => {
        if (formData) {
            submitMutation.mutate(formData as SignupFormFields | AddBranchFormFields | AddAdminFormFields);
        }
    }

    return (
        <div className="w-full min-h-[60vh] flex justify-center items-center to-white py-16 font-regular-eng">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-10 border border-gray-100 relative flex flex-col items-center">

            {/* Success Icon */}
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary-light/10 mb-6">
                <svg className="w-12 h-12 text-primary-light" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 6-6" />
                </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-center mb-2 text-primary-light">Signup Complete!</h2>
            <p className="text-gray-600 text-center mb-8 text-base max-w-md">Thank you for joining QueueHub. Your account has been created and your details are saved. You can now start managing your queues efficiently!</p>
            {/* Data Summary */}
            <div className="w-full bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
                <h3 className="text-lg font-semibold mb-3 text-primary-light">Summary</h3>
                {formData ? (
                <ul className="text-sm text-gray-700 space-y-2">
                    {formData.plan && (
                        <li><span className="font-semibold">Plan: </span> {formData.plan === "FREE-TRIAL" ? "Free Trial" : formData.plan === "ESSENTIAL" ? "Essential" : "Growth"}</li>
                    )}
                    {formData.lang && (
                        <li><span className="font-semibold">Language: </span> {formData.lang === "EN" ? "English" : formData.lang === "ZH-HK" ? "繁體中文 (香港)" : formData.lang === "ZH-TW" ? "繁體中文 (台灣)" : "简体中文"}</li>
                    )}
                    {formData.business_name && (
                        <li><span className="font-semibold">Business Name: </span> {formData.business_name}</li>
                    )}
                    {(formData.fname || formData.lname) && (
                        <li><span className="font-semibold">Name: </span> {formData.fname} {formData.lname}</li>
                    )}
                    {formData.email && (
                        <li><span className="font-semibold">Email: </span> {formData.email}</li>
                    )}
                    {formData.phone && (
                        <li><span className="font-semibold">Tel: </span> {formData.phone}</li>
                    )}
                    {(formData.street || formData.floor || formData.unit || formData.city || formData.state || formData.zip || formData.country) && (
                        <li><span className="font-semibold">Address: </span> {formData.street}{formData.unit ? ", Unit " + formData.unit : ""}{formData.floor ? ", Floor " + formData.floor : ""}{formData.city ? ", " + formData.city : ""}{formData.state ? ", " + formData.state : ""}{formData.zip ? ", " + formData.zip : ""}{formData.country ? ", " + formData.country : ""}</li>
                    )}
                    {formData.card_name && (
                        <li><span className="font-semibold">Card Name: </span> {formData.card_name}</li>
                    )}
                    {formData.card_number && (
                        <li><span className="font-semibold">Card Number: </span> {formData.card_number}</li>
                    )}
                    {formData.expiry_date && (
                        <li><span className="font-semibold">Expiry Date: </span> {formData.expiry_date}</li>
                    )}
                    {typeof formData.saved_card !== 'undefined' && (
                        <li><span className="font-semibold">Payment Method: </span> {formData.saved_card ? "Saved card" : "New card"}</li>
                    )}
                </ul>
                ) : (
                <div className="text-gray-400">No data found.</div>
                )}
            </div>

            {/* Continue Button */}
            <button
                type="button"
                className="bg-primary-light text-white rounded-[10px] px-8 py-2 text-base font-semibold shadow-sm hover:bg-primary-dark transition-all cursor-pointer"
                onClick={handleSubmit}
            >
                Continue
            </button>
            </div>
        </div>
    );
};

export default Complete;