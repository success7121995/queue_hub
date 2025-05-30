"use client";

import { X } from "lucide-react";

interface TagProps {
	tagName: string;
	removeButton?: boolean;
	onClick?: () => void;
}

const Tag = ({ tagName, removeButton = false, onClick = () => {} }: TagProps) => {
	return (
		<div className="relative inline-flex items-center px-4 py-1 bg-primary-light/10 border border-primary-light text-primary-light rounded-full text-xs font-semibold shadow-sm mr-2 mb-2 transition-all duration-200 group cursor-pointer">
			<span>{tagName}</span>
			{removeButton && (
				<button
					onClick={onClick}
					className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 rounded-full p-0.5 flex items-center justify-center shadow-md"
					style={{ width: 18, height: 18 }}
				>
					<X size={10} className="text-white" />
				</button>
			)}
		</div>
	);
};

export default Tag;