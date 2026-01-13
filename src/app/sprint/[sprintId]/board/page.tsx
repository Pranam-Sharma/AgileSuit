import { SprintBoardClient } from '@/components/sprint-board/sprint-board-client';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';

export default async function SprintBoardPage({ params }: { params: Promise<{ sprintId: string }> }) {
    const { sprintId } = await params;
    const supabase = createAdminClient();

    let mappedSprint = undefined;

    try {
        const { data: sprint, error } = await supabase
            .from('sprints')
            .select('*')
            .eq('id', sprintId)
            .single();

        if (!error && sprint) {
            // Map snake_case DB fields to camelCase
            mappedSprint = {
                id: sprint.id,
                sprintNumber: sprint.sprint_number,
                sprintName: sprint.name,
                projectName: sprint.project_name,
                department: sprint.department,
                team: sprint.team,
                facilitatorName: sprint.facilitator_name,
                plannedPoints: sprint.planned_points,
                completedPoints: sprint.completed_points,
                isFacilitator: false,
                userId: sprint.created_by
            };
        }
    } catch (error) {
        console.warn("Failed to fetch sprint server-side:", error);
    }

    if (!mappedSprint) {
        // If we really can't find it, we could 404, or let the client try (but likely it will fail too if server admin failed)
        // For now, let's just pass null and let the client handle "not found" state or try fetching if we want fallback.
        // But better to 404 if it's an ID that doesn't exist.
        // However, user might have just created it? No, if it's in DB.
        // Let's pass null and let client show error.
    }

    return <SprintBoardClient sprint={mappedSprint} sprintId={sprintId} />;
}
