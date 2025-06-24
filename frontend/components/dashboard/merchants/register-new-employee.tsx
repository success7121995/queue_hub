"use client";

import { MultistepForm } from "@/components";


const RegisterNewEmployee = () => {
	return (
		<div className="font-regular-eng p-8">
			<MultistepForm form="add-employee" />
		</div>
	);
};

export default RegisterNewEmployee;