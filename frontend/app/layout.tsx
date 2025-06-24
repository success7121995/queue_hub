import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import DateTimeProvider from "@/constant/datetime-provider";
import QueryProvider from "@/constant/query-provider";
import LangProvider from "@/constant/lang-provider";
import DialingCodeProvider from "@/constant/dialing-code-provider";
import React from "react";

const urbanistItalic = localFont({
    src: "../public/fonts/Urbanist-Italic-VariableFont_wght.ttf",
    variable: "--font-urbanist-italic",
});

const unbanist = localFont({
    src: "../public/fonts/Urbanist-VariableFont_wght.ttf",
    variable: "--font-urbanist",
});

export const metadata: Metadata = {
    title: "QueueHub - Smart Queue Management System",
    description: "A modern queue management system for businesses",
    other: {
        // Control CSS preloading
        'next-head-count': '0'
    }
};

const RootLayout = async ({
    children
}: Readonly<{
    children: React.ReactNode;
}>) => {

    return (
        <html lang="en">
            <body
                className={`
                    ${urbanistItalic.variable}
                    ${unbanist.variable}
                    antialiased
                `}
            >
                <QueryProvider>
                    <LangProvider>
                        <DateTimeProvider>
                            <DialingCodeProvider>
                                {children}
                            </DialingCodeProvider>
                        </DateTimeProvider>
                    </LangProvider>
                </QueryProvider>
            </body>
        </html>
    );
}

export default RootLayout;

