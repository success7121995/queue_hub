"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface CompleteProps {
onCompleteButtonClick?: () => void;
}

const COOKIE_KEY = "signupForm";

const Complete: React.FC<CompleteProps> = ({ onCompleteButtonClick }) => {
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
    const cookie = Cookies.get(COOKIE_KEY);
    if (cookie) {
        try {
        setFormData(JSON.parse(cookie));
        Cookies.remove(COOKIE_KEY);
        } catch {
        setFormData(null);
        }
    }
    }, []);

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

                    {formData.signup && (
                    <li><span className="font-semibold">Business:</span> {formData.signup.businessName}</li>
                    )}
                    {formData.signup && (
                    <li><span className="font-semibold">Contact:</span> {formData.signup.firstName} {formData.signup.lastName} ({formData.signup.email})</li>
                    )}
                    {formData.address && (
                    <li><span className="font-semibold">Address:</span> {formData.address.street}{formData.address.apt ? `, ${formData.address.apt}` : ""}, {formData.address.city}, {formData.address.state}, {formData.address.zip}, {formData.address.country}</li>
                    )}
                    {formData.payment && (
                    <li><span className="font-semibold">Card:</span> **** **** **** {formData.payment.cardNumber?.slice(-4)} (Exp: {formData.payment.expiryDate})</li>
                    )}
                    {formData.payment && (
                    <li><span className="font-semibold">Auto Renewal:</span> {formData.payment.autoRenewal ? "Enabled" : "Disabled"}</li>
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
                onClick={onCompleteButtonClick}
            >
                Continue
            </button>
            </div>
        </div>
    );
};

export default Complete;