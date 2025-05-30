"use client";

import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ExportBtnProps<T> {
	data: T[];
    filename: string;
}

const ExportBtn = <T extends Record<string, any>>(
    { data, filename = 'data' }: ExportBtnProps<T>
) => {

    if (!data || data.length === 0) {
        return null;
    }

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isOpen]);

    /**
     * Download CSV
     */
    const handleDownloadCSV = () => {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => row[header]).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Download JSON
     */
    const handleDownloadJSON = () => {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Toggle dropdown
     */
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div ref={dropdownRef} className="relative inline-block">
            <button
                onClick={toggleDropdown}
                className="px-2 py-[7px] rounded text-xs flex items-center gap-2 mb-4 bg-text-main text-text-light cursor-pointer shadow-sm"
            >
                <span className="text-xs">Export</span>
                <ChevronDown className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="absolute top-5 left-15 border border-gray-200 bg-white shadow-sm rounded-md z-50 w-[150px] overflow-hidden">
                    <button
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-primary-light/80 hover:text-white cursor-pointer"
                        onClick={handleDownloadJSON}
                    >
                        Export as JSON
                    </button>
                    <button
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-primary-light/80 hover:text-white cursor-pointer"
                        onClick={handleDownloadCSV}
                    >
                        Export as CSV
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportBtn;