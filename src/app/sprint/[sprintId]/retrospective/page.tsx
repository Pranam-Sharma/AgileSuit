
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sprint Retrospective',
  description: 'Review your sprint.',
};

import { SprintRetrospectiveClient } from '@/components/sprint-retrospective/sprint-retrospective-client';

export default async function SprintRetrospectivePage({ params }: { params: Promise<{ sprintId: string }> }) {
  const { sprintId } = await params;
  return <SprintRetrospectiveClient sprintId={sprintId} />;
}
