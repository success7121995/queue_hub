"use client";

import React, { createContext, useContext } from "react";

interface DateTimeContextType {
	formatDate: (date: Date | string | null | undefined) => string;
	parseTime: (time: string | Date | null) => string | undefined;
	formatToHHmm: (dateString: string | null | undefined) => string;
	formatRelativeTime: (date: Date) => string;
}

export const dayOfWeekMap = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'PUBLIC_HOLIDAY'] as const;

const DateTimeContext = createContext<DateTimeContextType | undefined>(undefined);
export const useDateTime = () => {
	const context = useContext(DateTimeContext);
	if (!context) {
		throw new Error('useDateTime must be used within a DateTimeProvider');
	}
	return context;
}

const DateTimeProvider = ({ children }: { children: React.ReactNode }) => {

    /**
     * Format date
     * @param date - The date to format
     * @returns The formatted date
     */
    const formatDate = (date: Date | string | null | undefined, time?: boolean): string => {
        if (!date) return 'N/A';
        
        return new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...(time && {
                hour: '2-digit',
                minute: '2-digit'
            })
        }).format(new Date(date));
    };

    /**
     * Parse the time
     * @param time - The time to parse
     * @returns The parsed time
     */
    const parseTime = (time: string | Date | null): string | undefined => {
        if (!time) return undefined;
    
        let date: Date;
    
        if (typeof time === 'string') {
            const parts = time.split(':');
            if (parts.length >= 2) {
                const hour = parseInt(parts[0], 10);
                const minute = parseInt(parts[1], 10);
                if (!isNaN(hour) && !isNaN(minute)) {
                    date = new Date('1970-01-01T00:00:00.000Z');
                    date.setUTCHours(hour, minute, 0, 0);
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        } else if (time instanceof Date) {
            date = time;
        } else {
            return undefined;
        }
        
        if (isNaN(date.getTime())) return undefined;
        
        const baseDate = new Date('1970-01-01T00:00:00.000Z');
        baseDate.setUTCHours(date.getUTCHours(), date.getUTCMinutes(), date.getSeconds());
    
        return baseDate.toISOString();
    };

    /**
     * Format the time to HH:mm
     * @param dateString - The date string to format
     * @returns The formatted time
     */
    const formatToHHmm = (dateString: string | null | undefined): string => {
        if (!dateString) return '00:00';
        const date = new Date(dateString);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    /**
     * Format the time to "Just now", "1h ago", "2d ago" etc. It is used for notifications and messages.
     * @param date - The date to format
     * @returns The formatted time
     */
    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    }

    return (
        <DateTimeContext.Provider value={{ formatDate, parseTime, formatToHHmm, formatRelativeTime }}>
            {children}
        </DateTimeContext.Provider>
    );
}

export default DateTimeProvider;