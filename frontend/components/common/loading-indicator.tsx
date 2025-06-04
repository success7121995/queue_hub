"use client";

import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    text?: string;
    fullScreen?: boolean;
}

const LoadingIndicator = ({ 
    size = "md", 
    className,
    text,
    fullScreen = false 
}: LoadingIndicatorProps) => {
    const sizeClasses = {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-3"
    };

    const containerClasses = cn(
        "flex flex-col items-center justify-center",
        fullScreen && "fixed inset-0 bg-white/80 backdrop-blur-sm z-50",
        className
    );

    return (
        <div className={containerClasses}>
            <div 
                className={cn(
                    "animate-spin rounded-full border-primary border-t-transparent",
                    sizeClasses[size]
                )}
            />
            {text && (
                <p className="mt-2 text-sm text-gray-600">{text}</p>
            )}
        </div>
    );
};

export default LoadingIndicator; 