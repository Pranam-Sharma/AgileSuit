
import { SprintDetailClient } from '@/components/sprint-details/sprint-detail-client';
import type { Metadata } from 'next';

type SprintDetailPageProps = {
    params: {
        sprintId: string;
    };
};

export const metadata: Metadata = {
    title: 'Sprint Details',
    description: 'Details for the selected sprint.',
};


export default function SprintDetailPage({ params }: SprintDetailPageProps) {
    return <SprintDetailClient sprintId={params.sprintId} />;
}
