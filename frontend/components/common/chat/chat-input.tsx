"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend?: (message: string) => void;
  isSending?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isSending = false }) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
        if (value.trim() && onSend && !isSending) {
            onSend(value);
            setValue("");
        }
  };

  return (
    <div className="w-full bg-white border-t border-border px-4 py-3 flex items-center gap-2">
        <input
            className="flex-1 rounded-full border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface placeholder-gray-400 disabled:opacity-50"
            type="text"
            placeholder={isSending ? "Sending..." : "Type your message..."}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => {
            if (e.key === "Enter") handleSend();
            }}
            disabled={isSending}
        />
        <button
            className={cn(
            "ml-2 px-4 py-2 rounded-full bg-primary-light text-white font-semibold text-sm shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center min-w-[44px]",
            (!value.trim() || isSending) && "cursor-not-allowed"
            )}
            onClick={handleSend}
            disabled={!value.trim() || isSending}
            type="button"
            aria-label={isSending ? "Sending message..." : "Send message"}
        >
            {isSending ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            )}
        </button>
    </div>
  );
};

export default ChatInput; 