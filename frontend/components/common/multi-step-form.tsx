import React from "react";
import { useFormContext, FormFields, SignupFormFields } from "@/constant/form-provider";
import Stepper from "@/components/common/stepper";

interface MultiStepFormProps {
steps: string[];
stepComponents: React.ReactNode[];
flowType: "merchant-signup" | "add-branch";
onSubmit: (data: any) => void;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({
	steps,
	stepComponents,
	flowType,
	onSubmit,
}) => {
	const {
		currentStep,
		setCurrentStep,
		completedSteps,
		form: { handleSubmit, watch, trigger },
		handleNext,
		handlePrev,
	} = useFormContext();

	const formData = watch() as FormFields;
	const isLastStep = currentStep === steps.length;
	const isFirstStep = currentStep === 1;

	// Helper: get validateFields from stepComponent if provided
	const getValidateFields = () => {
		const step = stepComponents[currentStep - 1] as any;
		return step.type && step.type.validateFields ? step.type.validateFields : undefined;
	};

	// Next button handler
	const onNext = async () => {
	// Get fields to validate for current step
	const validateFields = getValidateFields();

	if (!validateFields || validateFields.length === 0) {
		console.warn(`No validation fields defined for step ${currentStep}`);
		return;
	}

	// Validate the fields
	const isValid = await trigger(validateFields);

	if (!isValid) {
		return; // Don't proceed if validation fails
	}

	// If free plan and next step is payment, skip to Complete
	if (
		flowType === "merchant-signup" &&
		steps[currentStep] === "Payment" &&
		(formData as SignupFormFields).plan === "free-trial"
	) {
		setCurrentStep(currentStep + 2); // skip payment
		return;
	}

	// If validation passes, proceed to next step
	setCurrentStep(currentStep + 1);
	};

	return (
	<div className="max-w-3xl mx-auto pt-10 pb-20">
		<Stepper
		steps={steps}
		currentStep={currentStep}
		completedSteps={completedSteps}
		flowType={flowType}
		/>
		<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
		{stepComponents[currentStep - 1]}
		<div className="flex flex-row justify-between mt-8">
			{!isFirstStep && currentStep < steps.length && (
			<button
				type="button"
				onClick={handlePrev}
				className="bg-gray-300 text-gray-700 py-2 px-6 rounded font-semibold w-full sm:w-[120px] cursor-pointer"
			>
				Previous
			</button>
			)}
			{!isLastStep && (
			<button
				type="button"
				onClick={onNext}
				className="bg-primary text-white py-2 px-6 rounded font-semibold w-full sm:w-[120px] cursor-pointer ml-auto"
			>
				Next
			</button>
			)}
			{isLastStep && (
			<button
				type="submit"
				className="bg-primary text-white py-2 px-6 rounded font-semibold w-full sm:w-[120px] cursor-pointer ml-auto"
			>
				Continue
			</button>
			)}
		</div>
		</form>
	</div>
	);
};

export default MultiStepForm; 