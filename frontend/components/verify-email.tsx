"use client";

import { useEffect, useState } from "react";

const VerifyEmail = () => {
    const [countdown, setCountdown] = useState(8);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(countdown - 1);
        }, 1000);
    }, [countdown]);
    
	setTimeout(() => {
		window.location.href = "/";
	}, 8000);

	return (
		<div className="flex flex-col items-center justify-center h-screen gap-4 font-regular-eng">
            
            {/* Success Icon */}
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary-light/10">
                <svg className="w-12 h-12 text-primary-light" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 6-6" />
                </svg>
            </div>
            
			<h1 className="text-2xl font-bold text-text-main">Successfully Verified Email</h1>
			<button className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 font-semibold" onClick={() => window.location.href = "/"}>Back to Home</button>
			<p className="text-sm text-gray-500">You will be redirected to the home page in {countdown} seconds.</p>
		</div>
	);
}

export default VerifyEmail