'use client';

import * as React from 'react';
import { createClient } from '@/auth/supabase/client';
import {
  getUserBackgroundThemeAction,
  updateUserBackgroundThemeAction,
} from '@/backend/actions/settings.actions';
import {
  DEFAULT_BACKGROUND_THEME,
  getBackgroundThemeCssVariables,
  normalizeBackgroundThemePreference,
  resolveBackgroundTheme,
  type BackgroundThemePreference,
} from '@/lib/background-themes';

type BackgroundThemeContextValue = {
  preference: BackgroundThemePreference;
  savedPreference: BackgroundThemePreference;
  resolvedTheme: ReturnType<typeof resolveBackgroundTheme>;
  isLoading: boolean;
  isSaving: boolean;
  previewPreference: (preference: BackgroundThemePreference) => void;
  savePreference: (
    preference: BackgroundThemePreference
  ) => Promise<{ success: true } | { success: false; error: string }>;
};

const BackgroundThemeContext = React.createContext<BackgroundThemeContextValue | null>(null);

const STORAGE_KEY = 'agilesuit_background_theme';

export function BackgroundThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] =
    React.useState<BackgroundThemePreference>(DEFAULT_BACKGROUND_THEME);
  const [savedPreference, setSavedPreference] =
    React.useState<BackgroundThemePreference>(DEFAULT_BACKGROUND_THEME);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    const locallySavedPreference = readStoredPreference();
    setPreference(locallySavedPreference);
    setSavedPreference(locallySavedPreference);
  }, []);

  React.useEffect(() => {
    const variables = getBackgroundThemeCssVariables(preference);

    Object.entries(variables).forEach(([name, value]) => {
      document.documentElement.style.setProperty(name, value);
    });
  }, [preference]);

  React.useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function loadUserPreference() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (!user) {
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        const cachedPreference = readStoredPreference(user.id);
        if (cachedPreference) {
          setPreference(cachedPreference);
          setSavedPreference(cachedPreference);
        }

        const { preference: remotePreference } = await getUserBackgroundThemeAction();
        if (!isMounted) return;

        setPreference(remotePreference);
        setSavedPreference(remotePreference);
        writeStoredPreference(remotePreference, user.id);
      } catch (error) {
        console.error('[background-theme] Failed to load preference:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUserPreference();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user?.id ?? null;
      setUserId(nextUserId);

      const nextPreference = readStoredPreference(nextUserId ?? undefined);
      setPreference(nextPreference);
      setSavedPreference(nextPreference);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (!event.key?.startsWith(STORAGE_KEY) || !event.newValue) return;

      const nextPreference = normalizeBackgroundThemePreference(
        safeJsonParse(event.newValue)
      );
      setPreference(nextPreference);
      setSavedPreference(nextPreference);
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const previewPreference = React.useCallback((nextPreference: BackgroundThemePreference) => {
    setPreference(normalizeBackgroundThemePreference(nextPreference));
  }, []);

  const savePreference = React.useCallback(
    async (nextPreference: BackgroundThemePreference) => {
      const normalizedPreference = normalizeBackgroundThemePreference(nextPreference);
      setPreference(normalizedPreference);
      setIsSaving(true);

      try {
        const result = await updateUserBackgroundThemeAction(normalizedPreference);

        if (!result.success) {
          return { success: false as const, error: result.error };
        }

        setPreference(result.preference);
        setSavedPreference(result.preference);
        writeStoredPreference(result.preference, userId ?? undefined);
        return { success: true as const };
      } catch (error: any) {
        console.error('[background-theme] Failed to save preference:', error);
        return {
          success: false as const,
          error: error?.message || 'Unable to save the background theme.',
        };
      } finally {
        setIsSaving(false);
      }
    },
    [userId]
  );

  const value = React.useMemo<BackgroundThemeContextValue>(
    () => ({
      preference,
      savedPreference,
      resolvedTheme: resolveBackgroundTheme(preference),
      isLoading,
      isSaving,
      previewPreference,
      savePreference,
    }),
    [
      preference,
      savedPreference,
      isLoading,
      isSaving,
      previewPreference,
      savePreference,
    ]
  );

  return (
    <BackgroundThemeContext.Provider value={value}>
      {children}
    </BackgroundThemeContext.Provider>
  );
}

export function useBackgroundTheme() {
  const context = React.useContext(BackgroundThemeContext);

  if (!context) {
    throw new Error('useBackgroundTheme must be used inside BackgroundThemeProvider');
  }

  return context;
}

function readStoredPreference(userId?: string) {
  if (typeof window === 'undefined') {
    return DEFAULT_BACKGROUND_THEME;
  }

  const stored = userId
    ? window.localStorage.getItem(getUserStorageKey(userId))
    : null;
  const fallbackStored = window.localStorage.getItem(STORAGE_KEY);

  return normalizeBackgroundThemePreference(
    safeJsonParse(stored ?? fallbackStored ?? '')
  );
}

function writeStoredPreference(preference: BackgroundThemePreference, userId?: string) {
  if (typeof window === 'undefined') return;

  const serialized = JSON.stringify(preference);
  window.localStorage.setItem(STORAGE_KEY, serialized);

  if (userId) {
    window.localStorage.setItem(getUserStorageKey(userId), serialized);
  }
}

function getUserStorageKey(userId: string) {
  return `${STORAGE_KEY}:${userId}`;
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
