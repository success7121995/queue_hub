import React from "react";

interface AddressFormProps {
	formData: {
		country: string;
		street: string;
		apt: string;
		city: string;
		state: string;
		zip: string;
	};
	errors: Record<string, string>;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onPrev: () => void;
	onNext: () => void;
	submitLabel?: string;
}

const AddressForm = ({ formData, errors, handleChange, onPrev, onNext, submitLabel }: AddressFormProps) => {
	return (
		<>
			{/* Address Fields */}
			<div>
				<label htmlFor="country" className="block mb-1 font-medium text-sm sm:text-base">Country *</label>
				<input
					id="country"
					name="country"
					value={formData.country}
					onChange={handleChange}
					className={`w-full ${!errors.country ? "border border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
					placeholder="Country"
				/>
				{errors.country && <p className="text-red-500 text-xs sm:text-sm">{errors.country}</p>}
			</div>
			<div>
				<label htmlFor="street" className="block mb-1 font-medium text-sm sm:text-base">Street Address *</label>
				<input
					id="street"
					name="street"
					value={formData.street}
					onChange={handleChange}
					className={`w-full ${!errors.street ? "border border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
					placeholder="Street address"
				/>
				{errors.street && <p className="text-red-500 text-xs sm:text-sm">{errors.street}</p>}
			</div>
			<div>
				<label htmlFor="apt" className="block mb-1 font-medium text-sm sm:text-base">Apartment, suite, etc. (optional)</label>
				<input
					id="apt"
					name="apt"
					value={formData.apt}
					onChange={handleChange}
					className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary"
					placeholder="Apartment, suite, etc."
				/>
			</div>
			<div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
				<div className="flex-1">
					<label htmlFor="city" className="block mb-1 font-medium text-sm sm:text-base">City *</label>
					<input
						id="city"
						name="city"
						value={formData.city}
						onChange={handleChange}
						className={`w-full ${!errors.city ? "border border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
						placeholder="City"
					/>
					{errors.city && <p className="text-red-500 text-xs sm:text-sm">{errors.city}</p>}
				</div>
				<div className="flex-1">
					<label htmlFor="state" className="block mb-1 font-medium text-sm sm:text-base">State *</label>
					<input
						id="state"
						name="state"
						value={formData.state}
						onChange={handleChange}
						className={`w-full ${!errors.state ? "border border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
						placeholder="State"
					/>
					{errors.state && <p className="text-red-500 text-xs sm:text-sm">{errors.state}</p>}
				</div>
				<div className="flex-1">
					<label htmlFor="zip" className="block mb-1 font-medium text-sm sm:text-base">Zip Code *</label>
					<input
						id="zip"
						name="zip"
						value={formData.zip}
						onChange={handleChange}
						className={`w-full ${!errors.zip ? "border border-gray-300" : "border-2 border-red-500"} rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-primary`}
						placeholder="Zip code"
					/>
					{errors.zip && <p className="text-red-500 text-xs sm:text-sm">{errors.zip}</p>}
				</div>
			</div>

			<div className="flex flex-col sm:flex-row justify-between mt-6 space-y-4 sm:space-y-0">
				<button
					type="button"
					onClick={onPrev}
					className="bg-gray-300 text-gray-700 py-2 px-6 rounded font-semibold w-full sm:w-[120px] cursor-pointer"
				>
					Previous
				</button>
				<button
					type="button"
					onClick={onNext}
					className="bg-primary text-white py-2 px-6 rounded font-semibold w-full sm:w-[100px] cursor-pointer"
				>
					{submitLabel || "Next"}
				</button>
			</div>
		</>
	);
};

export default AddressForm; 