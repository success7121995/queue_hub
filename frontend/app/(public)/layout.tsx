import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Public",
    description: "Public page",
}

import { Navbar, Footer } from "@/components";

const PublicLayout = ({children}: {children: React.ReactNode}) => {
    return (
        <>
            <Navbar />
            <div className="mt-15">
                {children}
            </div>
            <Footer />
        </>
    )
}

export default PublicLayout;