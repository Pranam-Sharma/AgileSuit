import { SprintDetailClient } from '@/components/sprint-details/sprint-detail-client';
import type { Metadata } from 'next';
import { getSprintById } from '@/lib/sprints.server';
import type { Sprint } from '@/components/dashboard/create-sprint-dialog';

type SprintDetailPageProps = {
    params: {
        sprintId: string;
    };
};

export async function generateMetadata({ params }: SprintDetailPageProps): Promise<Metadata> {
    const sprint = await getSprintById(params.sprintId);

    if (!sprint) {
        return {
            title: 'Sprint Not Found',
        };
    }

    return {
        title: `Sprint: ${sprint.sprintName}`,
        description: `Details for sprint ${sprint.sprintName}`,
    };
}


export default async function SprintDetailPage({ params }: SprintDetailPageProps) {
    const sprint = await getSprintById(params.sprintId);

    if (!sprint) {
        return <div className="flex min-h-screen items-center justify-center">Sprint not found.</div>;
    }

    return <SprintDetailClient sprint={sprint} />;
}
