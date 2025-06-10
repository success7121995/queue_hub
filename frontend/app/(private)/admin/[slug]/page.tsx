'use client';

import { useParams } from 'next/navigation';
import AdminDashboard from '@/components/dashboard/admin/admin-dashboard';

export default function AdminPage() {
    const { slug } = useParams();
    return <AdminDashboard slug={slug as string} />;
}
