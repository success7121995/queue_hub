"use client";

import React, { useEffect, useState } from "react";

interface PaymentMethodProps {
	formData: any;
	setFormData: (data: any) => void;
	onPrev: () => void;
	onNext: () => void;
	plan: string;
	goToAddress: () => void;
}

interface PaymentErrors {
	cardName?: string;
	cardNumber?: string;
	expiry?: string;
	cvv?: string;
}

const PaymentMethod = ({ formData, setFormData, onPrev, onNext, plan, goToAddress }: PaymentMethodProps) => {
	const [errors, setErrors] = useState<PaymentErrors>({});

	// Controlled handlers
	const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.checked });
	};
	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// On prev: store payment fields in signupData and go to address if plan is free
	const handlePrev = () => {
		if (typeof window !== "undefined") {
			const { password, confirmPassword, ...toSave } = { ...formData };
			window.Cookies?.set?.("signupData", JSON.stringify(toSave), { expires: 7 });
		}
		if (plan === "free") {
			goToAddress();
		} else {
			onPrev();
		}
	};

	// If plan changes to free, immediately go to address step
	useEffect(() => {
		if (plan === "free") {
			goToAddress();
		}
	}, [plan, goToAddress]);

	const validate = () => {
		const newErrors: any = {};
		if (!formData.cardName || formData.cardName.trim().length < 2) newErrors.cardName = "Name on card is required.";
		if (!formData.cardNumber || !/^\d{12,19}$/.test(formData.cardNumber.replace(/\s/g, ""))) newErrors.cardNumber = "Card number is invalid.";
		if (!formData.expiry || !/^\d{2}\s*\/\s*\d{2,4}$/.test(formData.expiry.trim())) newErrors.expiry = "Expiry must be in MM/YY format.";
		if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = "CVC is invalid.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handlePurchase = () => {
		if (validate()) {
			onNext();
		}
	};

	return (
		<div className="w-full max-w-xl mx-auto">
			{/* Use saved billing address */}
			<div className="mb-6 flex items-center">
				<input
					type="checkbox"
					id="useSavedAddress"
					name="useSavedAddress"
					checked={!!formData.useSavedAddress}
					onChange={handleCheckbox}
					className="mr-2"
				/>
				<label htmlFor="useSavedAddress" className="block mb-1 font-medium text-sm sm:text-base">Use saved billing address</label>
			</div>

			{/* Credit Card Title */}
			<div className="mb-4">
				<span className="text-2xl font-semibold text-text-main">Credit Card</span>
			</div>

			{/* Name on Card */}
			<div className="mb-6">
				<label htmlFor="cardName" className="block mb-1 font-medium text-sm sm:text-base">Name on Card *</label>
				<input
					id="cardName"
					name="cardName"
					value={formData.cardName || ""}
					onChange={handleInput}
					className={`w-full border ${!errors.cardName ? "border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
					placeholder="Enter your full name on your card"
				/>
				{errors.cardName && <p className="text-red-500 text-xs sm:text-sm">{errors.cardName}</p>}
			</div>

			{/* Card Number */}
			<div className="mb-6">
				<label htmlFor="cardNumber" className="block mb-1 font-medium text-sm sm:text-base">Card Number *</label>
				<input
					id="cardNumber"
					name="cardNumber"
					value={formData.cardNumber || ""}
					onChange={handleInput}
					className={`w-full border ${!errors.cardNumber ? "border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
					placeholder="Enter your card number"
				/>
				{errors.cardNumber && <p className="text-red-500 text-xs sm:text-sm">{errors.cardNumber}</p>}
			</div>

			{/* Expiration Date and CVC */}
			<div className="flex space-x-4 mb-8">
				<div className="flex-1">
					<label htmlFor="expiry" className="block mb-1 font-medium text-sm sm:text-base">Expiration Date *</label>
					<input
						id="expiry"
						name="expiry"
						value={formData.expiry || ""}
						onChange={handleInput}
						className={`w-full border ${!errors.expiry ? "border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
						placeholder="MM / YY"
					/>
					{errors.expiry && <p className="text-red-500 text-xs sm:text-sm">{errors.expiry}</p>}
				</div>
				<div className="flex-1">
					<label htmlFor="cvv" className="block mb-1 font-medium text-sm sm:text-base">CVC *</label>
					<input
						id="cvv"
						name="cvv"
						value={formData.cvv || ""}
						onChange={handleInput}
						className={`w-full border ${!errors.cvv ? "border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
						placeholder="123"
					/>
					{errors.cvv && <p className="text-red-500 text-xs sm:text-sm">{errors.cvv}</p>}
				</div>
			</div>

			{/* Save Payment Method */}
			<div className="mb-4 flex items-center">
				<input
					type="checkbox"
					id="savePayment"
					name="savePayment"
					checked={!!formData.savePayment}
					onChange={handleCheckbox}
					className="mr-2"
				/>
				<label htmlFor="savePayment" className="block mb-1 font-medium text-sm sm:text-base">Save Payment Method</label>
			</div>

			{/* Enable Auto Renewal */}
			<div className="mb-8 flex items-center">
				<input
					type="checkbox"
					id="autoRenew"
					name="autoRenew"
					checked={!!formData.autoRenew}
					onChange={handleCheckbox}
					className="mr-2"
				/>
				<label htmlFor="autoRenew" className="block mb-1 font-medium text-sm sm:text-base">Enable Auto Renewal</label>
			</div>

			<div className="flex flex-col sm:flex-row justify-between mt-6 space-y-4 sm:space-y-0">
				<button
					type="button"
					onClick={handlePrev}
					className="bg-gray-300 text-gray-700 py-2 px-6 rounded font-semibold w-full sm:w-[120px] cursor-pointer"
				>
					Prev
				</button>
				<button
					type="button"
					onClick={handlePurchase}
					className="bg-primary text-white py-2 px-6 rounded font-semibold w-full sm:w-[120px] cursor-pointer"
				>
					Purchase
				</button>
			</div>
		</div>
	);
};

export default PaymentMethod; 