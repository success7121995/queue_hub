"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useGetMessagePreview } from "@/hooks/user-hooks";
import ChatMessage from "./chat-message";
import ChatInput from "./chat-input";

const mockInbox = [
	{
		id: 1,
		username: "Alex",
		avatarUrl: "",
		lastMessage: "Hey! Can you check the new order?",
		timestamp: "09:45",
		unread: true,
	},
	{
		id: 2,
		username: "Jamie",
		avatarUrl: "",
		lastMessage: "Thanks for the update!",
		timestamp: "08:30",
		unread: false,
	},
];

const mockMessages = [
	{
		id: 1,
		isSender: false,
		username: "Alex",
		avatarUrl: "",
		timestamp: "09:45",
		content: "Hey! Can you check the new order?",
	},
	{
		id: 2,
		isSender: true,
		username: "You",
		avatarUrl: "",
		timestamp: "09:46",
		content: "Sure, I'll check it now.",
	},
];

const mockUsers = [
	{ id: 1, username: "Alex", avatarUrl: "" },
	{ id: 2, username: "Jamie", avatarUrl: "" },
	{ id: 3, username: "Taylor", avatarUrl: "" },
];

const Chatbox = () => {
	const [open, setOpen] = useState(false);
	const [view, setView] = useState<"inbox" | "chat" | "search">("inbox");
	const [selectedChat, setSelectedChat] = useState<number | null>(null);
	const [search, setSearch] = useState("");
	const [showOverlay, setShowOverlay] = useState(false);
	const boxRef = useRef<HTMLDivElement>(null);

	// Click outside to close
	useEffect(() => {
		if (!open) return;
		setShowOverlay(true);
		const handler = (e: MouseEvent) => {
			if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
				setOpen(false);
				setShowOverlay(false);
				setView("inbox");
				setSelectedChat(null);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open]);

	// ChatPreview inline (no new component)
	const ChatPreview = ({
		avatarUrl,
		username,
		lastMessage,
		timestamp,
		unread = false,
		onClick,
	}: {
		avatarUrl?: string;
		username: string;
		lastMessage: string;
		timestamp: string;
		unread?: boolean;
		onClick?: () => void;
	}) => (
		<button
			className={cn(
				"w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-surface border-b border-border transition-colors focus:outline-none",
				unread && "font-semibold"
			)}
			onClick={onClick}
			type="button"
		>
			<div className="flex-shrink-0">
				{avatarUrl ? (
					<img
						src={avatarUrl}
						alt={username}
						width={40}
						height={40}
						className="rounded-full object-cover"
					/>
				) : (
					<div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
						{username.charAt(0).toUpperCase()}
					</div>
				)}
			</div>
			<div className="flex-1 min-w-0 text-left">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-gray-900 truncate">{username}</span>
					<span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{timestamp}</span>
				</div>
				<div className="text-xs text-gray-600 truncate max-w-full">
					{lastMessage}
				</div>
			</div>
			{unread && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full" />}
		</button>
	);

	// Toggler icon (bottom right)
	const Toggler = (
		<button
			className="fixed bottom-6 right-6 z-40 bg-primary-light text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-primary-hover transition-colors focus:outline-none"
			onClick={() => setOpen(true)}
			aria-label="Open chat"
		>
			<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l.8-4A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
			</svg>
		</button>
	);

	// Overlay
	const Overlay = showOverlay ? (
		<div className="fixed inset-0 bg-black/20 z-30 transition-opacity" />
	) : null;

	// Inbox view
	const Inbox = (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary-light text-white">
				<span className="font-semibold text-base">Chat</span>
				<button
					className="text-white text-xl p-1 hover:bg-white/10 rounded-full"
					onClick={() => { setOpen(false); setShowOverlay(false); setView("inbox"); setSelectedChat(null); }}
					aria-label="Close chat"
				>
					&times;
				</button>
			</div>
			<div className="p-2">
				<input
					className="w-full rounded-full border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface placeholder-gray-400"
					placeholder="Search users or chats..."
					value={search}
					onChange={e => setSearch(e.target.value)}
					onFocus={() => setView("search")}
				/>
			</div>
			<div className="flex-1 overflow-y-auto">
				{mockInbox
					.filter(chat => chat.username.toLowerCase().includes(search.toLowerCase()))
					.map(chat => (
						<ChatPreview
							key={chat.id}
							avatarUrl={chat.avatarUrl}
							username={chat.username}
							lastMessage={chat.lastMessage}
							timestamp={chat.timestamp}
							unread={chat.unread}
							onClick={() => { setSelectedChat(chat.id); setView("chat"); }}
						/>
					))}
				{mockInbox.filter(chat => chat.username.toLowerCase().includes(search.toLowerCase())).length === 0 && (
					<div className="text-center text-gray-400 py-8 text-sm">No conversations found.</div>
				)}
			</div>
			<button
				className="w-full py-3 text-primary-light font-semibold border-t border-border bg-white hover:bg-surface transition-colors"
				onClick={() => setView("search")}
			>
				Start new conversation
			</button>
		</div>
	);

	// Search view
	const SearchView = (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary-light text-white">
				<button
					className="text-white text-xl p-1 hover:bg-white/10 rounded-full mr-2"
					onClick={() => setView("inbox")}
					aria-label="Back to inbox"
				>
					&#8592;
				</button>
				<span className="font-semibold text-base flex-1 text-center">New Conversation</span>
				<button
					className="text-white text-xl p-1 hover:bg-white/10 rounded-full"
					onClick={() => { setOpen(false); setShowOverlay(false); setView("inbox"); setSelectedChat(null); }}
					aria-label="Close chat"
				>
					&times;
				</button>
			</div>
			<div className="p-2">
				<input
					className="w-full rounded-full border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface placeholder-gray-400"
					placeholder="Search users..."
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
			</div>
			<div className="flex-1 overflow-y-auto">
				{mockUsers
					.filter(user => user.username.toLowerCase().includes(search.toLowerCase()))
					.map(user => (
						<ChatPreview
							key={user.id}
							avatarUrl={user.avatarUrl}
							username={user.username}
							lastMessage={""}
							timestamp={""}
							onClick={() => { setSelectedChat(user.id); setView("chat"); }}
						/>
					))}
				{mockUsers.filter(user => user.username.toLowerCase().includes(search.toLowerCase())).length === 0 && (
					<div className="text-center text-gray-400 py-8 text-sm">No users found.</div>
				)}
			</div>
		</div>
	);

	// Chat view
	const ChatView = (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary-light text-white">
				<button
					className="text-white text-xl p-1 hover:bg-white/10 rounded-full mr-2"
					onClick={() => setView("inbox")}
					aria-label="Back to inbox"
				>
					&#8592;
				</button>
				<span className="font-semibold text-base flex-1 text-center">{mockInbox.find(c => c.id === selectedChat)?.username || mockUsers.find(u => u.id === selectedChat)?.username}</span>
				<button
					className="text-white text-xl p-1 hover:bg-white/10 rounded-full"
					onClick={() => { setOpen(false); setShowOverlay(false); setView("inbox"); setSelectedChat(null); }}
					aria-label="Close chat"
				>
					&times;
				</button>
			</div>
			<div className="flex-1 overflow-y-auto px-2 py-4 bg-surface">
				{mockMessages.map(msg => (
					<ChatMessage key={msg.id} {...msg} />
				))}
			</div>
			<div className="border-t border-border bg-white">
				<ChatInput />
			</div>
		</div>
	);

	// Main chat box
	const ChatBox = (
		<div
			ref={boxRef}
			className="fixed bottom-6 right-6 w-full max-w-xs h-[450px] z-50 flex flex-col rounded-2xl shadow-2xl bg-white overflow-hidden animate-fade-in font-regular-eng"
			style={{ transition: "box-shadow 0.2s" }}
		>
			{view === "inbox" && Inbox}
			{view === "search" && SearchView}
			{view === "chat" && ChatView}
		</div>
	);

	return (
		<>
			{!open && Toggler}
			{open && Overlay}
			{open && ChatBox}
		</>
	);
};

export default Chatbox;