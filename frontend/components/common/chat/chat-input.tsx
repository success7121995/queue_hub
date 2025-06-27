"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend?: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
        if (value.trim() && onSend) {
            onSend(value);
            setValue("");
        }
  };

  return (
    <div className="w-full bg-white border-t border-border px-4 py-3 flex items-center gap-2">
        <input
            className="flex-1 rounded-full border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface placeholder-gray-400"
            type="text"
            placeholder="Type your message..."
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => {
            if (e.key === "Enter") handleSend();
            }}
        />
        <button
            className={cn(
            "ml-2 px-4 py-2 rounded-full bg-primary-light text-white font-semibold text-sm shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-50",
            !value.trim() && "cursor-not-allowed"
            )}
            onClick={handleSend}
            disabled={!value.trim()}
            type="button"
            aria-label="Send message"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </button>
    </div>
  );
};

export default ChatInput; 