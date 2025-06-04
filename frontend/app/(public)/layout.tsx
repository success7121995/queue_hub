import { Metadata } from "next";
import { PublicNavbar, Footer } from "@/components";
import styles from './layout.module.css';

export const metadata: Metadata = {
    title: "Public",
    description: "Public page",
}

const PublicLayout = ({children}: {children: React.ReactNode}) => {
    return (
        <div className={styles.container}>
            <PublicNavbar />
            <main className={styles.main}>
                {children}
            </main>
            <Footer />
        </div>
    )
}

export default PublicLayout;