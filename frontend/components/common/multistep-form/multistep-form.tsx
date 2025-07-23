"use client";

import React, { useState, useCallback, useEffect } from "react";
import Address from "./address";
import BranchInfo from "./branch-info";
import Preview from "./preview";
import Payment from "./payment";
import Signup from "./signup";
import UserInfo from "./user-info";
import AccountSetup from "./account-setup";
import Stepper from "../stepper";
import { useRouter } from "next/navigation";
import { FormProvider } from "@/constant/form-provider";
import LoadingIndicator from "../loading-indicator";
import { AdminRole, getFirstAdminSlug, getFirstMerchantSlug, MerchantRole, checkExistingSession } from "@/lib/utils";

interface MultistepFormProps {
    form: "signup" | "add-branch" | "add-admin" | "add-employee";
}

const MultistepForm = ({ form }: MultistepFormProps) => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [useSameAddress, setUseSameAddress] = useState(true);
    const [isCheckingSession, setIsCheckingSession] = useState(form === "signup");

    // Check for existing valid session on signup form
    useEffect(() => {
        if (form !== "signup") {
            setIsCheckingSession(false);
            return;
        }

        const checkSession = async () => {
            const { isAuthenticated, user } = await checkExistingSession();
            
            if (isAuthenticated && user) {
                // Valid session exists, redirect to appropriate dashboard
                if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'OPS_ADMIN' || user.role === 'SUPPORT_AGENT' || user.role === 'DEVELOPER') {
                    const firstAdminSlug = getFirstAdminSlug(user.UserAdmin?.role as AdminRole);
                    router.push(`/admin/${firstAdminSlug}`);
                } else if (user.role === 'MERCHANT' || user.role === 'OWNER' || user.role === 'MANAGER' || user.role === 'FRONTLINE') {
                    const firstMerchantSlug = getFirstMerchantSlug(user.UserMerchant?.role as MerchantRole);
                    router.push(`/merchant/${firstMerchantSlug}`);
                } else {
                    router.push('/');
                }
                return;
            }
            
            setIsCheckingSession(false);
        };

        checkSession();
    }, [form, router]);

    // Define steps for each form type
    const formSteps = {
        "signup": ["Signup", "Branch Info", "Address", "Branch Address", "Payment", "Complete"],
        "add-branch": ["Branch Info", "Address", "Payment", "Complete"],
        "add-employee": ["User Info", "Account Setup", "Complete"],
        "add-admin": ["User Info", "Account Setup", "Complete"]
    };

    const steps = formSteps[form];

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

    // Show loading while checking session for signup
    if (isCheckingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingIndicator 
                    fullScreen 
                    text="Checking session..." 
                    className="bg-white/80"
                />
            </div>
        );
    }

    const renderStep = () => {
        switch (form) {
            case "signup":
                switch (currentStep) {
                    case 1: return <Signup onNext={handleNext} />;
                    case 2: return <BranchInfo onNext={handleNext} onPrev={handlePrev} isSignupForm={true} />;
                    case 3: return (
                        <Address 
                            onNext={handleNext} 
                            onPrev={handlePrev}
                            showUseSameAddressCheckbox={true}
                            useSameAddress={useSameAddress}
                            onUseSameAddressChange={setUseSameAddress}
                            isSignupForm={true}
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
                                formType="add-branch"
                            />
                        );
                    }
                    case 5: return <Payment onNext={handleNext} onPrev={handlePrev} />;
                    case 6: return <Preview form="signup" onPrev={handlePrev} isSignupForm={true} />;
                    default: return null;
                }
            case "add-branch":
                switch (currentStep) {
                    case 1: return <BranchInfo onNext={handleNext} formType="add-branch" />;
                    case 2: return (
                        <Address 
                            onNext={handleNext} 
                            onPrev={handlePrev}
                            isBranchAddress={true}
                            formType="add-branch"
                        />
                    );
                    case 3: return <Payment onNext={handleNext} onPrev={handlePrev} />;
                    case 4: return <Preview form="add-branch" onPrev={handlePrev} />;
                    default: return null;
                }
            case "add-employee":
                switch (currentStep) {
                    case 1: return <UserInfo onNext={handleNext} formType="add-employee" />;
                    case 2: return <AccountSetup onNext={handleNext} onPrev={handlePrev} />;
                    case 3: return <Preview form="add-employee" onPrev={handlePrev} />;
                    default: return null;
                }
            case "add-admin":
                switch (currentStep) {
                    case 1: return <UserInfo onNext={handleNext} formType="add-admin" />;
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