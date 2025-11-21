'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getApps, initializeApp, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

type FirebaseContextValue = FirebaseInstances | null;

const FirebaseContext = createContext<FirebaseContextValue>(null);

let firebaseInstances: FirebaseInstances | null = null;

function initializeFirebase(): FirebaseInstances {
  if (typeof window === 'undefined') {
    // This should not happen in a client component, but as a safeguard:
    throw new Error("Firebase should only be initialized on the client side.");
  }
  
  if (firebaseInstances) {
    return firebaseInstances;
  }
  
  const isFullyConfigured =
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId;

  if (!isFullyConfigured) {
    throw new Error('Firebase configuration is incomplete.');
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  firebaseInstances = { app, auth, firestore };
  return firebaseInstances;
}


export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<FirebaseContextValue>(null);

  useEffect(() => {
    // Initialize Firebase on the client side and only once.
    const instances = initializeFirebase();
    setValue(instances);
  }, []);

  // Return a loading state or null until Firebase is initialized.
  if (!value) {
    // Or a loading spinner, etc.
    return null; 
  }

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export const useFirebase = (): FirebaseInstances | null => {
  return useContext(FirebaseContext);
};

export const useAuth = (): Auth | null => {
  return useFirebase()?.auth ?? null;
};

export const useFirestore = (): Firestore | null => {
    return useFirebase()?.firestore ?? null;
};
