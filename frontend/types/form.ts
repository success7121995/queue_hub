export interface SignupFormFields {
    signup: {
        business_name: string;
        fname: string;
        lname: string;
        username: string;
        email: string;
        phone: string;
        password: string;
        confirm_password: string;
        lang: "EN" | "ZH-HK" | "ZH-TW" | "ZH-CN";
        plan: "FREE-TRIAL" | "ESSENTIAL" | "GROWTH";
    },
    address: Address,
    payment: Payment;
}

export interface AddBranchFormFields {
    branchInfo: {
        name: string;
        contact_person: string;
        email: string;
        branch_tel: string;
        description: string;
        features: string[];
        tags: string[];
        opening_hours: {
            id: number;
            dayOfWeek: number;
            open_time: string;
            close_time: string;
            closed: boolean;
        }[];
    };
    address: Address;
    payment: Payment;
}

export interface AddAdminFormFields {
    userInfo: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        position: string;
        role: "OWNER" | "MANAGER" | "EMPLOYEE";
    },
    accountSetup: {
        username: string;
        password: string;
        confirm_password: string;
        lang: 'en-GB' | 'zh-CN' | 'zh-HK' | 'zh-TW';
    }
}

export type Address = {
    country: string;
    street: string;
    unit: string;
    floor: string;
    city: string;
    state: string;
    zip: string;
} 

export type Payment = {
    card_name: string;
    card_number: string;
    expiry_date: string;
    cvv: string;
    card_token: string;
    saved_card: boolean;
    auto_renewal: boolean;
}
