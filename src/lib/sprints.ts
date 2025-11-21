
'use server';
import { firestore } from '@/firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import type { Sprint } from '@/components/dashboard/create-sprint-dialog';

export async function createSprint(sprintData: Sprint & { userId: string }) {
    try {
        const docRef = await addDoc(collection(firestore, "sprints"), sprintData);
        return { id: docRef.id, ...sprintData };
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error('Failed to create sprint');
    }
}

export async function getSprints(userId: string): Promise<Sprint[]> {
    try {
        const q = query(
            collection(firestore, "sprints"), 
            where("userId", "==", userId),
            orderBy("sprintNumber", "desc")
        );

        const querySnapshot = await getDocs(q);
        const sprints: Sprint[] = [];
        querySnapshot.forEach((doc) => {
            sprints.push(doc.data() as Sprint);
        });
        return sprints;
    } catch (error) {
        console.error("Error getting documents: ", error);
        return [];
    }
}
