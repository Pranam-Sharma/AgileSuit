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

let firebaseApp: FirebaseApp;
if (!getApps().length) {
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
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

const firebaseInstances: FirebaseInstances = { app: firebaseApp, auth, firestore };

export function FirebaseProvider({ children }: { children: ReactNode }) {
  // The value is now constant, so no need for state.
  return (
    <FirebaseContext.Provider value={firebaseInstances}>
      {children}
    </FirebaseContext.Provider>
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