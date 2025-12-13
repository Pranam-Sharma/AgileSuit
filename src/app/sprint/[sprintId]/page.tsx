import { SprintDetailClient } from '@/components/sprint-details/sprint-detail-client';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sprint Details',
    description: 'Details for the selected sprint.',
};

export default async function SprintDetailPage({ params }: { params: Promise<{ sprintId: string }> }) {
    const { sprintId } = await params;
    const supabase = createAdminClient();

    try {
        const { data: sprint, error } = await supabase
            .from('sprints')
            .select('*')
            .eq('id', sprintId)
            .single();

        if (error || !sprint) {
            console.error("Error fetching sprint:", error);
            notFound();
        }

        // Map snake_case DB fields to camelCase for the client component
        const mappedSprint = {
            id: sprint.id,
            sprintNumber: sprint.sprint_number,
            sprintName: sprint.name,
            projectName: sprint.project_name,
            department: sprint.department,
            team: sprint.team,
            facilitatorName: sprint.facilitator_name,
            plannedPoints: sprint.planned_points,
            completedPoints: sprint.completed_points,
            isFacilitator: false, // Default, client can verify with user comparison
            userId: sprint.created_by
        };

        return <SprintDetailClient sprint={mappedSprint} sprintId={sprintId} />;

    } catch (error) {
        console.warn("Failed to fetch sprint server-side:", error);
        return <SprintDetailClient sprintId={sprintId} />;
    }
}
