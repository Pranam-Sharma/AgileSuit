
import { SprintDetailClient } from '@/components/sprint-details/sprint-detail-client';
import { getSprint } from '@/lib/sprints-server';
import type { Metadata } from 'next';
import { firebaseAdminApp } from '@/firebase/firebase-admin-config';
import { notFound } from 'next/navigation';
import { getFirestore } from 'firebase-admin/firestore';

export const metadata: Metadata = {
    title: 'Sprint Details',
    description: 'Details for the selected sprint.',
};

export default async function SprintDetailPage({ params }: { params: Promise<{ sprintId: string }> }) {
    const { sprintId } = await params;
    // This is a placeholder for getting the current user. 
    // In a real app, you'd get this from the session.
    // For now, we assume no specific user check on server, it will be done on client.
    const firestore = getFirestore(firebaseAdminApp);

    try {
        const sprint = await getSprint(firestore, sprintId);

        if (!sprint) {
            notFound();
        }

        return <SprintDetailClient sprint={sprint} sprintId={sprintId} />;

    } catch (error) {
        console.warn("Failed to fetch sprint server-side, falling back to client-side:", error);
        return <SprintDetailClient sprintId={sprintId} />;
    }
}
