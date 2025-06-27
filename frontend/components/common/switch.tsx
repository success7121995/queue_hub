"use client";

import React from "react";

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, disabled = false, className = "", ...props }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
        ${checked ? 'bg-primary-light' : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
    {...props}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
        ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

export default Switch;