"use client"

import { CountryDialingCode } from "@/types/form";
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useRef, useEffect } from "react";
import 'flag-icons/css/flag-icons.min.css';

type DialingCodeContextType = {
    dialingCode: CountryDialingCode;
    setDialingCode: Dispatch<SetStateAction<CountryDialingCode>>;
    dialingCodes: { code: CountryDialingCode, name: string, flag: string }[];
    countryDialingSelect: () => ReactNode;
}

const DialingCodeContext = createContext<DialingCodeContextType | undefined>(undefined);

export const useDialingCode = () => {
    const context = useContext(DialingCodeContext);
    if (!context) {
        throw new Error("useDialingCode must be used within a DialingCodeProvider");
    }
    return context;
};

const DialingCodeProvider = ({ children }: { children: ReactNode }) => {
    const dialingCodes: { code: CountryDialingCode, name: string, flag: string }[] = [
        { code: '+1', name: 'United States', flag: 'us' },
        { code: '+1', name: 'Canada', flag: 'ca' },
        { code: '+44', name: 'United Kingdom', flag: 'gb' },
        { code: '+61', name: 'Australia', flag: 'au' },
        { code: '+852', name: 'Hong Kong', flag: 'hk' },
        { code: '+853', name: 'Macau', flag: 'mo' },
        { code: '+886', name: 'Taiwan', flag: 'tw' },
        { code: '+65', name: 'Singapore', flag: 'sg' },
        { code: '+60', name: 'Malaysia', flag: 'my' },
        { code: '+86', name: 'China', flag: 'cn' },
        { code: '+81', name: 'Japan', flag: 'jp' },
    ];

    const countryDialingSelect = () => {
        return dialingCodes.map((dialingCode) => (
            <option key={dialingCode.code} value={dialingCode.code}>
                {dialingCode.code}
            </option>
        ));
    }

    const [dialingCode, setDialingCode] = useState<CountryDialingCode>(dialingCodes[0].code);

    return (
        <DialingCodeContext.Provider value={{
            dialingCodes,
            dialingCode,
            setDialingCode,
            countryDialingSelect,
        }}>
            {children}
        </DialingCodeContext.Provider>
    )
};

export const CountryDialingDropdown: React.FC = () => {
    const { dialingCodes, dialingCode, setDialingCode } = useDialingCode();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dialingCodeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dialingCodeButtonRef.current && !dialingCodeButtonRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [dropdownOpen]);

    return (
        <div className="relative w-24">
            <button
                type="button"
                ref={dialingCodeButtonRef}
                className="w-full border border-gray-400 rounded px-2 py-1 flex items-center justify-between text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                onClick={() => setDropdownOpen((open) => !open)}
            >
                <span className={`fi fi-${dialingCodes.find(dc => dc.code === dialingCode)?.flag} mr-2`}></span>
                {dialingCode}
                <span className="ml-2">&#9662;</span>
            </button>
            {dropdownOpen && (
                <div className="absolute z-10 bg-white border w-full max-h-48 overflow-y-auto rounded shadow">
                    {dialingCodes.map((item) => (
                        <div
                            key={item.code + item.name}
                            className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                                setDialingCode(item.code);
                                setDropdownOpen(false);
                            }}
                        >
                            <span className={`fi fi-${item.flag} mr-2`}></span>
                            {item.code}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DialingCodeProvider;