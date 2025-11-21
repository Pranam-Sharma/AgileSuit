import { collection, addDoc, getDocs, query, where, orderBy, Firestore, deleteDoc, doc, getDoc } from "firebase/firestore";
import type { Sprint } from '@/components/dashboard/create-sprint-dialog';
import { getAdminFirestore } from "@/firebase/server";


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
export async function getSprintById(sprintId: string): Promise<(Sprint & { id: string }) | null> {
    const firestore = getAdminFirestore();
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
