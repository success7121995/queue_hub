"user client"

import { createContext, useContext, useState } from "react";
import { useForm as useFormHook, UseFormReturn } from "react-hook-form";
import { SignupFormFields, AddBranchFormFields, AddAdminFormFields } from "@/types/form";

interface FormContextType {
    form: "signup" | "add-branch" | "add-admin" | "add-employee";
    setForm: (form: "signup" | "add-branch" | "add-admin" | "add-employee") => void;
    formMethods: UseFormReturn<SignupFormFields["signup"] | AddBranchFormFields["branchInfo"] | AddAdminFormFields["userInfo"]>;
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
    const [form, setForm] = useState<"signup" | "add-branch" | "add-admin" | "add-employee">("signup");
    const formMethods = useFormHook<SignupFormFields["signup"] | AddBranchFormFields["branchInfo"] | AddAdminFormFields["userInfo"]>({
        defaultValues: {},
    });

    return (
        <FormContext.Provider value={{ form, setForm, formMethods }}>
            {children}
        </FormContext.Provider>
    );
};