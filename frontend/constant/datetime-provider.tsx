"use client";

import { createContext, useContext } from "react";

interface DateTimeContextType {
	formatDate: (date: Date) => string;
}

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
    const formatDate = (date: Date | null | undefined): string => {
        if (!date) return 'N/A';
        
        return new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };


	return (
		<DateTimeContext.Provider value={{
            formatDate
        }}>
			{children}
		</DateTimeContext.Provider>
	)
}

export default DateTimeProvider;