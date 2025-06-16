"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import Cookies from "js-cookie";
import { Globe } from "lucide-react";

export type Lang = "EN" | "ZH" | "ZH_CH";

interface LangContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    langsOptions: { label: string, value: Lang, icon: React.ReactNode }[];
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export const useLang = () => {
    const context = useContext(LangContext);
    if (!context) {
        throw new Error("useLang must be used within a LangProvider");
    }
    return context;
};

const LangProvider = ({ children }: { children: ReactNode }) => {
    const langsOptions: { label: string, value: Lang, icon: React.ReactNode }[] = [
        { label: "English", value: "EN", icon: <Globe size={18} /> },
        { label: "繁體", value: "ZH", icon: <Globe size={18} /> },
        { label: "简体", value: "ZH_CH", icon: <Globe size={18} /> },
    ];

    const [lang, setLang] = useState<Lang>("EN");
    const [hydrated, setHydrated] = useState(false); // prevent hydration mismatch

    useEffect(() => {
        const cookieLang = Cookies.get("lang");
        if (cookieLang === "EN" || cookieLang === "ZH" || cookieLang === "ZH_CH") {
            setLang(cookieLang);
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (hydrated) {
            Cookies.set("lang", lang);
        }
    }, [lang, hydrated]);

    if (!hydrated) return null; // Avoid rendering until hydration is complete

    return (
        <LangContext.Provider value={{ lang, setLang, langsOptions }}>
            {children}
        </LangContext.Provider>
    );
};

export default LangProvider;