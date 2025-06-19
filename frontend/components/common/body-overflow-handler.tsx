"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const BodyOverflowHandler = () => {
    const pathname = usePathname();

    useEffect(() => {
        // Check if the current path is in the private routes
        const isPrivateRoute = pathname?.includes('/merchant') || pathname?.includes('/admin');
        
        if (isPrivateRoute) {
            // Apply overflow-hidden to body for private routes
            document.body.style.overflow = 'hidden';
        } else {
            // Remove overflow-hidden for public routes
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to reset overflow when component unmounts
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [pathname]);

    // This component doesn't render anything
    return null;
};

export default BodyOverflowHandler; 