"user client"

import React, { createContext, useContext, useState } from "react";
import { useForm as useFormHook, UseFormReturn } from "react-hook-form";
import { useLang } from "@/constant/lang-provider";

interface FormContextType {
    form: "signup" | "add-branch" | "add-admin" | "add-employee";
    setForm: (form: "signup" | "add-branch" | "add-admin" | "add-employee") => void;
    formMethods: UseFormReturn<any>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useForm = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error("useFormContext must be used within a FormProvider");
    }
    return context;
}

export const FormProvider = ({ children, formType }: { children: React.ReactNode, formType: "signup" | "add-branch" | "add-admin" | "add-employee" }) => {
    const { lang } = useLang();
    const [form, setForm] = useState<"signup" | "add-branch" | "add-admin" | "add-employee">(formType);
    
    // Create form methods with default values based on form type
    const getDefaultValues = () => {
        switch (formType) {
            case "signup":
                return { lang };
            default:
                return {};
        }
    };

    const formMethods = useFormHook<any>({
        defaultValues: getDefaultValues()
    });

    return (
        <FormContext.Provider value={{ form, setForm, formMethods }}>
            {children}
        </FormContext.Provider>
    );
};