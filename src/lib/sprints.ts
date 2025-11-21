'use server';

import { initializeFirebase } from '@/firebase/index';
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import type { Sprint } from '@/components/dashboard/create-sprint-dialog';

// Initialize firebase on the server
const { firestore } = initializeFirebase();

export async function createSprint(sprintData: Sprint & { userId: string }) {
    try {
        const docRef = await addDoc(collection(firestore, "sprints"), sprintData);
        return { id: docRef.id, ...sprintData };
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error('Failed to create sprint');
    }
}

export async function getSprints(userId: string): Promise<(Sprint & { id: string })[]> {
    try {
        const q = query(
            collection(firestore, "sprints"), 
            where("userId", "==", userId),
            orderBy("sprintNumber", "desc")
        );

        const querySnapshot = await getDocs(q);
        const sprints: (Sprint & { id: string })[] = [];
        querySnapshot.forEach((doc) => {
            sprints.push({ id: doc.id, ...doc.data() } as Sprint & { id: string });
        });
        return sprints;
    } catch (error) {
        console.error("Error getting documents: ", error);
        return [];
    }
}
