import { ReactNode } from "react";

interface BadgeProps {
	children: ReactNode;
	className?: string;
}

export const Badge = ({ children, className = "" }: BadgeProps) => {
	return (
		<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
			{children}
		</span>
	);
}; 