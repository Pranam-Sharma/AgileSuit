'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getApps, initializeApp, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getRemoteConfig, fetchAndActivate, getValue, type RemoteConfig } from 'firebase/remote-config';
import { firebaseConfig } from './config';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  remoteConfig: RemoteConfig | null;
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

// Remote Config is only available in browser environments
let remoteConfig: RemoteConfig | null = null;
if (typeof window !== 'undefined') {
  try {
    remoteConfig = getRemoteConfig(firebaseApp);
    remoteConfig.settings.minimumFetchIntervalMillis = 60000; // 1 minute for dev, increase in prod
    remoteConfig.defaultConfig = {
      show_coming_soon: true,
    };
  } catch (e) {
    console.warn('Remote Config initialization failed:', e);
  }
}

const firebaseInstances: FirebaseInstances = { app: firebaseApp, auth, firestore, remoteConfig };

export function FirebaseProvider({ children }: { children: ReactNode }) {
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

/**
 * Hook to read a boolean feature flag from Firebase Remote Config.
 * Returns { value, loading } — value defaults to the defaultConfig value while loading.
 */
export function useFeatureFlag(key: string, defaultValue: boolean = false): { value: boolean; loading: boolean } {
  const { remoteConfig } = useFirebase();
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!remoteConfig) {
      setLoading(false);
      return;
    }

    fetchAndActivate(remoteConfig)
      .then(() => {
        const val = getValue(remoteConfig, key);
        setValue(val.asBoolean());
      })
      .catch((err) => {
        console.warn(`Remote Config fetch failed for "${key}":`, err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [remoteConfig, key]);

  return { value, loading };
}