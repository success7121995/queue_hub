import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
	isSender: boolean;
	avatarUrl?: string;
	username: string;
	timestamp: string;
	content: string;
	isPending?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
	isSender,
	username,
	timestamp,
	content,
	isPending = false,
}) => {
	return (
	<div
		className={cn(
		"flex w-full mb-4",
		isSender ? "justify-end" : "justify-start",
		isPending && "opacity-70"
		)}
	>
		<div className={cn(
		"max-w-[75%] flex flex-col",
		isSender ? "items-end" : "items-start"
		)}>
		<div className="flex items-center mb-1 space-x-2">
			<span className="text-xs font-semibold text-gray-700">
				{username}
			</span>
			<span className="text-xs text-gray-400">{timestamp}</span>
			{isPending && (
			<div className="flex items-center space-x-1">
				<svg className="w-3 h-3 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
				<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
				<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<span className="text-xs text-gray-400">Sending...</span>
			</div>
			)}
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
	</div>
	);
};

export default ChatMessage; 