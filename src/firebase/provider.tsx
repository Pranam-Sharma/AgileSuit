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
    if (typeof window !== "undefined") {
      const instances = initializeFirebase();
      setValue(instances);
    }
  }, []);

  // Return a loading state or null until Firebase is initialized.
  if (!value) {
    return null;
  }

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export const useFirebase = (): FirebaseInstances => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useAuth = (): Auth => {
  return useFirebase().auth;
};

export const useFirestore = (): Firestore => {
    return useFirebase().firestore;
};
