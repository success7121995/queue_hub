"use client";

import { MultistepForm } from "@/components";


const RegisterNewUser = () => {
	return (
		<div className="font-regular-eng p-8">
			<MultistepForm form="add-employee" />
		</div>
	);
};

export default RegisterNewUser;