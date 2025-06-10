'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import MerchantDashboard from '@/components/dashboard/merchants/merchant-dashboard';
import AdminDashboard from '@/components/dashboard/merchants/system-health';
import { useUser } from '@/hook/useUser';
import LoadingIndicator from '@/components/common/loading-indicator';

export default function DashboardPage() {
    const { slug } = useParams();
    const { user, isLoading: authLoading } = useUser();

    const { data: merchant, isLoading: merchantLoading } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            if (!user?.merchant_id) return null;
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchants/${user.merchant_id}`);
            if (!response.ok) throw new Error('Failed to fetch merchant');
            return response.json();
        },
        enabled: !!user?.merchant_id,
    });

    if (authLoading || merchantLoading) {
        return <LoadingIndicator />;
    }

    if (!user) {
        return <div>Please log in to access the dashboard</div>;
    }

    // Admin dashboard
    if (['SUPER_ADMIN', 'OPS_ADMIN', 'SUPPORT_AGENT', 'DEVELOPER'].includes(user.role)) {
        return <AdminDashboard />;
    }

    // Merchant dashboard
    if (user.role === 'MERCHANT' && merchant) {
        return <MerchantDashboard merchantId={merchant.merchantId} slug={slug as string} />;
    }

    return <div>Access denied</div>;
}
