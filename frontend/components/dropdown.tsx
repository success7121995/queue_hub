"use client"

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// Define the type for the dropdown items
export type DropdownItem = {
    label: string;
    value: string;
    icon?: React.ReactNode;
    href?: string;
    fontSize?: number;
}

// Define the type for the dropdown props
type DropdownProps = {
    items: DropdownItem[];
    selected?: DropdownItem;
    onSelect?: (item: DropdownItem) => void;
    placeholder?: string;
    className?: string;
  };

const Dropdown = ({
    items,
    selected,
    onSelect,
    placeholder = "Select...",
    className = "",
}: DropdownProps) => {
    // State for the dropdown open/closed state
    const [isOpen, setIsOpen] = useState(false);
    
    // State for the selected item
    const [selectedItem, setSelectedItem] = useState<DropdownItem | undefined>(selected);

    // Reference to the dropdown container
    const ref = useRef<HTMLDivElement>(null);

    // Handle the selection of an item
    const handleSelect = (item: DropdownItem) => {
        setSelectedItem(item);
        onSelect?.(item);
        setIsOpen(false);
    };

      // Close dropdown on outside click
  useEffect(() => {
    // Function to handle outside clicks
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    // Add event listener for outside clicks
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
    
    return (
        <div ref={ref} className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`cursor-pointer flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:border-gray-400 transition ${className}`}
                style={{ fontSize: selectedItem?.fontSize ? selectedItem.fontSize : 12 }}
            >
                <div className="flex items-center gap-2">
                    {selectedItem?.icon}
                    <span>{selectedItem?.label || placeholder}</span>
                </div>

                <ChevronDown size={16} />
            </button>
  
            {isOpen && (
                <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-auto">

                {items.map((item) => (
                    <li
                        key={item.value}
                        onClick={() => handleSelect(item)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                        style={{ fontSize: item.fontSize ? item.fontSize : 13 }}
                    >
                        {item.icon}
                        {item.label}
                    </li>
                ))}
                </ul>
        )}
      </div>
    )
}

export default Dropdown;