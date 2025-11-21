import { SprintDetailClient } from '@/components/sprint-details/sprint-detail-client';
import type { Metadata } from 'next';

type SprintDetailPageProps = {
    params: {
        sprintId: string;
    };
};

// Metadata can still be generic or loaded separately if needed,
// but for now, we'll keep it simple to ensure the page loads.
export const metadata: Metadata = {
    title: 'Sprint Details',
    description: 'Details for the selected sprint.',
};


export default function SprintDetailPage({ params }: SprintDetailPageProps) {
    // This page now acts as a shell that renders the client component,
    // which will be responsible for its own data fetching.
    return <SprintDetailClient sprintId={params.sprintId} />;
}
