"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { cn, cleanFileName } from "@/lib/utils";
import ChatMessage from "./chat-message";
import ChatInput from "./chat-input";
import { connectSocket, onMessagePreviews, onReceiveMessage, onMessageSent, sendMessage, getLastMessages, joinRoom, markMessageAsRead, onMessageRead, hideChat, sendMessageWithAttachment, onNotificationUpdate, getNotifications, onNotificationDeleted, enterChatRoom, onChatRoomEntered } from "@/lib/socket";
import { useGetEmployees, fetchHideChat, fetchGetConversation } from "@/hooks/user-hooks";
import { useGetAdmins } from "@/hooks/admin-hooks";
import { useAuth } from "@/hooks/auth-hooks";
import { useChat } from "@/contexts/chat-context";
import Image from "next/image";
import { LoadingIndicator } from "@/components";

const Chatbox = () => {
	const { isOpen: open, selectedChat, openChat, closeChat, setSelectedChat } = useChat();
	const [view, setView] = useState<"inbox" | "chat" | "search">("inbox"); // View state
	const [search, setSearch] = useState(""); // Search term
	const [showOverlay, setShowOverlay] = useState(false); // Show overlay when chatbox is open
	const [inbox, setInbox] = useState<any[]>([]); // Inbox data
	const [shouldAutoScroll, setShouldAutoScroll] = useState(true); // Auto-scroll to bottom when new messages are added
	const [isSending, setIsSending] = useState(false); // Sending state
	const [pendingMessages, setPendingMessages] = useState<Array<{id: string; content: string; timestamp: string}>>([]); // Pending messages state
	const [markedAsRead, setMarkedAsRead] = useState<Set<string>>(new Set()); // Marked as read state
	const [showDeleteModal, setShowDeleteModal] = useState(false); // Show delete modal state
	const [chatToDelete, setChatToDelete] = useState<string | null>(null); // Chat to delete state
	const [showChatOptions, setShowChatOptions] = useState<string | null>(null); // Show chat options state
	const [isDeleting, setIsDeleting] = useState(false); // Deleting state
	const [messages, setMessages] = useState<any[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	
	// References
	const boxRef = useRef<HTMLDivElement>(null); // Box reference	
	const messagesContainerRef = useRef<HTMLDivElement>(null); // Messages container reference
	const bottomAnchorRef = useRef<HTMLDivElement>(null); // Bottom anchor reference

	// Get user ID from auth context
	const { data: authData } = useAuth();
	const userId = authData?.user?.user_id;
	const userRole = authData?.user?.role;
	const merchantId = authData?.user?.UserMerchant?.merchant_id;

	// Get members who are at the same merchant (for merchants)
	const { data: membersData, isLoading: membersLoading, isError: membersError } = useGetEmployees({
		enabled: open && (view === "search" || view === "inbox") && userRole === "MERCHANT",
	});

	// Get all admin users (for admins)
	const { data: adminsData, isLoading: adminsLoading, isError: adminsError } = useGetAdmins({
		enabled: open && (view === "search" || view === "inbox") && userRole === "ADMIN",
	});

	// Get messages from conversation data
	const messagesState = messages || [];

	/**
	 * Filter searchable users based on role-based rules
	 */
	const searchableUsers = useMemo(() => {
		if (!userId) return [];

		// For merchants: filter users from the same merchant
		if (userRole === "MERCHANT") {
			if (!membersData?.result) return [];

			const users = membersData.result;
			
			// Filter out the current user (can't message self)
			const filteredUsers = users.filter(user => user.user_id !== userId);

			// All members in the same company (same merchant) can search each other
			// Filter to only include users from the same merchant
			return filteredUsers.filter(user => 
				user.merchant_id === merchantId && 
				user.User?.status === 'ACTIVE'
			);
		}

		// For admins: filter all admin users
		if (userRole === "ADMIN") {
			if (!adminsData?.result) return [];

			const users = adminsData.result;
			
			// Filter out the current user (can't message self)
			const filteredUsers = users.filter(user => user.user_id !== userId);

			// All admins can search each other
			return filteredUsers.filter(user => user.status === 'ACTIVE');
		}

		return [];
	}, [membersData?.result, adminsData?.result, userId, merchantId, userRole]);

	/**
	 * Filter users based on search term
	 */
	const filteredSearchUsers = useMemo(() => {
		if (!search.trim()) return searchableUsers;
		
		return searchableUsers.filter(user => {
			// For merchants: UserMerchant objects with nested User
			if (userRole === "MERCHANT") {
				const merchantUser = user as any; // UserMerchant type
				return (
					merchantUser.User?.username?.toLowerCase().includes(search.toLowerCase()) ||
					merchantUser.User?.fname?.toLowerCase().includes(search.toLowerCase()) ||
					merchantUser.User?.lname?.toLowerCase().includes(search.toLowerCase()) ||
					merchantUser.position?.toLowerCase().includes(search.toLowerCase())
				);
			}
			
			// For admins: User objects directly
			if (userRole === "ADMIN") {
				const adminUser = user as any; // User type
				return (
					adminUser.username?.toLowerCase().includes(search.toLowerCase()) ||
					adminUser.fname?.toLowerCase().includes(search.toLowerCase()) ||
					adminUser.lname?.toLowerCase().includes(search.toLowerCase()) ||
					adminUser.UserAdmin?.position?.toLowerCase().includes(search.toLowerCase())
				);
			}
			
			return false;
		});
	}, [searchableUsers, search, userRole]);

	/**
	 * Get selected user information
	 */
	const selectedUser = useMemo(() => {
		if (!selectedChat) return null;
		
		// First check if it's in the inbox (existing conversation)
		const inboxUser = inbox.find(preview => preview.other_user_id === selectedChat);
		if (inboxUser) {
			return {
				user_id: selectedChat,
				username: inboxUser.other_username,
				avatar_url: inboxUser.other_avatar_url
			};
		}
		
		// Then check if it's in the searchable users (new conversation)
		const searchUser = searchableUsers.find(user => user.user_id === selectedChat);
		if (searchUser) {
			// For merchants: UserMerchant objects with nested User
			if (userRole === "MERCHANT") {
				const merchantUser = searchUser as any; // UserMerchant type
				return {
					user_id: selectedChat,
					username: merchantUser.User?.username || `${merchantUser.User?.fname} ${merchantUser.User?.lname}`.trim(),
					avatar_url: merchantUser.User?.Avatar?.image_url
				};
			}
			
			// For admins: User objects directly
			if (userRole === "ADMIN") {
				const adminUser = searchUser as any; // User type
				return {
					user_id: selectedChat,
					username: adminUser.username || `${adminUser.fname} ${adminUser.lname}`.trim(),
					avatar_url: adminUser.Avatar?.image_url
				};
			}
		}
		
		return null;
	}, [selectedChat, inbox, searchableUsers, userRole]);

	/**
	 * Scroll to bottom immediately without animation
	 */
	const scrollToBottom = useCallback(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, []);

	/**
	 * Scroll to bottom with smooth animation
	 */
	const scrollToBottomSmooth = useCallback(() => {
		if (bottomAnchorRef.current) {
			bottomAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, []);

	/**
	 * Consolidated socket event handlers
	 */
	const handleMessagePreviews = useCallback((previews: any[]) => {
		setInbox(previews || []);
	}, []);

	const handleReceiveMessage = useCallback((msg: any) => {
		if (view === "chat" && selectedChat && (msg.sender_id === selectedChat || msg.receiver_id === selectedChat)) {
			setMessages(prev => {
				// Prevent duplicate messages
				if (prev.some(m => m.message_id === msg.message_id)) return prev;
				return [...prev, msg];
			});
			// Scroll to bottom when a new message is received
			setTimeout(() => {
				scrollToBottomSmooth();
			}, 100);
		}
		if (userId) {
			getLastMessages(userId);
		}
	}, [view, selectedChat, userId, scrollToBottomSmooth]);

	const handleMessageSent = useCallback((data: { success: boolean; message?: any; error?: string }) => {
		if (data.success) {
			// Clear sending state - the pending message will be handled by the displayMessages logic
			setIsSending(false);
		} else {
			// Handle error - could show a toast notification here
			console.error("Failed to send message:", data.error);
			setIsSending(false);
			// Remove the last pending message on error
			setPendingMessages(prev => prev.slice(0, -1));
		}
	}, []);

	const handleMessageRead = useCallback((data: { message_id: string; is_read: boolean }) => {
		// Refresh previews when a message is marked as read
		if (userId) {
			getLastMessages(userId);
		}
	}, [userId]);

	const handleNotificationUpdate = useCallback((data: { notifications: any[]; unreadCount: number }) => {
		// Handle notification updates if needed
		// This could be used to update global notification state
	}, []);

	const handleNotificationDeleted = useCallback((data: { success: boolean; notification_id: string }) => {
		// Handle notification deletion confirmation if needed
		// This could be used to update global notification state
	}, []);

	const handleChatRoomEntered = useCallback((data: { success: boolean; sender_id: string }) => {
		// Handle chat room entered confirmation if needed
		// This could be used to update global notification state
	}, []);

	/**
	 * Socket.io setup and real-time handlers - CONSOLIDATED
	 */
	useEffect(() => {
		if (!open || !userId) return;
		
		connectSocket();
		joinRoom(userId);
		
		/**
		 * Request initial previews and unread count
		 */
		getLastMessages(userId);
		
		/**
		 * Register all socket event listeners
		 */
		const unregisterPreviews = onMessagePreviews(handleMessagePreviews);
		const unregisterReceive = onReceiveMessage(handleReceiveMessage);
		const unregisterMessageSent = onMessageSent(handleMessageSent);
		const unregisterMessageRead = onMessageRead(handleMessageRead);
		const unregisterNotificationUpdate = onNotificationUpdate(handleNotificationUpdate);
		const unregisterNotificationDeleted = onNotificationDeleted(handleNotificationDeleted);
		const unregisterChatRoomEntered = onChatRoomEntered(handleChatRoomEntered);
		
		/**
		 * Cleanup function - properly unregister all listeners
		 */
		return () => {
			unregisterPreviews();
			unregisterReceive();
			unregisterMessageSent();
			unregisterMessageRead();
			unregisterNotificationUpdate();
			unregisterNotificationDeleted();
			unregisterChatRoomEntered();
		};
	}, [open, userId, handleMessagePreviews, handleReceiveMessage, handleMessageSent, handleMessageRead, handleNotificationUpdate, handleNotificationDeleted, handleChatRoomEntered]);

	/**
	 * Handle selecting a chat
	 */
	const handleSelectChat = useCallback((other_user_id: string) => {
		// Clear pending messages when switching conversations
		setPendingMessages([]);
		// Clear marked as read tracking when switching conversations
		setMarkedAsRead(new Set());
		setSelectedChat(other_user_id);
		setView("chat");
		setSearch(""); // Clear search when starting a conversation
		
		// Mark unread messages as read when entering a chat
		if (userId && other_user_id) {
			markUnreadMessagesAsRead(other_user_id);
		}

		// Delete notifications for this sender when entering chat
		if (userId && other_user_id) {
			enterChatRoom(userId, other_user_id);
		}
	}, [userId]);

	/**
	 * Function to mark unread messages as read
	 */
	const markUnreadMessagesAsRead = useCallback((other_user_id: string) => {
		if (!userId || !other_user_id || !messages.length) return;
		const unreadMessages = messages.filter(msg =>
			msg.sender_id === other_user_id &&
			msg.receiver_id === userId &&
			!msg.is_read &&
			!markedAsRead.has(msg.message_id)
		);
		unreadMessages.forEach(msg => {
			markMessageAsRead(msg.message_id, userId, other_user_id);
			setMarkedAsRead(prev => new Set([...prev, msg.message_id]));
		});
	}, [userId, messages, markedAsRead]);

	/**
	 * Mark messages as read when conversation data updates and user is actively viewing
	 */
	useEffect(() => {
		if (view === "chat" && selectedChat && userId && messages.length > 0) {
			// Mark unread messages as read when actively viewing a conversation
			markUnreadMessagesAsRead(selectedChat);
		}
	}, [messages, view, selectedChat, userId, markUnreadMessagesAsRead]);

	/**
	 * Handle starting a new conversation
	 */
	const handleStartNewConversation = useCallback(() => {
		// Check if there are any searchable users
		if (searchableUsers.length === 0) {
			// Could show a toast notification here	
			return;
		}
		
		setView("search");
		setSearch(""); // Clear any existing search
		setSelectedChat(null);
		// Clear marked as read tracking when starting new conversation
		setMarkedAsRead(new Set());
	}, [searchableUsers.length, setSelectedChat]);

	/**
	 * Consolidated click outside handler
	 */
	const handleClickOutside = useCallback((e: MouseEvent) => {
		// Don't dismiss if the delete modal is open
		if (showDeleteModal) return;
		
		// Handle chatbox close
		if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
			closeChat();
			setShowOverlay(false);
			setView("inbox");
			// Clear pending messages when closing
			setPendingMessages([]);
			// Clear marked as read tracking when closing
			setMarkedAsRead(new Set());
			setIsSending(false);
			// Close options dropdown
			setShowChatOptions(null);
		}
		
		// Handle chat options close
		if (showChatOptions && !(e.target as Element).closest('.chat-options')) {
			setShowChatOptions(null);
		}
	}, [showDeleteModal, showChatOptions, closeChat]);

	/**
	 * Single click outside listener
	 */
	useEffect(() => {
		if (!open) return;
		setShowOverlay(true);
		
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [open, handleClickOutside]);

	/**
	 * Handle sending a message with optimistic updates
	 */
	const handleSendMessage = useCallback((content: string, file?: File) => {
		if (!selectedChat || !userId || (!content.trim() && !file) || isSending) return;

		const pendingId = `pending-${Date.now()}`;
		const timestamp = new Date().toISOString().slice(11, 16);

		// Only add pending message for text messages (not attachments)
		if (!file && content.trim()) {
			setPendingMessages(prev => [...prev, { id: pendingId, content: content, timestamp }]);
		}
		setIsSending(true);

		if (file) {
			// Use fetch to upload, then emit socket event to notify
			const formData = new FormData();
			formData.append('receiverId', selectedChat);
			formData.append('ATTACHMENT', file);
			formData.append('content', content); // Only send content if provided

			sendMessageWithAttachment(formData, userId, selectedChat, content, file, Date.now());
			fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/send-with-attachment`, {
				method: 'POST',
				credentials: 'include',
				body: formData,
			})
			.then(res => res.json())
			.then(res => {
				setIsSending(false);
				if (res.success) {
					setMessages(prev => [...prev, res.message]);
					if ((window as any).socket) {
						(window as any).socket.emit('sendMessageWithAttachment', { message: res.message });
					}
					// No pending bubble to remove for attachments
				}
			})
			.catch(error => {
				setIsSending(false);
			});
		} else {
			sendMessage(userId, selectedChat, content);
		}

		setTimeout(() => {
			setIsSending(false);
		}, 10000); // 10 second timeout
	}, [selectedChat, userId, isSending]);

	/**
	 * Handle showing chat options
	 */
	const handleShowChatOptions = useCallback((other_user_id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setShowChatOptions(showChatOptions === other_user_id ? null : other_user_id);
	}, [showChatOptions]);

	/**
	 * Handle delete chat
	 */
	const handleDeleteChat = useCallback((other_user_id: string) => {
		setChatToDelete(other_user_id);
		setShowDeleteModal(true);
		setShowChatOptions(null);
	}, []);

	/**
	 * Handle confirm delete
	 */
	const handleConfirmDelete = useCallback(() => {
		if (chatToDelete && userId) {
			setIsDeleting(true);
			// Call the API directly since the hook parameters are fixed
			fetchHideChat(userId, chatToDelete)
				.then(() => {
					// Optimistically remove the chat from the inbox
					setInbox(prev => prev.filter(chat => chat.other_user_id !== chatToDelete));
					// If the deleted chat is currently selected, clear it
					if (selectedChat === chatToDelete) {
						setSelectedChat(null);
						setView("inbox");
					}
					// Refresh inbox after hiding chat
					if (userId) {
						getLastMessages(userId);
					}
					setShowDeleteModal(false);
					setChatToDelete(null);
				})
				.catch((error: Error) => {
					console.error("Failed to hide chat:", error);
					// Could show a toast notification here
				})
				.finally(() => {
					setIsDeleting(false);
				});
			// Also emit socket event for real-time sync
			hideChat(userId, chatToDelete);
		}
	}, [chatToDelete, userId, selectedChat, setSelectedChat]);

	/**
	 * Handle cancel delete
	 */
	const handleCancelDelete = useCallback(() => {
		setShowDeleteModal(false);
		setChatToDelete(null);
	}, []);

	/**
	 * Combine real messages with pending messages for display
	 */
	const displayMessages = useMemo(() => {
		// Get real messages from the conversation
		const realMessages = messages || [];
		
		// Get pending messages that haven't been confirmed yet
		const pendingMessagesToShow = pendingMessages.filter(pm => {
			// Check if this pending message has been confirmed by comparing with real messages
			const isConfirmed = realMessages.some(rm => 
				rm.content === pm.content && 
				rm.sender_id === userId &&
				rm.receiver_id === selectedChat
			);
			// Only show pending bubble for text messages (not attachments)
			return !isConfirmed && pm.content && !pm.content.startsWith('📎 ');
		});
		
		// Combine real messages with unconfirmed pending messages
		return [
			...realMessages,
			...pendingMessagesToShow.map(pm => ({
				message_id: pm.id,
				sender_id: userId,
				receiver_id: selectedChat,
				content: pm.content,
				created_at: pm.timestamp,
				isPending: true
			}))
		];
	}, [messages, pendingMessages, userId, selectedChat]);

	/**
	 * Chat preview component
	 * @param param0 
	 * @returns 
	 */
	const ChatPreview = ({
		avatarUrl,
		username,
		lastMessage,
		timestamp,
		unread = false,
		onClick,
		other_user_id,
	}: {
		avatarUrl?: string;
		username: string;
		lastMessage: string;
		timestamp: string;
		unread?: boolean;
		onClick?: () => void;
		other_user_id: string;
	}) => (
		<div className="relative group">
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
						avatarUrl.startsWith("/") || avatarUrl.startsWith("http") ? (
							<Image
								src={avatarUrl.startsWith("http") ? avatarUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL}${avatarUrl}`}
								alt={username}
								width={40}
								height={40}
								className="rounded-full object-cover w-12 h-12"
							/>
						) : (
							<div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
								{username.charAt(0).toUpperCase()}
							</div>
						)
					) : (
						<div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
							{username.charAt(0).toUpperCase()}
						</div>
					)}
				</div>
				<div className="flex-1 min-w-0 text-left">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-gray-900 truncate">{username || "Unknown User"}</span>
						<span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{timestamp}</span>
					</div>
					<div className="text-xs text-gray-600 truncate max-w-full">
						{lastMessage.trim() ? lastMessage : "📎 Attachment"}
					</div>
				</div>
				{unread && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full" />}
			</button>
			
			{/* Three dots menu */}
			<button
				className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full z-10"
				onClick={(e) => handleShowChatOptions(other_user_id, e)}
				type="button"
				aria-label="Chat options"
			>
				<svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
					<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
				</svg>
			</button>

			{/* Options dropdown */}
			{showChatOptions === other_user_id && (
				<div className="absolute right-0 top-full z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px] chat-options" style={{ transform: 'translateY(2px)' }}>
					<button
						className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
						onClick={(e) => { e.stopPropagation(); handleDeleteChat(other_user_id); }}
						type="button"
					>
						Delete
					</button>
				</div>
			)}
		</div>
	);

	/**
	 * User search item component
	 * @param param0 
	 * @returns 
	 */
	const UserSearchItem = ({
		user,
		onClick,
	}: {
		user: any;
		onClick?: () => void;
	}) => {
		let username: string;
		let avatarUrl: string | undefined;
		let position: string;

		// For merchants: UserMerchant objects with nested User
		if (userRole === "MERCHANT") {
			username = user.User?.username || `${user.User?.fname} ${user.User?.lname}`.trim() || "Unknown User";
			avatarUrl = user.User?.Avatar?.image_url;
			position = user.position || "Staff";
		}
		// For admins: User objects directly
		else if (userRole === "ADMIN") {
			username = user.username || `${user.fname} ${user.lname}`.trim() || "Unknown User";
			avatarUrl = user.Avatar?.image_url;
			position = user.UserAdmin?.position || "Admin";
		}
		else {
			username = "Unknown User";
			avatarUrl = undefined;
			position = "User";
		}
		
		return (
			<button
				className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-surface border-b border-border transition-colors focus:outline-none"
				onClick={onClick}
				type="button"
			>
				<div className="flex-shrink-0">
					{avatarUrl ? (
						avatarUrl.startsWith("/") || avatarUrl.startsWith("http") ? (
							<Image
								src={avatarUrl.startsWith("http") ? avatarUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL}${avatarUrl}`}
								alt={username}
								width={40}
								height={40}
								className="rounded-full object-cover w-12 h-12"
							/>
						) : (
							<div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
								{username.charAt(0).toUpperCase()}
							</div>
						)
					) : (
						<div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
							{username.charAt(0).toUpperCase()}
						</div>
					)}
				</div>
				<div className="flex-1 min-w-0 text-left">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-gray-900 truncate">{username}</span>
					</div>
					<div className="text-xs text-gray-600 truncate max-w-full">
						{position}
					</div>
				</div>
			</button>
		);
	};

	/**
	 * Toggler icon (bottom right)
	 */
	const Toggler = (
		<button
			className="fixed bottom-6 right-6 z-40 bg-primary-light text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-primary-hover transition-colors focus:outline-none"
			onClick={() => {
				if (!open) {
					openChat("");
					setView("inbox");
				}
			}}
			aria-label="Open chat"
		>
			<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l.8-4A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
			</svg>
		</button>
	);

	/**
	 * Overlay
	 * @returns 
	 */
	const Overlay = showOverlay ? (
		<div className="fixed inset-0 bg-black/20 z-30 transition-opacity" />
	) : null;

	/**
	 * Inbox view
	 */
	const Inbox = (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary-light text-white">
				<span className="font-semibold text-base">Chat</span>
				<button
					className="text-white text-xl p-1 hover:bg-white/10 rounded-full"
					onClick={() => { closeChat(); setShowOverlay(false); setView("inbox"); }}
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
					onFocus={() => {
						if (search.trim()) {
							setView("search");
						}
					}}
				/>
			</div>
			<div className="flex-1 overflow-y-auto">
				{inbox.length === 0 ? (
					<div className="flex items-center justify-center py-8">
						<LoadingIndicator size="sm" />
					</div>
				) : (
					inbox
						.filter(preview => (preview.other_username || "").toLowerCase().includes(search.toLowerCase()))
						.map(preview => (
							<ChatPreview
								key={preview.message_id}
								avatarUrl={preview.other_avatar_url}
								username={preview.other_username}
								lastMessage={(() => {
									// If the content starts with '📎 ', treat the rest as the file name
									if (preview.content && preview.content.startsWith('📎 ')) {
										return preview.content;
									}
									// Otherwise, show the text content
									return preview.content;
								})()}
								timestamp={typeof preview.created_at === 'string' ? preview.created_at.slice(11, 16) : ''}
								unread={!preview.is_read}
								onClick={() => handleSelectChat(preview.other_user_id)}
								other_user_id={preview.other_user_id}
							/>
						))
				)}
			</div>
			<button
				className="w-full py-3 text-primary-light font-semibold border-t border-border bg-white hover:bg-surface transition-colors"
				onClick={handleStartNewConversation}
			>
				Start new conversation
			</button>
		</div>
	);

	/**
	 * Search view (placeholder)
	 * @returns 
	 */
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
					onClick={() => { closeChat(); setShowOverlay(false); setView("inbox"); }}
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
				{(userRole === "MERCHANT" && membersLoading) || (userRole === "ADMIN" && adminsLoading) ? (
					<div className="flex items-center justify-center py-8">
						<LoadingIndicator size="sm" />
					</div>
				) : (userRole === "MERCHANT" && membersError) || (userRole === "ADMIN" && adminsError) ? (
					<div className="text-center text-red-400 py-8 text-sm">Error loading users</div>
				) : filteredSearchUsers.length === 0 ? (
					<div className="text-center text-gray-400 py-8 text-sm">
						{search.trim() ? "No users found" : `No ${userRole === "MERCHANT" ? "members" : "admins"} available`}
					</div>
				) : (
					<>
						{search.trim() && (
							<div className="px-4 py-2 text-xs text-gray-500 border-b border-border">
								{filteredSearchUsers.length} {userRole === "MERCHANT" ? "member" : "admin"}{filteredSearchUsers.length !== 1 ? 's' : ''} found
							</div>
						)}
						{filteredSearchUsers.map(user => (
							<UserSearchItem
								key={user.user_id}
								user={user}
								onClick={() => handleSelectChat(user.user_id)}
							/>
						))}
					</>
				)}
			</div>
		</div>
	);

	/**
	 * Chat view
	 * @returns 
	 */
	const ChatView = (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary-light text-white">
				<div className="flex items-center gap-2">
					<button
						className="text-white text-xl p-1 hover:bg-white/10 rounded-full"
						onClick={() => setView("inbox")}
						aria-label="Back to inbox"
					>
						&#8592;
					</button>
					<div className="flex items-center gap-2">
						{selectedUser?.avatar_url ? (
							selectedUser.avatar_url.startsWith("/") || selectedUser.avatar_url.startsWith("http") ? (
								<Image
									src={selectedUser.avatar_url.startsWith("http") ? selectedUser.avatar_url : `${process.env.NEXT_PUBLIC_BACKEND_URL}${selectedUser.avatar_url}`}
									alt={selectedUser.username || "Unknown User"}
									width={20}
									height={20}
									className="rounded-full object-cover w-10 h-10"
								/>
							) : (
								<div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
									{selectedUser.username?.charAt(0).toUpperCase()}
								</div>
							)
						) : (
							<div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
								{selectedUser?.username?.charAt(0).toUpperCase()}
							</div>
						)}
						<span className="font-semibold text-base flex-1 text-center">
							{selectedUser?.username || "Unknown User"}
						</span>
					</div>
				</div>
				<button
					className="text-white text-xl p-1 hover:bg-white/10 rounded-full"
					onClick={() => { closeChat(); setShowOverlay(false); setView("inbox"); }}
					aria-label="Close chat"
				>
					&times;
				</button>
			</div>
			<div 
				ref={messagesContainerRef}
				className="flex-1 overflow-y-auto px-2 py-4 bg-surface"
			>
				{/* Loading indicator for infinite scroll */}
				{isLoadingMore && (
					<div className="flex justify-center py-2">
						<div className="flex items-center space-x-2 text-gray-500">
							<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<span className="text-sm">Loading older messages...</span>
						</div>
					</div>
				)}
				
				{isLoadingMessages ? (
					<div className="flex items-center justify-center py-8">
						<LoadingIndicator size="sm" />
					</div>
				) : messages.length === 0 ? (
					<div className="text-center text-gray-400 py-8 text-sm">No messages in this conversation.</div>
				) : (
					<>
						{displayMessages.map((msg, idx) => (
							<ChatMessage
								key={msg.message_id || idx}
								isSender={msg.sender_id === userId}
								avatarUrl={msg.sender_id === userId ? undefined : selectedUser?.avatar_url}
								username={msg.sender_id === userId ? "You" : selectedUser?.username || "Unknown"}
								timestamp={typeof msg.created_at === 'string' ? msg.created_at.slice(11, 16) : ''}
								content={msg.content}
								isPending={msg.isPending}
								attachments={msg.Attachment || []}
							/>
						))}
						{/* Invisible anchor element for scrolling */}
						<div ref={bottomAnchorRef} className="h-0" />
					</>
				)}
			</div>
			<div className="border-t border-border bg-white">
				<ChatInput 
					onSend={handleSendMessage}
					isSending={isSending}
				/>
			</div>
		</div>
	);

	/**
	 * Main chat box
	 * @returns 
	 */
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

	/**
	 * Delete confirmation modal
	 */
	const DeleteModal = showDeleteModal ? (
		<div 
			className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
			onClick={(e) => {
				// Close modal when clicking on backdrop
				if (e.target === e.currentTarget) {
					handleCancelDelete();
				}
			}}
		>
			<div 
				className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center mb-4">
					<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
						<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900">Delete Chat</h3>
						<p className="text-sm text-gray-600">This action cannot be undone.</p>
					</div>
				</div>
				<p className="text-gray-700 mb-6">
					Are you sure you want to delete this conversation? The chat will be hidden from your inbox.
				</p>
				<div className="flex gap-3">
					<button
						className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
						onClick={(e) => { e.stopPropagation(); handleCancelDelete(); }}
						disabled={isDeleting}
					>
						Cancel
					</button>
					<button
						className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
						onClick={(e) => { e.stopPropagation(); handleConfirmDelete(); }}
						disabled={isDeleting}
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</button>
				</div>
			</div>
		</div>
	) : null;

	// Handle opening chat with a specific user
	useEffect(() => {
		if (open && selectedChat) {
			// Set view to chat when a specific chat is selected
			setView("chat");
		}
	}, [open, selectedChat]);

	// Load initial messages when selectedChat changes
	useEffect(() => {
		if (!selectedChat) {
			setMessages([]);
			setHasMore(false);
			setIsLoadingMore(false);
			setIsLoadingMessages(false);
			return;
		}
		
		setMessages([]);
		setHasMore(true);
		setIsLoadingMore(true);
		setIsLoadingMessages(true);
		
		fetchGetConversation(selectedChat, '', 10)
			.then(res => {
				if (res.success && Array.isArray(res.messages)) {
					setMessages(res.messages);
					setHasMore(res.hasMore);
				} else {
					setMessages([]);
					setHasMore(false);
				}
			})
			.catch((error) => {
				console.error('Failed to load initial messages:', error);
				setMessages([]);
				setHasMore(false);
			})
			.finally(() => {
				setIsLoadingMore(false);
				setIsLoadingMessages(false);
			});
	}, [selectedChat]);

	// Load more messages (infinite scroll)
	const loadMoreMessages = async () => {
		if (isLoadingMore || !hasMore || messages.length === 0) return;
		setIsLoadingMore(true);
		
		try {
			const container = messagesContainerRef.current;
			const prevHeight = container ? container.scrollHeight : 0;
			const oldest = messages[0];
			
			const res = await fetchGetConversation(selectedChat!, oldest.created_at || '', 10);
			
			if (res.success && Array.isArray(res.messages)) {
				// Prepend new messages to the beginning
				setMessages(prev => [...res.messages, ...prev]);
				setHasMore(res.hasMore);
				
				// Maintain scroll position after prepending
				setTimeout(() => {
					if (container) {
						const newHeight = container.scrollHeight;
						const heightDifference = newHeight - prevHeight;
						container.scrollTop = heightDifference;
					}
				}, 0);
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error('Failed to load more messages:', error);
			setHasMore(false);
		} finally {
			setIsLoadingMore(false);
		}
	};

	// Scroll handler for infinite scroll
	useEffect(() => {
		const container = messagesContainerRef.current;
		if (!container || !selectedChat) return;
		
		const handleScroll = () => {
			// Check if user is near the top (within 50px) and there are more messages to load
			if (container.scrollTop <= 50 && hasMore && !isLoadingMore) {
				loadMoreMessages();
			}
		};
		
		container.addEventListener('scroll', handleScroll);
		return () => container.removeEventListener('scroll', handleScroll);
	}, [hasMore, isLoadingMore, messages, selectedChat]);

	// 1. When entering a chat, scroll instantly to the bottom (no smooth)
	useLayoutEffect(() => {
		if (open && view === "chat" && messages.length > 0) {
			scrollToBottom(); // instant scroll
		}
		// Only run this effect when selectedChat changes (i.e., entering a new chat)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedChat, open, view, messages.length]);

	// 2. When messages update (new message sent/received), use smooth scroll
	useEffect(() => {
		if (open && view === "chat" && messages.length > 0) {
			const container = messagesContainerRef.current;
			if (container) {
				const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
				if (isAtBottom) {
					scrollToBottomSmooth();
				}
			}
		}
		// Only run this effect when messages actually change, not on initial entry
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [messages.length]);

	return (
		<>
			{!open && Toggler}
			{open && Overlay}
			{open && ChatBox}
			{open && DeleteModal}
		</>
	);
};

export default Chatbox;