'use client';

import { useParams } from 'next/navigation';
import MerchantDashboard from '@/components/dashboard/merchants/merchant-dashboard';

export default function MerchantPage() {
    const { slug } = useParams();
    return <MerchantDashboard slug={slug as string} />;
}
