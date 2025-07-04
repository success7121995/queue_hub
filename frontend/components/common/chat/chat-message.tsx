import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Download, FileText } from "lucide-react";

interface ChatMessageProps {
	isSender: boolean;
	avatarUrl?: string;
	username: string;
	timestamp: string;
	content: string;
	isPending?: boolean;
	attachments?: Array<{
		attachment_id: string;
		file_url: string;
		created_at: string;
	}>;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
	isSender,
	username,
	timestamp,
	content,
	isPending = false,
	attachments = [],
}) => {
	const handleDownload = (fileUrl: string) => {
		const link = document.createElement('a');
		link.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}${fileUrl}`;
		link.download = fileUrl.split('/').pop() || 'attachment';
		link.target = '_blank';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Helper function to determine if file is an image based on extension
	const isImageFile = (fileUrl: string) => {
		const extension = fileUrl.split('.').pop()?.toLowerCase();
		return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '');
	};

	// Utility to clean file name
	function cleanFileName(fileName: string) {
		// Remove first two sets of numbers and dashes (e.g., 1751616157107-649198748-)
		return fileName.replace(/^\d+-\d+-/, '');
	}

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
		{/* Message bubble: only show if there is text content */}
		{content && content.trim() && (
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
		)}

		{/* Attachments */}
		{attachments.length > 0 && (
			<div className="mt-2 space-y-2">
				{attachments.map((attachment) => {
					const fileName = attachment.file_url.split('/').pop() || '';
					const cleanedName = cleanFileName(fileName);
					const isPdf = fileName.toLowerCase().endsWith('.pdf');
					const fileUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${attachment.file_url}`;
					return (
						<div
							key={attachment.attachment_id}
							className={cn(
								"max-w-xs rounded-lg overflow-hidden border",
								isSender ? "border-primary-light/20" : "border-gray-200"
							)}
						>
							{isImageFile(attachment.file_url) ? (
								// Image attachment
								<div className="relative">
									<Image
										src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${attachment.file_url}`}
										alt="Image attachment"
										width={200}
										height={200}
										className="w-full h-auto object-cover cursor-pointer"
										onClick={() => window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL}${attachment.file_url}`, '_blank')}
									/>
									<button
										onClick={() => handleDownload(attachment.file_url)}
										className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
										title="Download"
									>
										<Download className="w-3 h-3" />
									</button>
								</div>
							) : (
								// PDF or other file attachment
								<div className="p-3 bg-gray-50 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<FileText className="w-5 h-5 text-red-500" />
										{isPdf ? (
											<a href={fileUrl} download={cleanedName} className="text-primary underline" target="_blank" rel="noopener noreferrer">
												<span className="inline-flex items-center">
													<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
													{cleanedName}
												</span>
											</a>
										) : (
											<span className="text-sm text-gray-700 truncate">
												{cleanedName}
											</span>
										)}
									</div>
									<button
										onClick={() => handleDownload(attachment.file_url)}
										className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
										title="Download"
									>
										<Download className="w-4 h-4" />
									</button>
								</div>
							)}
						</div>
					);
				})}
			</div>
		)}
		</div>
	</div>
	);
};

export default ChatMessage; 