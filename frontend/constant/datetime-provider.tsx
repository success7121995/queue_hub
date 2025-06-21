"use client";

import React, { createContext, useContext } from "react";

interface DateTimeContextType {
	formatDate: (date: Date | string | null | undefined) => string;
	parseTime: (time: string | Date | null) => string | undefined;
	formatToHHmm: (dateString: string | null | undefined) => string;
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
    const formatDate = (date: Date | string | null | undefined): string => {
        if (!date) return 'N/A';
        
        return new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

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

    const formatToHHmm = (dateString: string | null | undefined): string => {
        if (!dateString) return '00:00';
        const date = new Date(dateString);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return (
        <DateTimeContext.Provider value={{ formatDate, parseTime, formatToHHmm }}>
            {children}
        </DateTimeContext.Provider>
    );
}

export default DateTimeProvider;