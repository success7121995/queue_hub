export interface SignupFormFields {
    signup: {
        businessName: string;
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        businessTel: string;
        password: string;
        confirmPassword: string;
    },
    address: Address,
    payment: Payment;
}

export interface AddBranchFormFields {
    branchInfo: {
        name: string;
        contactPerson: string;
        email: string;
        branchTel: string;
        description: string;
        features: string[];
        tags: string[];
        openingHours: {
            id: number;
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            closed: boolean;
        }[];
    };
    address: Address;
    payment: Payment;
}

export interface AddAdminFormFields {
    userInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        position: string;
        role: "OWNER" | "MANAGER" | "EMPLOYEE";
    },
    accountSetup: {
        username: string;
        password: string;
        confirmPassword: string;
        lang: 'en-GB' | 'zh-CN' | 'zh-HK' | 'zh-TW';
    }
}

export type Address = {
    country?: string;
    street?: string;
    apt?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
} 

export type Payment = {
    name: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    saveAddress?: boolean;
    country?: string;
    street?: string;
    apt?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    saveCard?: boolean;
    autoRenewal?: boolean;
}
