"use client"

import { useState } from "react";
import Dropdown, { DropdownItem } from "../common/dropdown";


const Footer = () => {
      /**********    Languages    **********/
  const languages = [
    { label: "English", value: "en"},
    { label: "繁體（香港）", value: "zh-HK"},
    { label: "繁體（台灣）", value: "zh-TW"},
    { label: "简体", value: "zh-CN"},
  ];

  const [selectedLanguage, setSelectedLanguage] = useState<DropdownItem>(languages[0]);

    return (
        <footer className="bg-surface py-10 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] font-regular-eng">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand & Language */}
                <div>
                    <div className="font-bold italic text-xl mb-2">QueueHub</div>
                    <div className="flex items-center space-x-2 mt-4">
                        <Dropdown 
                            className="w-[140px]"
                            selected={selectedLanguage}
                            onSelect={setSelectedLanguage}
                            items={languages}
                        />
                    </div>
                </div>

                {/* Product */}
                <div>
                    <div className="font-bold mb-2 text-primary">Product</div>
                    <ul className="space-y-1 text-sm">
                    <li><a href="#" className="hover:underline">How It Works</a></li>
                    <li><a href="/features/real-time-updates" className="hover:underline">Features</a></li>
                    <li><a href="#pricing" className="hover:underline">Pricing</a></li>
                    <li><a href="#" className="hover:underline">FAQ</a></li>
                    <li><a href="/signup" className="hover:underline">Try it Free</a></li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <div className="font-bold mb-2 text-primary">Company</div>
                    <ul className="space-y-1 text-sm">
                    <li><a href="/about-us" className="hover:underline">About QueueHub</a></li>
                    <li><a href="#" className="hover:underline">Career</a></li>
                    <li><a href="/privacy-policy" className="hover:underline">Privacy Policy</a></li>
                    <li><a href="/terms-of-service" className="hover:underline">Terms of Service</a></li>
                    </ul>
                </div>

                {/* Contact & Support */}
                <div>
                    <div className="font-bold mb-2 text-primary">Contact & Support</div>
                    <ul className="space-y-1 text-sm">
                    <li><a href="#" className="hover:underline">Help Center</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;