
import 'server-only';
import * as admin from 'firebase-admin';
import type { Sprint } from '@/components/dashboard/create-sprint-dialog';

if (admin.apps.length === 0) {
    admin.initializeApp();
}

export async function getSprintById(sprintId: string): Promise<(Sprint & { id: string }) | null> {
    const firestore = admin.firestore();
    try {
        const docRef = firestore.collection('sprints').doc(sprintId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return { id: docSnap.id, ...docSnap.data() } as Sprint & { id: string };
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        throw new Error("Failed to fetch sprint details.");
    }
}
