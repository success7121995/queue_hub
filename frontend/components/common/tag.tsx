"use client";

import { X } from "lucide-react";

interface TagProps {
	tagName: string;
	removeButton?: boolean;
	onClick?: () => void;
}

const Tag = ({ tagName, removeButton = false, onClick = () => {} }: TagProps) => {
	return (
		<div className="relative text-xs px-4 py-1 border border-primary-light hover:bg-primary-light/20 rounded-[10px] text-primary-light cursor-pointer">
			{tagName}


			{removeButton && (
				<button className="absolute right-0 top-0 -translate-y-1/2 p-0.5 bg-red-500 rounded-full cursor-pointer" onClick={onClick}>
					<X size={10} className="text-white" />
				</button>
			)}
		</div>
	);
};

export default Tag;