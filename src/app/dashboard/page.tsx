import { DashboardClient } from '@/components/dashboard/dashboard-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Your AgileSuit dashboard.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
