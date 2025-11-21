
'use server';
import * as admin from 'firebase-admin';
import type { Sprint } from '@/components/dashboard/create-sprint-dialog';

// This function will handle initialization internally to avoid top-level execution errors.
export async function getSprintById(sprintId: string): Promise<(Sprint & { id: string }) | null> {
    if (admin.apps.length === 0) {
        try {
            admin.initializeApp();
        } catch (error: any) {
            console.error("Firebase admin initialization error", error);
            // In a production app, you might want to throw a more user-friendly error
            // or handle this case more gracefully.
            throw new Error("Failed to initialize Firebase Admin SDK. Server-side data fetching is unavailable.");
        }
    }

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
