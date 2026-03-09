
import { SprintPlanningClient } from '@/components/sprint-planning/sprint-planning-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sprint Planning',
  description: 'Plan your sprint.',
};

export default async function SprintPlanningPage({ params }: { params: Promise<{ sprintId: string }> }) {
  const { sprintId } = await params;
  return (
    <SprintPlanningClient sprintId={sprintId} />
  );
}
