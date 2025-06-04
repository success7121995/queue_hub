"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useMutation } from "@tanstack/react-query";
import { AddAdminFormFields, AddBranchFormFields, SignupFormFields } from "@/types/form";
import Success from "./success";
import LoadingIndicator from "@/components/common/loading-indicator";

interface PreviewProps {
    form?: "signup" | "add-branch" | "add-admin" | "add-employee";
    onPrev: () => void;
}

const COOKIE_KEY = "signupForm";

const Preview: React.FC<PreviewProps> = ({ form, onPrev }) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [countdown, setCountdown] = useState(8);

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
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth${apiPath}`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                credentials: 'include' // Important for session cookies
            }); 
    
            const result = await res.json();
    
            if (!res.ok) {
                throw new Error(result.message || "Signup failed");
            }
    
            return result;
        },
        onSuccess: async (data) => {
            setShowSuccess(true);
            
            // Start countdown
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // After 8 seconds, get the redirect URL from backend
            setTimeout(async () => {
                try {
                    const redirectRes = await fetch(`${process.env.BACKEND_URL}/api/redirect/${data.redirect_token}`, {
                        credentials: 'include' // Important for session cookies
                    });
                    const redirectData = await redirectRes.json();
                    
                    if (redirectRes.ok && redirectData.success) {
                        window.location.href = redirectData.redirect_url;
                    } else {
                        window.location.href = '/';
                    }
                } catch (err) {
                    console.error("Redirect error:", err);
                    window.location.href = '/';
                }
            }, 8000);
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

    if (showSuccess) {
        return <Success form={form || "signup"} countdown={countdown} />;
    }

    return (
        <div className="w-full min-h-[60vh] flex justify-center items-center to-white py-16 font-regular-eng">
            {/* Loading overlay */}
            {submitMutation.isPending && (
                <LoadingIndicator 
                    fullScreen 
                    text="Submitting..." 
                    className="bg-white/80"
                />
            )}

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-10 border border-gray-100 relative flex flex-col items-center">
            
            <h2 className="text-3xl font-bold text-center mb-2 text-primary-light">Preview</h2>
            
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

            {/* Submit Button */}
            <div className="flex justify-end w-full mt-6">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="bg-primary-light text-white rounded-[10px] px-8 py-2 text-base font-semibold shadow-md hover:bg-primary-dark transition-all cursor-pointer flex items-center justify-center min-w-[100px]"
                >
                    {submitMutation.isPending ? (
                        <LoadingIndicator size="sm" className="!mt-0" />
                    ) : (
                        'Submit'
                    )}
                </button>
            </div>

            </div>
        </div>
    );
};

export default Preview;