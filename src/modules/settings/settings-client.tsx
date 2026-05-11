'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Palette, Pipette, RotateCcw, Save } from 'lucide-react';
import { createClient } from '@/auth/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/utils/cn';
import { Sidebar } from '@/modules/dashboard/sidebar';
import { UserNav } from '@/modules/dashboard/user-nav';
import { PlatformBackground } from '@/modules/platform/platform-background';
import { useBackgroundTheme } from '@/modules/platform/background-theme-provider';
import {
  BACKGROUND_GRADIENT_THEMES,
  DEFAULT_CUSTOM_BACKGROUND_COLOR,
  isHexColor,
  normalizeBackgroundThemePreference,
  resolveBackgroundTheme,
  type BackgroundThemePreference,
} from '@/lib/background-themes';

export function SettingsClient() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [user, setUser] = React.useState<any>(null);
  const [isUserLoading, setIsUserLoading] = React.useState(true);
  const {
    preference,
    savedPreference,
    previewPreference,
    savePreference,
    isSaving,
  } = useBackgroundTheme();
  const [draftPreference, setDraftPreference] =
    React.useState<BackgroundThemePreference>(preference);
  const [customColor, setCustomColor] = React.useState(
    preference.type === 'custom' ? preference.color : DEFAULT_CUSTOM_BACKGROUND_COLOR
  );

  React.useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login');
        return;
      }

      setUser(user);
      setIsUserLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  React.useEffect(() => {
    setDraftPreference(savedPreference);

    if (savedPreference.type === 'custom') {
      setCustomColor(savedPreference.color);
    }
  }, [savedPreference]);

  React.useEffect(() => {
    previewPreference(draftPreference);
  }, [draftPreference, previewPreference]);

  const normalizedDraft = normalizeBackgroundThemePreference(draftPreference);
  const normalizedSaved = normalizeBackgroundThemePreference(savedPreference);
  const hasChanges = JSON.stringify(normalizedDraft) !== JSON.stringify(normalizedSaved);
  const previewTheme = resolveBackgroundTheme(normalizedDraft);

  const handleGradientSelect = (themeId: string) => {
    setDraftPreference({ type: 'gradient', id: themeId });
  };

  const handleCustomColorChange = (value: string) => {
    setCustomColor(value);

    if (isHexColor(value)) {
      setDraftPreference({ type: 'custom', color: value.toLowerCase() });
    }
  };

  const handleSave = async () => {
    const result = await savePreference(normalizedDraft);

    if (result.success) {
      toast({
        title: 'Background saved',
        description: 'Your workspace theme is now linked to your profile.',
      });
      return;
    }

    toast({
      title: 'Save failed',
      description: result.error,
      variant: 'destructive',
    });
  };

  const handleRevert = () => {
    setDraftPreference(savedPreference);

    if (savedPreference.type === 'custom') {
      setCustomColor(savedPreference.color);
    }
  };

  if (isUserLoading || !user) {
    return <LoadingScreen message="Loading Settings..." />;
  }

  return (
    <div
      className="min-h-screen w-full font-sans selection:bg-rose-100 text-slate-900 overflow-x-hidden"
      style={{ background: 'var(--platform-canvas-background)' }}
    >
      <PlatformBackground />

      <div className="flex relative z-10">
        <Sidebar />

        <main className="flex-1 ml-72 min-h-screen p-8 lg:p-12">
          <div className="max-w-[1180px] mx-auto space-y-8">
            <header className="flex items-center justify-between gap-6">
              <div>
                <Badge className="bg-white/70 text-slate-700 border border-white/70 rounded-md px-3 py-1 font-bold shadow-none">
                  Settings
                </Badge>
                <h1 className="mt-4 text-4xl font-extrabold text-slate-900 tracking-tight">
                  Personalization
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="h-11 rounded-md bg-white/60 border-white/70 text-slate-700 hover:bg-white"
                  onClick={handleRevert}
                  disabled={!hasChanges || isSaving}
                >
                  <RotateCcw className="h-4 w-4" />
                  Revert
                </Button>
                <Button
                  className="h-11 rounded-md bg-slate-900 hover:bg-slate-800 text-white"
                  onClick={handleSave}
                  disabled={
                    !hasChanges ||
                    isSaving ||
                    (normalizedDraft.type === 'custom' && !isHexColor(customColor))
                  }
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save background
                </Button>
                <UserNav user={user} />
              </div>
            </header>

            <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
              <div className="rounded-lg border border-white/70 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
                <div className="flex items-center gap-3 border-b border-slate-200/70 pb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Website Background
                    </h2>
                    <p className="text-sm font-medium text-slate-500">
                      {previewTheme.name}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {BACKGROUND_GRADIENT_THEMES.map((theme) => {
                    const isSelected =
                      normalizedDraft.type === 'gradient' && normalizedDraft.id === theme.id;
                    const cardTheme = resolveBackgroundTheme({ type: 'gradient', id: theme.id });

                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleGradientSelect(theme.id)}
                        className={cn(
                          'group relative h-32 overflow-hidden rounded-lg border text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
                          isSelected ? 'border-slate-900' : 'border-white/80'
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors[0]} 0%, ${theme.colors[1]} 50%, ${theme.colors[2]} 100%)`,
                        }}
                        aria-pressed={isSelected}
                      >
                        <span
                          className="absolute -inset-8 block blur-2xl saturate-[1.25]"
                          style={{ background: cardTheme.liquidBackground }}
                        />
                        <span
                          className="absolute inset-0 block"
                          style={{ background: cardTheme.glassHighlight }}
                        />
                        <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-white/72 px-3 py-2 text-sm font-bold text-slate-800 backdrop-blur-md">
                          {theme.name}
                          {isSelected && (
                            <span
                              className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                              style={{ backgroundColor: theme.accent }}
                            >
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 rounded-lg border border-slate-200/70 bg-white/60 p-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                    <div className="space-y-2">
                      <Label htmlFor="custom-background-color" className="text-sm font-bold">
                        Custom color
                      </Label>
                      <div className="flex items-center gap-3">
                        <input
                          id="custom-background-color"
                          type="color"
                          value={isHexColor(customColor) ? customColor : DEFAULT_CUSTOM_BACKGROUND_COLOR}
                          onChange={(event) => handleCustomColorChange(event.target.value)}
                          className="h-11 w-14 cursor-pointer rounded-md border border-slate-200 bg-white p-1"
                        />
                        <Pipette className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label htmlFor="custom-background-hex" className="text-sm font-bold">
                        Hex
                      </Label>
                      <Input
                        id="custom-background-hex"
                        value={customColor}
                        onChange={(event) => handleCustomColorChange(event.target.value)}
                        className={cn(
                          'h-11 rounded-md bg-white/80 border-slate-200 font-mono uppercase',
                          !isHexColor(customColor) &&
                            'border-red-300 focus-visible:ring-red-200'
                        )}
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <aside className="rounded-lg border border-white/70 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
                <div
                  className="relative h-[420px] overflow-hidden rounded-lg border border-white/70 shadow-inner"
                  style={{ background: previewTheme.canvasBackground }}
                >
                  <div
                    className="absolute -inset-12 blur-2xl saturate-[1.25]"
                    style={{ background: previewTheme.liquidBackground }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: previewTheme.canvasOverlay }}
                  />
                  <div
                    className="absolute inset-0 backdrop-blur-[10px]"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.24), rgba(255,255,255,0.08), rgba(255,255,255,0.24))',
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: previewTheme.glassHighlight }}
                  />
                  <div className="relative z-10 p-5">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="h-8 w-28 rounded-md bg-white/70" />
                      <div className="h-8 w-8 rounded-full bg-white/70" />
                    </div>
                    <div className="mb-5 h-9 w-44 rounded-md bg-white/80" />
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="h-28 rounded-lg border border-white/70 bg-white/65 p-3 shadow-sm"
                        >
                          <div
                            className="mb-4 h-2 w-12 rounded-full"
                            style={{ backgroundColor: previewTheme.accent }}
                          />
                          <div className="mb-2 h-3 rounded-full bg-slate-900/15" />
                          <div className="h-3 w-2/3 rounded-full bg-slate-900/10" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{previewTheme.name}</p>
                    <p className="text-xs font-medium text-slate-500">{previewTheme.accent}</p>
                  </div>
                  {hasChanges ? (
                    <Badge className="rounded-md bg-amber-100 text-amber-700 hover:bg-amber-100">
                      Unsaved
                    </Badge>
                  ) : (
                    <Badge className="rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      Saved
                    </Badge>
                  )}
                </div>
              </aside>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
