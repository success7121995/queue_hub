import { notFound } from "next/navigation";
import { MerchantDashboard, DashboardNavbar, DashboardSidenav } from "@/components";

type Props = {
    params: {
        merchantId: string;
        slug: string;
    };
}

const DashboardPage = ({ params }: Props) => {
    try {
        const { merchantId, slug } = params;

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
            <div className="bg-surface">
                <DashboardNavbar />

                <div className="flex">
                    <div className="hidden 2xl:block 2xl:fixed 2xl:inset-y-0 2xl:left-0 2xl:w-72 2xl:z-30">
                        <DashboardSidenav merchantId={merchantId} />
                    </div>
                    <div className="block 2xl:hidden">
                        <DashboardSidenav merchantId={merchantId} />
                    </div>
                    <div className="flex-1 w-full 2xl:max-w-[1440px] 2xl:ml-72 2xl:h-full 2xl:overflow-y-auto">
                        <MerchantDashboard merchantId={merchantId} slug={slug} />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error(error);
        return notFound();
    }
}


export default DashboardPage;
