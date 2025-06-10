import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
	children: ReactNode;
	className?: string;
}

interface CardHeaderProps {
	children: ReactNode;
	className?: string;
}

interface CardTitleProps {
	children: ReactNode;
	className?: string;
}

interface CardContentProps {
	children: ReactNode;
	className?: string;
}

export function Card({ children, className }: CardProps) {
	return (
		<div
			className={cn(
				"rounded-lg border bg-card text-card-foreground shadow-sm",
				className
			)}
		>
			{children}
		</div>
	);
}

export function CardHeader({ children, className }: CardHeaderProps) {
	return (
		<div
			className={cn(
				"flex flex-col space-y-1.5 p-6",
				className
			)}
		>
			{children}
		</div>
	);
}

export function CardTitle({ children, className }: CardTitleProps) {
	return (
		<h3
			className={cn(
				"text-2xl font-semibold leading-none tracking-tight",
				className
			)}
		>
			{children}
		</h3>
	);
}

export function CardContent({ children, className }: CardContentProps) {
	return (
		<div
			className={cn(
				"p-6 pt-0",
				className
			)}
		>
			{children}
		</div>
	);
} 