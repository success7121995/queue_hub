"use client";

import React, { useState, useEffect } from "react";
import Address from "./address";
import BranchInfo from "./branch-info";
import Complete from "./complete";
import Payment from "./payment";
import Signup from "./signup";
import UserInfo from "./user-info";
import AccountSetup from "./account-setup";
import Stepper from "../stepper";
import { useRouter } from "next/navigation";
import { SignupFormFields, AddBranchFormFields, AddAdminFormFields } from "@/types/form";
import { FormProvider, useForm } from "@/constant/form-provider";

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
                    case 4: return <Complete onCompleteButtonClick={() => router.push("/")} />;
                    default: return null;
                }
            case "add-branch":
                switch (currentStep) {
                    case 1: return <BranchInfo />;
                    case 2: return <Address onNext={handleNext} onPrev={handlePrev} />;
                    case 3: return <Payment onNext={handleNext} onPrev={handlePrev} />;
                    case 4: return <Complete onCompleteButtonClick={() => router.push("/dashboard/1/branches-info")} />;
                    default: return null;
                }
            case "add-employee":
            case "add-admin":
                switch (currentStep) {
                    case 1: return <UserInfo />;
                    case 2: return <AccountSetup />;
                    case 3: return <Complete />;
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