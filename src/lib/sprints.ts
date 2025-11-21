
'use client';

import { collection, addDoc, getDocs, query, where, orderBy, Firestore, deleteDoc, doc, getDoc } from "firebase/firestore";
import type { Sprint } from '@/components/dashboard/create-sprint-dialog';

export async function createSprint(db: Firestore, sprintData: Sprint & { userId: string }) {
    try {
        const docRef = await addDoc(collection(db, "sprints"), sprintData);
        return { id: docRef.id, ...sprintData };
    } catch (e: any) {
        console.error("Error adding document: ", e);
        throw new Error(e.message || 'Failed to create sprint.');
    }
}

export async function getSprints(db: Firestore, userId: string): Promise<(Sprint & { id: string })[]> {
    try {
        const q = query(
            collection(db, "sprints"),
            where("userId", "==", userId),
            orderBy("sprintNumber", "desc")
        );

        const querySnapshot = await getDocs(q);
        const sprints: (Sprint & { id: string })[] = [];
        querySnapshot.forEach((doc) => {
            sprints.push({ id: doc.id, ...doc.data() } as Sprint & { id:string });
        });
        return sprints;
    } catch (error) {
        console.error("Error getting documents: ", error);
        throw new Error('Failed to fetch sprints.');
    }
}

export async function deleteSprint(db: Firestore, sprintId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "sprints", sprintId));
    } catch (error: any) {
        console.error("Error deleting document: ", error);
        throw new Error('Failed to delete sprint.');
    }
}

// This function needs to be called from a server component or API route
// For simplicity in this context, we are not creating a separate server file for db access,
// but in a larger app you would initialize firebase-admin separately.
export async function getSprintById(sprintId: string): Promise<(Sprint & { id: string }) | null> {
    // This is a temporary solution for server-side rendering in Next.js app router.
    // In a real application, you'd have a separate firebase-admin initialization.
    const { initializeFirebase } = await import('@/firebase');
    const { firestore } = initializeFirebase();

    try {
        const docRef = doc(firestore, "sprints", sprintId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Sprint & { id: string };
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        // This function will be run on the server, so we can't use browser-based toasts.
        // We re-throw the error to be handled by the page component.
        throw new Error("Failed to fetch sprint details.");
    }
}
