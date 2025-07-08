"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Paperclip, X } from "lucide-react";
import Image from "next/image";
import { validateFile, createImagePreview, revokeImagePreview } from "@/lib/file-helpers";

interface ChatInputProps {
  onSend?: (message: string, file?: File) => void;
  isSending?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isSending = false }) => {
  const [value, setValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((value.trim() || selectedFile) && onSend && !isSending) {
      onSend(value, selectedFile || undefined);
      setValue("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const url = createImagePreview(file);
        setPreviewUrl(url);
      }
    }
  };

  const removeFile = () => {
    // Clean up preview URL to prevent memory leaks
    if (previewUrl) {
      revokeImagePreview(previewUrl);
      setPreviewUrl(null);
    }
    
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        revokeImagePreview(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="w-full bg-white border-t border-border px-4 py-3">
      {/* File attachment preview */}
      {selectedFile && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedFile.type.startsWith('image/') ? (
                <div className="w-8 h-8 relative">
                  <Image
                    src={previewUrl || ''}
                    alt="Preview"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                  <span className="text-red-600 text-xs font-bold">PDF</span>
                </div>
              )}
              <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-600 p-1"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* File attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors",
            isSending && "opacity-50 cursor-not-allowed"
          )}
          disabled={isSending}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*, application/pdf"
          onChange={handleFileSelect}
          disabled={isSending}
        />

        {/* Text input - disabled if a file is selected */}
        <input
          className="flex-1 rounded-full border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface placeholder-gray-400 disabled:opacity-50"
          type="text"
          placeholder={isSending ? "Sending..." : selectedFile ? "Type disabled when sending a file" : "Type your message..."}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={isSending || !!selectedFile}
        />

        {/* Send button */}
        <button
          className={cn(
            "ml-2 px-4 py-2 rounded-full bg-primary-light text-white font-semibold text-sm shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center min-w-[44px]",
            ((!value.trim() && !selectedFile) || isSending) && "cursor-not-allowed"
          )}
          onClick={handleSend}
          disabled={(!value.trim() && !selectedFile) || isSending}
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
    </div>
  );
};

export default ChatInput; 