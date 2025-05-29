import { notFound } from "next/navigation";
import { MerchantDashboard, DashboardNavbar, DashboardSidenav } from "@/components";

interface Props {
    params: { merchantId: string; slug: string };
}

const DashboardPage = async ({ params }: Props) => {
    try {
        const { merchantId, slug } = await params;

        const allowSlug = [
            "view-live-queues",
            "manage-queue-entries",
            "add-branch",
            "branch-info",
            "view-queue-history",
            "feedback",
            "replies",
            "register-new-user",
            "manage-users",
            "analytics",
            "system-health",
        ];

        if (!allowSlug.includes(slug)) {
            return notFound();
        }

        return (
            <main className="overflow-hidden">
                <DashboardNavbar />
                <div className="flex">
                    <DashboardSidenav merchantId={merchantId} />
                    <MerchantDashboard merchantId={merchantId} slug={slug} />
                </div>
            </main>
        )
    } catch (error) {
        console.error(error);
        return notFound();
    }
}

export default DashboardPage;
