
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sprint Retrospective',
    description: 'Review your sprint.',
};

export default function SprintRetrospectivePage({ params }: { params: { sprintId: string }}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold">Sprint Retrospective</h1>
        <p className="mt-2 text-muted-foreground">Sprint ID: {params.sprintId}</p>
        <p className="mt-4">Retrospective features coming soon!</p>
    </div>
  );
}
