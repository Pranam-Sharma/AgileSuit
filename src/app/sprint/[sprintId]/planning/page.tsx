
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sprint Planning',
    description: 'Plan your sprint.',
};

export default function SprintPlanningPage({ params }: { params: { sprintId: string }}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold">Sprint Planning</h1>
        <p className="mt-2 text-muted-foreground">Sprint ID: {params.sprintId}</p>
        <p className="mt-4">Planning features coming soon!</p>
    </div>
  );
}
