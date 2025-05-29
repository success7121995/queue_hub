"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

const features = [
    { name: "Real-time Updates", href: "/features/real-time-updates" },
    { name: "Smart Notification System", href: "/features/smart-notification-system" },
    { name: "Multi-Role Access and Permission Control", href: "/features/multi-role-access-and-permission-control" },
    { name: "Analytics and Feedback Integration", href: "/features/analytics-and-feedback-integration" },
    { name: "Mobile & Cross-Device Access", href: "/features/mobile-and-cross-device-access" },
    { name: "2FA & Secure Login", href: "/features/2fa-and-secure-login" },
];

const FeatureSidenav = () => {
    const pathname = usePathname();
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
            setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = features.find((f) => f.href === pathname);

    const handleSelect = (href: string) => {
        router.push(href);
        setIsOpen(false);
    };

    return (
    <>
        <div className="md:hidden flex justify-center mt-10 px-4 font-regular-eng" ref={ref}>
            <div className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-[95%] mx-auto flex items-center justify-between px-4 py-3 rounded-md bg-primary text-text-light font-semibold text-base transition duration-300 hover:bg-primary-hover cursor-pointer"
            >
                <span>{selected?.name || "Select a feature"}</span>
                <ChevronDown size={20} />
            </button>

            {isOpen && (
                <ul className="w-[95%] mx-auto absolute top-full left-0 right-0 mt-2 z-10 bg-white border border-gray-200 rounded-md shadow-lg overflow-auto max-h-72 text-base">
                    {features.map((feature) => (
                        <li
                        key={feature.href}
                        onClick={() => handleSelect(feature.href)}
                        className="px-4 py-3 text-primary hover:bg-orange-50 cursor-pointer font-medium"
                        >
                        {feature.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>

        </div>

            {/* Desktop: Sidenav */}
            <div className="relative w-64 min-h-screen flex-col items-start py-8 pr-8 mt-10 hidden md:flex">
            <div className="absolute top-0 right-0 h-[95%] w-px my-auto bg-gray-300" />
            <ul className="space-y-6 w-full">
                {features.map((feature) => (
                <li key={feature.name} className="ml-4">
                    <Link
                    href={feature.href}
                    className={`font-medium text-base text-gray-700 hover:underline ${
                        pathname === feature.href ? "font-bold text-primary" : ""
                    }`}
                    >
                    {feature.name}
                    </Link>
                </li>
                ))}
            </ul>
        </div>
    </>
    );
};

export default FeatureSidenav;
