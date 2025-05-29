import React from "react";
import { ChevronRight, Check } from "lucide-react";

export type FlowType = "merchant-signup" | "add-branch";

interface StepperProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
  flowType: FlowType;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, completedSteps, flowType }) => {
  return (
    <div className="flex justify-center items-center w-full mt-4 sm:mt-8 mb-8 font-regular-eng">
      {steps.map((label, idx) => (
        <React.Fragment key={label}>
          <div className="flex items-center">
            <span
              className={`text-base mx-2 ${
                currentStep === idx + 1
                  ? "text-text-main font-semibold"
                  : completedSteps.includes(idx + 1)
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              {completedSteps.includes(idx + 1) ? (
                <div className="flex items-center">
                  <Check size={20} className="mr-1" />
                  {label}
                </div>
              ) : (
                label
              )}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <ChevronRight
              size={20}
              className={`${
                completedSteps.includes(idx + 1) ? "text-green-600" : "text-text-main"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stepper; 