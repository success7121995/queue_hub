"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";
import { Dropdown } from "@/components";
import { type DropdownItem } from "@/components/common/dropdown";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

const PublicNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isMenuOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    const menuItems = [
        { label: "Features", href: "/features/real-time-updates" },
        { label: "How It Work", href: "#how-it-work" },
        { label: "Why QueueHub", href: "/about-us" },
        { label: "Pricing", href: "#pricing" },
    ];

    const languages = [
        { label: "English", value: "en", icon: <Globe size={18} /> },
        { label: "繁體（香港）", value: "zh-HK", icon: <Globe size={18} /> },
        { label: "繁體（台灣）", value: "zh-TW", icon: <Globe size={18} /> },
        { label: "简体", value: "zh-CN", icon: <Globe size={18} /> },
    ];

    const [selectedLanguage, setSelectedLanguage] = useState<DropdownItem>(languages[0]);

    const handleLinkClick = (e: React.MouseEvent, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const sectionId = href.substring(1);

            setIsMenuOpen(false);

            if (pathname === "/") {
                // already on home page - scroll smoothly
                const el = document.getElementById(sectionId);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                }
            } else {
                // navigate to home with hash
                router.push("/#" + sectionId);
            }
        } else {
            setIsMenuOpen(false);
            router.push(href);
        }
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
            <nav className="flex justify-between items-center py-4 px-6 md:px-12">

            {/* Left Section: Logo + Desktop Menu */}
            <div className="flex items-center space-x-8">
                <Link href="/">
                <span className="font-bold italic text-xl text-text-main cursor-pointer">
                    QueueHub
                </span>
                </Link>

                {/* Desktop Menu Items */}
                <div className="hidden lg:flex items-center space-x-6 font-regular-eng text-sm">
                {menuItems.map((item) => (
                    <button
                    key={item.label}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    className="font-semibold text-text-main hover:underline cursor-pointer"
                    >
                    {item.label}
                    </button>
                ))}
                </div>
            </div>

            {/* Right Section: Language + Buttons */}
            <div className="hidden lg:flex items-center space-x-4 font-regular-eng">
                <span className="flex items-center text-sm">
                <Dropdown
                    className="w-[140px]"
                    items={languages}
                    selected={selectedLanguage}
                    onSelect={(item) => setSelectedLanguage(item)}
                />
                </span>

                <button
                onClick={() => router.push("/signup")}
                className="rounded px-4 py-1.5 text-sm font-bold border border-primary bg-primary text-text-light hover:border-primary-hover hover:bg-primary-hover transition-all duration-300 cursor-pointer"
                >
                Try For Free
                </button>
                <button
                onClick={() => router.push("/login")}
                className="border border-text-main rounded px-4 py-1.5 text-sm font-semibold hover:bg-black hover:text-white transition-all duration-300 cursor-pointer"
                >
                Login
                </button>
            </div>

            {/* Mobile Toggle Button */}
            <div className="lg:hidden">
                <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                className="text-text-main focus:outline-none cursor-pointer"
                >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
            </nav>

            {/* Mobile Dropdown with animation */}
            <AnimatePresence>
            {isMenuOpen && (
                <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="lg:hidden flex flex-col px-6 pb-4 space-y-3 font-regular-eng text-sm bg-white shadow-md"
                >
                {menuItems.map((item) => (
                    <button
                    key={item.label}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    className="font-semibold text-text-main hover:underline cursor-pointer text-left"
                    >
                    {item.label}
                    </button>
                ))}

                <span className="flex items-center text-sm mt-3">
                    <Dropdown
                    className="w-[140px]"
                    items={languages}
                    selected={selectedLanguage}
                    onSelect={(item) => setSelectedLanguage(item)}
                    />
                </span>

                <button
                    onClick={() => {
                    setIsMenuOpen(false);
                    router.push("/signup");
                    }}
                    className="rounded px-4 py-2 text-sm font-bold bg-primary text-text-light hover:bg-primary-hover transition-all duration-300 mt-2 cursor-pointer"
                >
                    Try For Free
                </button>

                <button
                    onClick={() => {
                    setIsMenuOpen(false);
                    router.push("/login");
                    }}
                    className="border border-text-main rounded px-4 py-2 text-sm font-semibold hover:bg-black hover:text-white transition-all duration-300 cursor-pointer"
                >
                    Login
                </button>
                </motion.div>
            )}
            </AnimatePresence>
        </header>
    );
};

export default PublicNavbar;
