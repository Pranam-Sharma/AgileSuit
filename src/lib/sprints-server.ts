
'use server';

import type { Firestore } from 'firebase-admin/firestore';

import type { Sprint } from '@/components/dashboard/create-sprint-dialog';

export async function getSprint(db: Firestore, sprintId: string): Promise<(Sprint & { id: string }) | null> {
    try {
        const sprintDoc = await db.collection('sprints').doc(sprintId).get();

        if (sprintDoc.exists) {
            return { id: sprintDoc.id, ...sprintDoc.data() } as Sprint & { id: string };
        }
        return null;
    } catch (error) {
        console.error("Error getting document: ", error);
        throw new Error('Failed to fetch sprint.');
    }
}
