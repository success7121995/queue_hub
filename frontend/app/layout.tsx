import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import DateTimeProvider from "@/constant/datetime-provider";
import QueryProvider from "@/constant/query-provider";
import LangProvider from "@/constant/lang-provider";

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
                    overflow-y-hidden
                `}
            >
                <QueryProvider>
                    <LangProvider>
                        <DateTimeProvider>
                            {children}
                        </DateTimeProvider>
                    </LangProvider>
                </QueryProvider>
            </body>
        </html>
    );
}

export default RootLayout;