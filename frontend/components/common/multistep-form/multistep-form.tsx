"use client";

import React, { useState } from "react";
import Address from "./address";
import BranchInfo from "./branch-info";
import Preview from "./preview";
import Payment from "./payment";
import Signup from "./signup";
import UserInfo from "./user-info";
import AccountSetup from "./account-setup";
import Stepper from "../stepper";
import Success from "./success";
import { useRouter } from "next/navigation";
import { FormProvider } from "@/constant/form-provider";

interface MultistepFormProps {
    form: "signup" | "add-branch" | "add-admin" | "add-employee";
}

const MultistepForm = ({ form }: MultistepFormProps) => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    // Define steps for each form type
    const formSteps = {
        "signup": ["Signup", "Address", "Payment", "Complete"],
        "add-branch": ["Branch Info", "Address", "Payment", "Complete"],
        "add-employee": ["User Info", "Account Setup", "Specific Info"],
        "add-admin": ["User Info", "Account Setup", "Specific Info"]
    };

    const steps = formSteps[form];

    // Handle step completion and redirection
    // useEffect(() => {
    //     if (currentStep === steps.length) {
    //         const timer = setTimeout(() => {
    //             if (form === "signup") {
    //                 router.push("/");
    //             } else if (form === "add-branch") {
    //                 router.push("/branch-info");
    //             }
    //         }, 5000);
    //         return () => clearTimeout(timer);
    //     }
    // }, [currentStep, form, router, steps.length]);

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCompletedSteps([...completedSteps, currentStep]);
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setCompletedSteps(completedSteps.filter(step => step !== currentStep - 1));
        }
    };

    const renderStep = () => {
        switch (form) {
            case "signup":
                switch (currentStep) {
                    case 1: return <Signup onNext={handleNext} />;
                    case 2: return <Address onNext={handleNext} onPrev={handlePrev} />;
                    case 3: return <Payment onNext={handleNext} onPrev={handlePrev} />;
                    case 4: return <Preview form="signup" onPrev={handlePrev} />;
                    default: return null;
                }
            case "add-branch":
                switch (currentStep) {
                    case 1: return <BranchInfo onNext={handleNext} />;
                    case 2: return <Address onNext={handleNext} onPrev={handlePrev} />;
                    case 3: return <Payment onNext={handleNext} onPrev={handlePrev} />;
                    case 4: return <Preview form="add-branch" onPrev={handlePrev} />;
                    default: return null;
                }
            case "add-employee":
                switch (currentStep) {
                    case 1: return <UserInfo onNext={handleNext} />;
                    case 2: return <AccountSetup onNext={handleNext} onPrev={handlePrev} />;
                    case 3: return <Preview form="add-employee" onPrev={handlePrev} />
                    default: return null;
                }
            case "add-admin":
                switch (currentStep) {
                    case 1: return <UserInfo onNext={handleNext} />;
                    case 2: return <AccountSetup onNext={handleNext} onPrev={handlePrev} />;
                    case 3: return <Preview form="add-admin" onPrev={handlePrev} />;
                    default: return null;
                }
            default:
                return null;
        }
    };

    return (
        <FormProvider formType={form}>            
            <div className="mx-auto pt-10 pb-20">
                <Stepper
                    steps={steps}
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    flowType={form === "signup" ? "merchant-signup" : "add-branch"}
                />
                <div className="mt-8 space-y-6">
                    {renderStep()}
                    
                </div>
            </div>
        </FormProvider>
    );
};

export default MultistepForm;