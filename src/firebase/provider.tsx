'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeFirebase } from './init';

type FirebaseContextValue = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} | null;

const FirebaseContext = createContext<FirebaseContextValue>(null);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<FirebaseContextValue>(null);

  useEffect(() => {
    // Initialize Firebase on the client side and only once.
    if (typeof window !== "undefined") {
      const instances = initializeFirebase();
      setValue(instances);
    }
  }, []);

  if (!value) {
    // You can return a loading spinner here if you want
    return null;
  }

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useAuth = () => {
  return useFirebase().auth;
};

export const useFirestore = () => {
    return useFirebase().firestore;
};
