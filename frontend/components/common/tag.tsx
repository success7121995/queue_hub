"use client";

import { X } from "lucide-react";

interface TagProps {
	tagName: string;
	removeButton?: boolean;
	onRemove?: () => void;
	onClick?: () => void;
}

const Tag = ({ tagName, removeButton = false, onRemove, onClick = () => {} }: TagProps) => {
	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent triggering onClick when removing
		if (onRemove) {
			onRemove();
		}
	};

	return (
		<div 
			className="relative inline-flex items-center px-4 py-1 bg-primary-light/10 border border-primary-light text-primary-light rounded-full text-xs font-semibold shadow-sm mr-2 mb-2 transition-all duration-200 group cursor-pointer"
			onClick={onClick}
		>
			<span>{tagName}</span>
			{removeButton && (
				<button
					onClick={handleRemove}
					className="absolute -right-2 -top-2 opacity-100 bg-red-500 hover:bg-red-500 rounded-full p-0.5 flex items-center justify-center shadow-md transition-colors"
					style={{ width: 16, height: 16 }}
					aria-label={`Remove ${tagName}`}
				>
					<X size={10} className="text-white" />
				</button>
			)}
		</div>
	);
};

export default Tag;