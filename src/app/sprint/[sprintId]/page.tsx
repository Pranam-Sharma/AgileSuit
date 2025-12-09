
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

export default async function SprintDetailPage({ params }: { params: { sprintId: string } }) {
    // This is a placeholder for getting the current user. 
    // In a real app, you'd get this from the session.
    // For now, we assume no specific user check on server, it will be done on client.
    const firestore = getFirestore(firebaseAdminApp);

    try {
        const sprint = await getSprint(firestore, params.sprintId);
        
        if (!sprint) {
            notFound();
        }

        return <SprintDetailClient sprint={sprint} />;

    } catch (error) {
        console.error("Failed to fetch sprint:", error);
        // We can render an error state or redirect
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-bold">Error</h1>
                <p className="mt-4">Could not load sprint details.</p>
            </div>
        );
    }
}
