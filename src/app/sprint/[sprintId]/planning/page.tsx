
import { SprintPlanningClient } from '@/components/sprint-planning/sprint-planning-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sprint Planning',
    description: 'Plan your sprint.',
};

export default function SprintPlanningPage({ params }: { params: { sprintId: string }}) {
  return (
    <SprintPlanningClient sprintId={params.sprintId} />
  );
}
