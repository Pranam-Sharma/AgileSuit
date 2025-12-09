

import { collection, addDoc, getDocs, query, where, orderBy, Firestore as ClientFirestore, deleteDoc, doc as clientDoc } from "firebase/firestore";
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import { doc as adminDoc, getDoc as adminGetDoc } from 'firebase-admin/firestore';

import type { Sprint } from '@/components/dashboard/create-sprint-dialog';

export async function createSprint(db: ClientFirestore, sprintData: Sprint & { userId: string }) {
    try {
        const docRef = await addDoc(collection(db, "sprints"), sprintData);
        return { id: docRef.id, ...sprintData };
    } catch (e: any) {
        console.error("Error adding document: ", e);
        throw new Error(e.message || 'Failed to create sprint.');
    }
}

export async function getSprints(db: ClientFirestore, userId: string): Promise<(Sprint & { id: string })[]> {
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

export async function deleteSprint(db: ClientFirestore, sprintId: string): Promise<void> {
    try {
        await deleteDoc(clientDoc(db, "sprints", sprintId));
    } catch (error: any) {
        console.error("Error deleting document: ", error);
        throw new Error('Failed to delete sprint.');
    }
}

export async function getSprint(db: AdminFirestore, sprintId: string): Promise<(Sprint & { id: string }) | null> {
    try {
        const sprintDocRef = adminDoc(db, 'sprints', sprintId);
        const sprintDoc = await adminGetDoc(sprintDocRef);

        if (sprintDoc.exists()) {
            return { id: sprintDoc.id, ...sprintDoc.data() } as Sprint & { id: string };
        }
        return null;
    } catch (error) {
        console.error("Error getting document: ", error);
        throw new Error('Failed to fetch sprint.');
    }
}
