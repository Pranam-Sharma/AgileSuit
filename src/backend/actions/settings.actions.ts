'use server';

import { createClient } from '@/auth/supabase/server';
import {
  DEFAULT_BACKGROUND_THEME,
  normalizeBackgroundThemePreference,
  type BackgroundThemePreference,
} from '@/lib/background-themes';

export async function getUserBackgroundThemeAction(): Promise<{
  preference: BackgroundThemePreference;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { preference: DEFAULT_BACKGROUND_THEME };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('background_theme')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('[settings] Failed to load background theme:', error);
    return { preference: DEFAULT_BACKGROUND_THEME };
  }

  return {
    preference: normalizeBackgroundThemePreference(
      (data as { background_theme?: unknown } | null)?.background_theme
    ),
  };
}

export async function updateUserBackgroundThemeAction(
  preference: BackgroundThemePreference
): Promise<{ success: true; preference: BackgroundThemePreference } | { success: false; error: string }> {
  const normalizedPreference = normalizeBackgroundThemePreference(preference);
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: 'You need to be signed in to save settings.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ background_theme: normalizedPreference })
    .eq('id', user.id);

  if (error) {
    console.error('[settings] Failed to update background theme:', error);
    return {
      success: false,
      error: 'Unable to save the background theme. Please check that the settings migration has been applied.',
    };
  }

  return { success: true, preference: normalizedPreference };
}
