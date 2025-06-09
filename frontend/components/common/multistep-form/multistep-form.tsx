"use client";

import React, { useState, useCallback } from "react";
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
    const [useSameAddress, setUseSameAddress] = useState(true);

    // Define steps for each form type
    const formSteps = {
        "signup": ["Signup", "Branch Info", "Address", "Branch Address", "Payment", "Complete"],
        "add-branch": ["Branch Info", "Address", "Payment", "Complete"],
        "add-employee": ["User Info", "Account Setup", "Complete"],
        "add-admin": ["User Info", "Account Setup", "Complete"]
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

    const handleNext = useCallback(() => {
        if (currentStep < steps.length) {
            setCompletedSteps([...completedSteps, currentStep]);
            setCurrentStep(currentStep + 1);
        }
    }, [currentStep, completedSteps, steps.length]);

    const handlePrev = useCallback(() => {
        if (currentStep > 1) {
            // Special handling for payment step in signup flow
            if (form === "signup" && currentStep === 5) {
                // If we're using the same address, go back to main address
                if (useSameAddress) {
                    setCurrentStep(3);
                    setCompletedSteps(completedSteps.filter(step => step !== 4));
                } else {
                    // If we have a separate branch address, go back to branch address
                    setCurrentStep(4);
                    setCompletedSteps(completedSteps.filter(step => step !== 4));
                }
                return;
            }
            
            // Special handling for payment step in add-branch flow
            if (form === "add-branch" && currentStep === 3) {
                setCurrentStep(2);
                setCompletedSteps(completedSteps.filter(step => step !== 2));
                return;
            }

            // Default behavior for other steps
            setCurrentStep(currentStep - 1);
            setCompletedSteps(completedSteps.filter(step => step !== currentStep - 1));
        }
    }, [currentStep, completedSteps, form, useSameAddress]);

    const renderStep = () => {
        switch (form) {
            case "signup":
                switch (currentStep) {
                    case 1: return <Signup onNext={handleNext} />;
                    case 2: return <BranchInfo onNext={handleNext} onPrev={handlePrev} />;
                    case 3: return (
                        <Address 
                            onNext={handleNext} 
                            onPrev={handlePrev}
                            showUseSameAddressCheckbox={true}
                            useSameAddress={useSameAddress}
                            onUseSameAddressChange={setUseSameAddress}
                        />
                    );
                    case 4: {
                        if (useSameAddress) {
                            // Skip branch address step if using same address
                            handleNext();
                            return null;
                        }
                        return (
                            <Address 
                                onNext={handleNext} 
                                onPrev={handlePrev}
                                isBranchAddress={true}
                            />
                        );
                    }
                    case 5: return <Payment onNext={handleNext} onPrev={handlePrev} />;
                    case 6: return <Preview form="signup" onPrev={handlePrev} />;
                    default: return null;
                }
            case "add-branch":
                switch (currentStep) {
                    case 1: return <BranchInfo onNext={handleNext} />;
                    case 2: return (
                        <Address 
                            onNext={handleNext} 
                            onPrev={handlePrev}
                            isBranchAddress={true}
                        />
                    );
                    case 3: return <Payment onNext={handleNext} onPrev={handlePrev} />;
                    case 4: return <Preview form="add-branch" onPrev={handlePrev} />;
                    default: return null;
                }
            case "add-employee":
                switch (currentStep) {
                    case 1: return <UserInfo onNext={handleNext} />;
                    case 2: return <AccountSetup onNext={handleNext} onPrev={handlePrev} />;
                    case 3: return <Preview form="add-employee" onPrev={handlePrev} />;
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