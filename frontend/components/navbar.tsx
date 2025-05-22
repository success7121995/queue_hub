"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react"; // optional: install lucide-react or replace with SVG
import { Dropdown } from "@/components";
import { type DropdownItem } from "@/components/dropdown";
import { Globe } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const menuItems = [
    { label: "Features", href: "#" },
    { label: "How It Work", href: "#" },
    { label: "Why QueueHub", href: "#" },
    { label: "Pricing", href: "#" },
  ];
  
  /**********    Languages    **********/
  const languages = [
    { label: "English", value: "en", icon: <Globe size={18} /> },
    { label: "繁體（香港）", value: "zh-HK", icon: <Globe size={18} /> },
    { label: "繁體（台灣）", value: "zh-TW", icon: <Globe size={18} /> },
    { label: "简体", value: "zh-CN", icon: <Globe size={18} /> },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState<DropdownItem>(languages[0]);

  return (
    <header className="bg-white w-full shadow-sm">
        <nav className="flex justify-between items-center py-4 px-6 md:px-12">

            {/* Left Section: Logo + Desktop Menu */}
            <div className="flex items-center space-x-8">
                <span className="font-bold italic text-xl text-text-main">
                QueueHub
                </span>

                {/* Desktop Menu Items */}
                <div className="hidden md:flex items-center space-x-6 font-regular-eng text-sm">
                {menuItems.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className="font-semibold text-text-main hover:underline"
                    >
                    {item.label}
                    </a>
                ))}
                </div>
            </div>

            {/* Right Section: Language + Buttons */}
            <div className="hidden md:flex items-center space-x-4 font-regular-eng">
                <span className="flex items-center text-sm">
                    <Dropdown
                        className="w-[140px]"
                        items={languages}
                        selected={selectedLanguage}
                        onSelect={(item) => setSelectedLanguage(item)}
                    />
                </span>

                <button className="rounded px-4 py-1.5 text-sm font-bold border border-primary bg-primary text-text-light hover:border-primary-hover hover:bg-primary-hover transition-all duration-300 cursor-pointer">
                    Try For Free
                </button>
                <button className="border border-text-main rounded px-4 py-1.5 text-sm font-semibold hover:bg-black hover:text-white transition-all duration-300 cursor-pointer">
                    Login
                </button>
            </div>

            {/* Mobile Toggle Button */}
            <div className="md:hidden">
                <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                className="text-text-main focus:outline-none"
                >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>


        {/* Mobile Dropdown */}
        {isMenuOpen && (
            <div className="md:hidden flex flex-col px-6 pb-4 space-y-3 font-regular-eng text-sm">
            {menuItems.map((item) => (
                <a
                key={item.label}
                href={item.href}
                className="font-semibold text-text-main hover:underline"
                >
                {item.label}
                </a>
            ))}

                <span className="flex items-center mt-3">
                    <svg
                        className="mr-1"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                    <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
                    </svg>
                    English
                </span>

                <button className="rounded px-4 py-2 text-sm font-bold bg-primary text-text-light hover:bg-primary-hover transition-all duration-300 mt-2 cursor-pointer">
                    Try For Free
                </button>
                <button className="border border-text-main rounded px-4 py-2 text-sm font-semibold hover:bg-black hover:text-white transition-all duration-300 cursor-pointer">
                    Login
                </button>
            </div>
        )}
        </header>
  );
};

export default Navbar;
