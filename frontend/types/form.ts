export type Lang = "EN" | "ZH_HK" | "ZH_TW" | "ZH_CH";
export type Plan = "TRIAL" | "ESSENTIAL" | "GROWTH";
export type MerchantRole = "OWNER" | "MANAGER" | "FRONTLINE";

export interface SignupFormFields {
    signup: {
        plan: Plan;
        business_name: string;
        fname: string;
        lname: string;
        username: string;
        email: string;
        phone: string;
        password: string;
        confirm_password: string;
        lang: Lang;
        use_same_address: boolean;
    };
    branchInfo: {
        branch_name: string;
        phone?: string;
        email?: string;
        description?: string;
        opening_hours?: {
            day_of_week: number;
            open_time: string;
            close_time: string;
            is_closed: boolean;
        }[];
    };
    address: {
        country: string;
        street: string;
        unit?: string;
        floor?: string;
        city: string;
        state: string;
        zip: string;
    };
    branchAddress?: {
        country: string;
        street: string;
        unit?: string;
        floor?: string;
        city: string;
        state: string;
        zip: string;
    };
    payment?: {
        card_name: string;
        card_number: string;
        expiry_date: string;
        cvv: string;
        card_token?: string;
        save_card: boolean;
        auto_renewal: boolean;
    };
}

export interface AddBranchFormFields {
    branchInfo: {
        branch_name: string;
        phone?: string;
        email?: string;
        description?: string;
        opening_hours?: {
            day_of_week: number;
            open_time: string;
            close_time: string;
            is_closed: boolean;
        }[];
    };
    address: {
        country: string;
        street: string;
        unit?: string;
        floor?: string;
        city: string;
        state: string;
        zip: string;
    };
    payment?: {
        card_name: string;
        card_number: string;
        expiry_date: string;
        cvv: string;
        card_token?: string;
        save_card: boolean;
        auto_renewal: boolean;
    };
}

export interface AddAdminFormFields {
    userInfo: {
        fname: string;
        lname: string;
        email: string;
        phone: string;
        position: string;
        role: MerchantRole;
    };
    accountSetup: {
        username: string;
        password: string;
        confirm_password: string;
        lang: Lang;
    };
}

export interface AddEmployeeFormFields {
    userInfo: {
        fname: string;
        lname: string;
        email: string;
        phone: string;
        position: string;
        role: MerchantRole;
    };
    accountSetup: {
        username: string;
        password: string;
        confirm_password: string;
        lang: Lang;
    };
}

// Common types
export interface Address {
    country: string;
    street: string;
    unit?: string;
    floor?: string;
    city: string;
    state: string;
    zip: string;
}

export interface Payment {
    card_name: string;
    card_number: string;
    expiry_date: string;
    cvv: string;
    card_token?: string;
    save_card: boolean;
    auto_renewal: boolean;
}

export interface OpeningHours {
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
}
