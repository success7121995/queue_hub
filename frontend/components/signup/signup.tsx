"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import AddressForm from "./address";
import PaymentMethod from "./payment-method";
import Complete, { type CompleteProps } from "./complete";

const plans = [
{
	name: "Free Trial",
	description: "Start 30-day trial",
	price: "FREE",
	value: "free",
	bg: "bg-white",
	border: "border-gray-400",
},
{
	name: "Essential Plan",
	description: "Perfect for individual shops, restaurants, clinics, and service providers.",
	price: "50 USD / per month",
	value: "essential",
	bg: "bg-gray-200",
	border: "border-gray-400",
},
{
	name: "Growth Plan",
	description: "Best for businesses with multiple branches and growing customer volume.",
	price: "75 USD / per month",
	value: "growth",
	bg: "bg-white",
	border: "border-gray-400",
},
];

const defaultFormData = {
	plan: plans[0].value,
	businessName: "",
	firstName: "",
	lastName: "",
	email: "",
	businessTel: "",
	password: "",
	confirmPassword: "",
	country: "",
	street: "",
	apt: "",
	city: "",
	state: "",
	zip: "",
	// Payment fields
	useSavedAddress: false,
	savePayment: false,
	autoRenew: false,
	cardName: "",
	cardNumber: "",
	expiry: "",
	cvv: "",
};

const Signup = () => {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({ ...defaultFormData });
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isClient, setIsClient] = useState(false);

	// Calculate total steps based on plan
	const totalSteps = formData.plan === "free" ? 2 : 4;

	// Hydration check
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Load cookie data on mount
	useEffect(() => {
		if (!isClient) return;

		const cookie = Cookies.get("signupData");

		if (cookie) {
			try {
				const savedData = JSON.parse(cookie);

				setFormData((prev) => ({
					...prev,
					...savedData,
					// don't load password fields from cookie for security
					password: "",
					confirmPassword: "",
				}));
			} catch (err: any) {
				throw Error(err);
			}
		}
	}, [isClient]);

	/**
	 * Save to cookie helper (exclude passwords)
	 * @param data - typeof defaultFormData
	 */
	const saveToCookie = (data: typeof defaultFormData) => {
		const { password, confirmPassword, ...toSave } = data;
		Cookies.set("signupData", JSON.stringify(toSave), { expires: 7 });
	};

	/**
	 * Handle plan change
	 * @param newPlan - string
	 */
	const handlePlanChange = (newPlan: string) => {
		setFormData((prev) => ({ ...prev, plan: newPlan }));
		Cookies.set("signupData", JSON.stringify({ ...formData, plan: newPlan }), { expires: 7 });
	};

	/**
	 * Handle input change
	 * @param e - React.ChangeEvent<HTMLInputElement>
	 */
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	// Password strength regex: at least one uppercase letter, one number, one special character, length >= 8
	const passwordStrengthRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;

	/**
	 * Validate step 1
	 * @returns true if all fields are valid, false otherwise
	 */
	const validateStep1 = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
		if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
		if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

		// Email format
		if (!formData.email.trim()) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

		// Tel: digits only
		if (!formData.businessTel.trim()) newErrors.businessTel = "Business Tel is required";
		else if (!/^\d+$/.test(formData.businessTel)) newErrors.businessTel = "Business Tel must be numeric";

		// Password
		if (!formData.password) newErrors.password = "Password is required";
		else if (!passwordStrengthRegex.test(formData.password)) {
			newErrors.password = "Password must contain at least one uppercase letter, one number, and one special character";
		}

		// Confirm Password
		if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
		else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	/**
	 * Validate step 2
	 * @returns true if all fields are valid, false otherwise
	 */
	const validateStep2 = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.country.trim()) newErrors.country = "Country is required";
		if (!formData.street.trim()) newErrors.street = "Street address is required";
		if (!formData.city.trim()) newErrors.city = "City is required";
		if (!formData.state.trim()) newErrors.state = "State is required";

		// Zip: must be number
		if (!formData.zip.trim()) newErrors.zip = "Zip code is required";
		else if (!/^\d+$/.test(formData.zip)) newErrors.zip = "Zip code must be numeric";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	/**
	 * Check if email is unique
	 * @returns true if email is unique, false otherwise
	 */
	const checkEmailUnique = async () => {
		return true;
	};

	const onNext = async () => {
		if (step === 1 && !validateStep1()) return;
		if (step === 2 && !validateStep2()) return;

		// Save cookie without passwords
		saveToCookie(formData);

		// Check email uniqueness
		if (step === 1 && !await checkEmailUnique()) return;

		// Clear passwords before next step for security
		if (step === 1) {
			setFormData((prev) => ({
				...prev,
				password: "",
				confirmPassword: "",
			}));
		}

		setStep(step + 1);
	};

	const onPrev = () => {
		saveToCookie(formData);
		if (step === 3 && formData.plan === "free") {
			setStep(2); // Go to address if free plan
		} else {
			setStep(step - 1);
		}
	};

	const goToAddress = () => setStep(2);

	// Form submit handler for the form (step < 4)
	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (step === 2 && !validateStep2()) return;
		saveToCookie(formData);
		alert("Signup data submitted!\n" + JSON.stringify(formData, null, 2));
		// TODO: Send data to backend
		console.log(formData);
		Cookies.remove("signupData");
	};

	// onSubmit for Complete (step 4)
	const onSubmit = (e?: React.MouseEvent<HTMLButtonElement>) => {
		saveToCookie(formData);
		alert("Signup data submitted!\n" + JSON.stringify(formData, null, 2));
		// TODO: Send data to backend
		console.log(formData);
		Cookies.remove("signupData");
	};

	if (!isClient) return null;

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-white font-regular-eng px-4 sm:px-6 lg:px-8">
			{/* Stepper and Plan Selection only for steps 1-3 */}
			{step < 4 && (
				<>
					{/* Stepper */}
					<div className="flex justify-center items-center w-full mt-4 sm:mt-8 mb-2">
						<span className={`text-lg sm:text-xl mr-2 ${step === 1 ? "text-text-main font-semibold" : "text-gray-400"}`}>1. Sign Up</span>
						<ChevronRight size={20} className="text-text-main" />
						<span className={`text-lg sm:text-xl mx-2 ${step === 2 ? "text-text-main font-semibold" : "text-gray-400"}`}>2. Address</span>
						{formData.plan !== "free" && (
							<>
								<ChevronRight size={20} className="text-text-main" />
								<span className={`text-lg sm:text-xl mx-2 ${step === 3 ? "text-text-main font-semibold" : "text-gray-400"}`}>3. Payment</span>
								<ChevronRight size={20} className="text-text-main" />
								<span className={`text-lg sm:text-xl ml-2 text-gray-400`}>4. Complete</span>
							</>
						)}
					</div>

					<div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto mt-4">
						{/* Left: Plan Selection */}
						<div className="w-[80%] lg:w-full mx-auto lg:mx-0 lg:flex-1 lg:pr-8 mb-8 lg:mb-0">
							<h2 className="text-2xl sm:text-3xl mb-6 sm:mb-8 mt-4 sm:mt-8 font-semibold text-text-main">Plan</h2>
							<div className="space-y-4 sm:space-y-8">
							{plans.map((plan) => (
								<div
									key={plan.value}
									className={`rounded-lg border ${plan.border} ${plan.bg} flex flex-col md:flex-row justify-between items-start md:items-center p-4 sm:px-8 sm:py-6 cursor-pointer transition-all duration-200 ${
										formData.plan === plan.value ? "ring-3 ring-primary" : ""
									}`}
									onClick={() => handlePlanChange(plan.value)}
								>
									<div>
										<div className="text-xl sm:text-2xl mb-2">{plan.name}</div>
										<div className="text-sm text-gray-700">{plan.description}</div>
									</div>
									<div className="text-lg sm:text-xl mt-4 md:mt-0 md:ml-8 whitespace-nowrap">{plan.price}</div>
								</div>
							))}
							</div>
						</div>

						{/* Right: Form */}
						<div className="w-full lg:flex-1 flex flex-col items-center justify-center px-2 sm:px-4">
							<form onSubmit={handleFormSubmit} className="w-full max-w-sm space-y-4 sm:space-y-6 mb-8 sm:mb-15">
							<h1 className="text-3xl sm:text-4xl text-center mb-4 sm:mb-6 font-semibold text-text-main">
								{step === 1 ? "Sign Up" : 
								 step === 2 ? "Address" :
								 step === 3 ? "Payment Method" : "Complete"}
							</h1>

							{step === 1 ? (
								<>
								{/* Business Name */}
								<div>
									<label htmlFor="businessName" className="block mb-1 font-medium text-sm sm:text-base">Business Name *</label>
									<input
									id="businessName"
									name="businessName"
									value={formData.businessName}
									onChange={handleChange}
									className={`w-full ${!errors.businessName ? "border border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
									placeholder="Business name"
									/>
									{errors.businessName && <p className="text-red-500 text-xs sm:text-sm">{errors.businessName}</p>}
								</div>

								{/* First & Last Name */}
								<div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
									<div className="flex-1">
									<label htmlFor="firstName" className="block mb-1 font-medium text-sm sm:text-base">First Name *</label>
									<input
										id="firstName"
										name="firstName"
										value={formData.firstName}
										onChange={handleChange}
										className={`w-full ${!errors.firstName ? "border border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
										placeholder="First name"
									/>
									{errors.firstName && <p className="text-red-500 text-xs sm:text-sm">{errors.firstName}</p>}
									</div>
									<div className="flex-1">
									<label htmlFor="lastName" className="block mb-1 font-medium text-sm sm:text-base">Last Name *</label>
									<input
										id="lastName"
										name="lastName"
										value={formData.lastName}
										onChange={handleChange}
										className={`w-full ${!errors.lastName ? "border border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
										placeholder="Last name"
									/>
									{errors.lastName && <p className="text-red-500 text-xs sm:text-sm">{errors.lastName}</p>}
									</div>
								</div>

								{/* Email */}
								<div>
									<label htmlFor="email" className="block mb-1 font-medium text-sm sm:text-base">Email *</label>
									<input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleChange}
									className={`w-full ${!errors.email ? "border border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
									placeholder="Email address"
									/>
									{errors.email && <p className="text-red-500 text-xs sm:text-sm">{errors.email}</p>}
								</div>

								{/* Business Tel */}
								<div>
									<label htmlFor="businessTel" className="block mb-1 font-medium text-sm sm:text-base">Business Tel *</label>
									<input
										id="businessTel"
										name="businessTel"
										value={formData.businessTel}
										onChange={handleChange}
										className={`w-full ${!errors.businessTel ? "border border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
										placeholder="Business telephone number"
									/>
									{errors.businessTel && <p className="text-red-500 text-xs sm:text-sm">{errors.businessTel}</p>}
								</div>

								{/* Password */}
								<div>
									<label htmlFor="password" className="block mb-1 font-medium text-sm sm:text-base">Password *</label>
									<div className="relative">
									<input
										id="password"
										name="password"
										type={showPassword ? "text" : "password"}
										value={formData.password}
										onChange={handleChange}
										className={`w-full ${!errors.password ? "border border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 pr-10 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
										placeholder="Password"
									/>
									<button
										type="button"
										className="absolute right-2 top-2 text-gray-500"
										onClick={() => setShowPassword((show) => !show)}
										tabIndex={-1}
									>
										{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
									</button>
									</div>
									{errors.password && <p className="text-red-500 text-xs sm:text-sm">{errors.password}</p>}
								</div>

								{/* Confirm Password */}
								<div>
									<label htmlFor="confirmPassword" className="block mb-1 font-medium text-sm sm:text-base">Confirm Password *</label>
									<div className="relative">
									<input
										id="confirmPassword"
										name="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										value={formData.confirmPassword}
										onChange={handleChange}
										className={`w-full border ${errors.confirmPassword ? "border-2 border-red-500" : "border-gray-300"} rounded px-3 py-2 pr-10 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
										placeholder="Confirm Password"
									/>
									<button
										type="button"
										className="absolute right-2 top-2 text-gray-500"
										onClick={() => setShowConfirmPassword((show) => !show)}
										tabIndex={-1}
									>
										{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
									</button>
									</div>
									{errors.confirmPassword && <p className="text-red-500 text-xs sm:text-sm">{errors.confirmPassword}</p>}
								</div>

								<div className="flex justify-end mt-6">
									<button
										type="button"
										onClick={onNext}
										className="w-[100px] bg-primary text-text-light font-semibold py-2 rounded cursor-pointer"
									>
										Next
									</button>
								</div>
								</>
							) : step === 2 ? (
								<AddressForm
									formData={formData}
									errors={errors}
									handleChange={handleChange}
									onPrev={onPrev}
									onNext={formData.plan === "free" ? (async () => {
										if (validateStep2()) {
											setStep(4);
										}
									}) : onNext}
									submitLabel={formData.plan === "free" ? "Submit" : undefined}
								/>
							) : step === 3 ? (
								<PaymentMethod
									formData={formData}
									setFormData={setFormData}
									onPrev={onPrev}
									onNext={onNext}
									plan={formData.plan}
									goToAddress={goToAddress}
								/>
							) : null}
							</form>
						</div>
					</div>
				</>
			)}

			{/* Payment Complete Step: Centered */}
			{step === 4 && (
				<div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh]">
					<Complete onSubmit={onSubmit} />
				</div>
			)}
		</div>
	);
};

export default Signup; 