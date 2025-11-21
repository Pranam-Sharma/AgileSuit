'use server';

import { getAdminApp } from '@/firebase/server';
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import type { Sprint } from '@/components/dashboard/create-sprint-dialog';
import { Firestore } from 'firebase-admin/firestore';

// Initialize firebase on the server
const db = getAdminApp().firestore() as Firestore;

export async function createSprint(sprintData: Sprint & { userId: string }) {
    try {
        const docRef = await addDoc(collection(db, "sprints"), sprintData);
        return { id: docRef.id, ...sprintData };
    } catch (e: any) {
        console.error("Error adding document: ", e);
        // Re-throw the original error to be caught by the client
        throw new Error(e.message || 'Failed to create sprint. Please check Firestore rules and configuration.');
    }
}

export async function getSprints(userId: string): Promise<(Sprint & { id: string })[]> {
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
        return [];
    }
}
