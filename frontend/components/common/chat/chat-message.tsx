import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  isSender: boolean;
  avatarUrl?: string;
  username: string;
  timestamp: string;
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  isSender,
  avatarUrl,
  username,
  timestamp,
  content,
}) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isSender ? "justify-end" : "justify-start"
      )}
    >
      {!isSender && (
        <div className="flex-shrink-0 mr-2">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={username}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      <div className={cn(
        "max-w-[75%] flex flex-col",
        isSender ? "items-end" : "items-start"
      )}>
        <div className="flex items-center mb-1 space-x-2">
          <span className="text-xs font-semibold text-gray-700">
            {username}
          </span>
          <span className="text-xs text-gray-400">{timestamp}</span>
        </div>
        <div
          className={cn(
            "px-4 py-2 rounded-2xl text-sm break-words",
            isSender
              ? "bg-primary-light text-white rounded-br-md"
              : "bg-surface text-gray-900 rounded-bl-md border border-border"
          )}
        >
          {content}
        </div>
      </div>
      {isSender && (
        <div className="flex-shrink-0 ml-2">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={username}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 