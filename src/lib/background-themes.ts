export type BackgroundThemePreference =
  | { type: 'gradient'; id: string }
  | { type: 'custom'; color: string };

export type GradientBackgroundTheme = {
  id: string;
  name: string;
  colors: [string, string, string];
  accent: string;
  liquidColors?: [string, string, string, string, string];
  mood?: 'light' | 'vivid' | 'noir';
};

export type ResolvedBackgroundTheme = {
  name: string;
  accent: string;
  canvasBackground: string;
  canvasOverlay: string;
  liquidBackground: string;
  glassHighlight: string;
  vignetteOverlay: string;
  surface: string;
  surfaceStrong: string;
  surfaceMuted: string;
  field: string;
  surfaceBorder: string;
  surfaceShadow: string;
  subtleGrid: string;
  noiseOpacity: string;
  readabilityOpacity: string;
};

export const DEFAULT_BACKGROUND_THEME: BackgroundThemePreference = {
  type: 'gradient',
  id: 'agile-rose',
};

export const DEFAULT_CUSTOM_BACKGROUND_COLOR = '#f8fafc';

export const BACKGROUND_GRADIENT_THEMES: GradientBackgroundTheme[] = [
  {
    id: 'agile-rose',
    name: 'Agile Rose',
    colors: ['#f8fafc', '#fbe9ec', '#eef6ff'],
    accent: '#8b2635',
    liquidColors: ['#fbe9ec', '#dbeafe', '#ffffff', '#fda4af', '#8b2635'],
  },
  {
    id: 'ocean-mint',
    name: 'Ocean Mint',
    colors: ['#e0f2fe', '#dcfce7', '#fff7ed'],
    accent: '#0f766e',
    liquidColors: ['#67e8f9', '#bbf7d0', '#fef3c7', '#bfdbfe', '#0f766e'],
  },
  {
    id: 'aurora-lime',
    name: 'Aurora Lime',
    colors: ['#ecfccb', '#cffafe', '#fae8ff'],
    accent: '#65a30d',
    liquidColors: ['#bef264', '#67e8f9', '#f0abfc', '#fef08a', '#65a30d'],
  },
  {
    id: 'sunset-coral',
    name: 'Sunset Coral',
    colors: ['#fff1f2', '#fed7aa', '#fde68a'],
    accent: '#e11d48',
    liquidColors: ['#fb7185', '#fdba74', '#fde047', '#f0abfc', '#e11d48'],
  },
  {
    id: 'alpine-sky',
    name: 'Alpine Sky',
    colors: ['#f0f9ff', '#e0e7ff', '#f8fafc'],
    accent: '#2563eb',
    liquidColors: ['#bfdbfe', '#a5b4fc', '#f8fafc', '#93c5fd', '#2563eb'],
  },
  {
    id: 'meadow-day',
    name: 'Meadow Day',
    colors: ['#f0fdf4', '#fef9c3', '#e0f2fe'],
    accent: '#16a34a',
    liquidColors: ['#86efac', '#fef08a', '#bae6fd', '#bbf7d0', '#16a34a'],
  },
  {
    id: 'berry-slate',
    name: 'Berry Slate',
    colors: ['#fdf2f8', '#e0e7ff', '#f1f5f9'],
    accent: '#9333ea',
    liquidColors: ['#f9a8d4', '#c4b5fd', '#e2e8f0', '#a5b4fc', '#9333ea'],
  },
  {
    id: 'citrus-teal',
    name: 'Citrus Teal',
    colors: ['#ecfeff', '#fef3c7', '#dcfce7'],
    accent: '#0891b2',
    liquidColors: ['#67e8f9', '#fde68a', '#86efac', '#fdba74', '#0891b2'],
  },
  {
    id: 'graphite-glow',
    name: 'Graphite Glow',
    colors: ['#f8fafc', '#e2e8f0', '#ddd6fe'],
    accent: '#475569',
    liquidColors: ['#cbd5e1', '#ddd6fe', '#f8fafc', '#bae6fd', '#475569'],
  },
  {
    id: 'lagoon-pink',
    name: 'Lagoon Pink',
    colors: ['#ccfbf1', '#dbeafe', '#ffe4e6'],
    accent: '#0f766e',
    liquidColors: ['#5eead4', '#93c5fd', '#fda4af', '#f0abfc', '#0f766e'],
  },
  {
    id: 'oil-slick',
    name: 'Oil Slick',
    colors: ['#d9f99d', '#67e8f9', '#f0abfc'],
    accent: '#14532d',
    liquidColors: ['#020617', '#16a34a', '#f000b8', '#ef4444', '#7c3aed'],
    mood: 'noir',
  },
  {
    id: 'solar-bloom',
    name: 'Solar Bloom',
    colors: ['#fef08a', '#fb7185', '#60a5fa'],
    accent: '#dc2626',
    liquidColors: ['#facc15', '#f97316', '#ef4444', '#f9a8d4', '#1d4ed8'],
    mood: 'vivid',
  },
  {
    id: 'moss-noir',
    name: 'Moss Noir',
    colors: ['#d6d3a8', '#84a98c', '#111827'],
    accent: '#3f6212',
    liquidColors: ['#0b0f0b', '#4d7c0f', '#d6c177', '#84a98c', '#1f2937'],
    mood: 'noir',
  },
  {
    id: 'prismatic-glass',
    name: 'Prismatic Glass',
    colors: ['#22d3ee', '#fb7185', '#7c3aed'],
    accent: '#7c3aed',
    liquidColors: ['#22d3ee', '#2563eb', '#fb7185', '#fef08a', '#7c3aed'],
    mood: 'vivid',
  },
  {
    id: 'edgy-neon',
    name: 'Edgy Neon',
    colors: ['#111827', '#7c3aed', '#fb7185'],
    accent: '#ec4899',
    liquidColors: ['#020617', '#4c1d95', '#ec4899', '#fb7185', '#0f766e'],
    mood: 'noir',
  },
  {
    id: 'duotone-amber',
    name: 'Duotone Amber',
    colors: ['#fef3c7', '#f59e0b', '#7f1d1d'],
    accent: '#b45309',
    liquidColors: ['#fef3c7', '#f59e0b', '#fb7185', '#7f1d1d', '#fcd34d'],
    mood: 'vivid',
  },
  {
    id: 'cosmic-ramp',
    name: 'Cosmic Ramp',
    colors: ['#0f172a', '#4f46e5', '#f472b6'],
    accent: '#6366f1',
    liquidColors: ['#020617', '#4f46e5', '#06b6d4', '#f472b6', '#f97316'],
    mood: 'noir',
  },
  {
    id: 'velvet-candy',
    name: 'Velvet Candy',
    colors: ['#fecdd3', '#fb7185', '#4f46e5'],
    accent: '#db2777',
    liquidColors: ['#fecdd3', '#fb7185', '#f472b6', '#4f46e5', '#7c3aed'],
    mood: 'vivid',
  },
];

const HEX_COLOR_REGEX = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_REGEX.test(value);
}

export function getGradientBackgroundTheme(id: string) {
  return (
    BACKGROUND_GRADIENT_THEMES.find((theme) => theme.id === id) ??
    BACKGROUND_GRADIENT_THEMES[0]
  );
}

export function normalizeBackgroundThemePreference(
  preference: unknown
): BackgroundThemePreference {
  if (!preference || typeof preference !== 'object') {
    return DEFAULT_BACKGROUND_THEME;
  }

  const candidate = preference as Partial<BackgroundThemePreference>;

  if (
    candidate.type === 'gradient' &&
    typeof candidate.id === 'string' &&
    BACKGROUND_GRADIENT_THEMES.some((theme) => theme.id === candidate.id)
  ) {
    return { type: 'gradient', id: candidate.id };
  }

  if (candidate.type === 'custom' && isHexColor(candidate.color)) {
    return { type: 'custom', color: candidate.color.toLowerCase() };
  }

  return DEFAULT_BACKGROUND_THEME;
}

export function resolveBackgroundTheme(
  preference: BackgroundThemePreference
): ResolvedBackgroundTheme {
  const normalized = normalizeBackgroundThemePreference(preference);

  if (normalized.type === 'custom') {
    const color = normalized.color;
    const softColor = mixHexWithWhite(color, 0.78);
    const softerColor = mixHexWithWhite(color, 0.9);
    const accent = mixHexWithBlack(color, 0.2);
    const surface = buildSurfacePalette(accent, 'light');

    return {
      name: 'Custom Color',
      accent,
      canvasBackground: `linear-gradient(135deg, ${softerColor} 0%, ${softColor} 48%, #ffffff 100%)`,
      canvasOverlay: `linear-gradient(115deg, ${hexToRgba(color, 0.22)} 0%, ${hexToRgba(
        '#ffffff',
        0.12
      )} 44%, ${hexToRgba(accent, 0.14)} 100%)`,
      liquidBackground: buildLiquidBackground(
        [softColor, color, softerColor, '#ffffff', accent],
        accent,
        'light'
      ),
      glassHighlight: buildGlassHighlight(color, 'light'),
      vignetteOverlay: buildVignetteOverlay(accent, 'light'),
      surface: surface.surface,
      surfaceStrong: surface.surfaceStrong,
      surfaceMuted: surface.surfaceMuted,
      field: surface.field,
      surfaceBorder: surface.surfaceBorder,
      surfaceShadow: surface.surfaceShadow,
      subtleGrid: hexToRgba(accent, 0.08),
      noiseOpacity: '0.035',
      readabilityOpacity: '0.26',
    };
  }

  const theme = getGradientBackgroundTheme(normalized.id);
  const [first, second, third] = theme.colors;
  const mood = theme.mood ?? 'light';
  const liquidColors: [string, string, string, string, string] =
    theme.liquidColors ?? [first, second, third, '#ffffff', theme.accent];
  const surface = buildSurfacePalette(theme.accent, mood);

  return {
    name: theme.name,
    accent: theme.accent,
    canvasBackground: `linear-gradient(135deg, ${first} 0%, ${second} 50%, ${third} 100%)`,
    canvasOverlay: `linear-gradient(115deg, ${hexToRgba(theme.accent, 0.13)} 0%, ${hexToRgba(
      '#ffffff',
      0.16
    )} 42%, ${hexToRgba(second, 0.34)} 100%)`,
    liquidBackground: buildLiquidBackground(liquidColors, theme.accent, mood),
    glassHighlight: buildGlassHighlight(theme.accent, mood),
    vignetteOverlay: buildVignetteOverlay(theme.accent, mood),
    surface: surface.surface,
    surfaceStrong: surface.surfaceStrong,
    surfaceMuted: surface.surfaceMuted,
    field: surface.field,
    surfaceBorder: surface.surfaceBorder,
    surfaceShadow: surface.surfaceShadow,
    subtleGrid: hexToRgba(theme.accent, mood === 'noir' ? 0.05 : 0.07),
    noiseOpacity: mood === 'noir' ? '0.08' : mood === 'vivid' ? '0.055' : '0.04',
    readabilityOpacity: mood === 'noir' ? '0.46' : mood === 'vivid' ? '0.28' : '0.2',
  };
}

export function getBackgroundThemeCssVariables(
  preference: BackgroundThemePreference
) {
  const theme = resolveBackgroundTheme(preference);

  return {
    '--platform-canvas-background': theme.canvasBackground,
    '--platform-canvas-overlay': theme.canvasOverlay,
    '--platform-liquid-background': theme.liquidBackground,
    '--platform-glass-highlight': theme.glassHighlight,
    '--platform-vignette-overlay': theme.vignetteOverlay,
    '--platform-surface': theme.surface,
    '--platform-surface-strong': theme.surfaceStrong,
    '--platform-surface-muted': theme.surfaceMuted,
    '--platform-field': theme.field,
    '--platform-surface-border': theme.surfaceBorder,
    '--platform-surface-shadow': theme.surfaceShadow,
    '--platform-subtle-grid': theme.subtleGrid,
    '--platform-noise-opacity': theme.noiseOpacity,
    '--platform-readability-opacity': theme.readabilityOpacity,
    '--platform-accent': theme.accent,
  };
}

function buildSurfacePalette(
  accent: string,
  mood: GradientBackgroundTheme['mood'] = 'light'
) {
  const surfaceBase = mixHexWithWhite(accent, mood === 'noir' ? 0.72 : 0.86);
  const mutedBase = mixHexWithWhite(accent, mood === 'noir' ? 0.62 : 0.78);
  const borderBase = mixHexWithWhite(accent, mood === 'noir' ? 0.52 : 0.68);

  return {
    surface: hexToRgba(surfaceBase, mood === 'noir' ? 0.58 : 0.62),
    surfaceStrong: hexToRgba(mixHexWithWhite(accent, mood === 'noir' ? 0.82 : 0.92), mood === 'noir' ? 0.7 : 0.78),
    surfaceMuted: hexToRgba(mutedBase, mood === 'noir' ? 0.36 : 0.42),
    field: hexToRgba(mixHexWithWhite(accent, mood === 'noir' ? 0.86 : 0.95), mood === 'noir' ? 0.76 : 0.82),
    surfaceBorder: hexToRgba(borderBase, mood === 'noir' ? 0.42 : 0.5),
    surfaceShadow: hexToRgba(accent, mood === 'noir' ? 0.24 : 0.14),
  };
}

function buildLiquidBackground(
  colors: [string, string, string, string, string],
  accent: string,
  mood: GradientBackgroundTheme['mood'] = 'light'
) {
  const [first, second, third, fourth, fifth] = colors;
  const vividBoost = mood === 'vivid' ? 1.15 : mood === 'noir' ? 0.9 : 1;
  const firstAlpha = 0.8 * vividBoost;
  const secondAlpha = 0.72 * vividBoost;
  const thirdAlpha = 0.66 * vividBoost;
  const fourthAlpha = 0.62 * vividBoost;
  const fifthAlpha = mood === 'noir' ? 0.72 : 0.48;
  const baseAlpha = mood === 'noir' ? 0.86 : 0.52;

  return [
    `radial-gradient(ellipse 120% 82% at 12% -8%, ${hexToRgba(first, firstAlpha)} 0%, ${hexToRgba(first, 0)} 56%)`,
    `radial-gradient(ellipse 115% 88% at 94% 2%, ${hexToRgba(second, secondAlpha)} 0%, ${hexToRgba(second, 0)} 58%)`,
    `radial-gradient(ellipse 96% 132% at 4% 95%, ${hexToRgba(third, thirdAlpha)} 0%, ${hexToRgba(third, 0)} 62%)`,
    `radial-gradient(ellipse 110% 86% at 90% 92%, ${hexToRgba(fourth, fourthAlpha)} 0%, ${hexToRgba(fourth, 0)} 60%)`,
    `conic-gradient(from 218deg at 48% 52%, ${hexToRgba(first, 0.58)}, ${hexToRgba(
      second,
      0.5
    )}, ${hexToRgba(third, 0.54)}, ${hexToRgba(fourth, 0.5)}, ${hexToRgba(
      fifth,
      fifthAlpha
    )}, ${hexToRgba(first, 0.58)})`,
    `linear-gradient(132deg, ${hexToRgba(mood === 'noir' ? '#020617' : '#ffffff', baseAlpha)} 0%, ${hexToRgba(
      accent,
      mood === 'noir' ? 0.38 : 0.18
    )} 48%, ${hexToRgba(second, 0.38)} 100%)`,
  ].join(', ');
}

function buildGlassHighlight(
  accent: string,
  mood: GradientBackgroundTheme['mood'] = 'light'
) {
  const whiteAlpha = mood === 'noir' ? 0.32 : 0.42;
  const accentAlpha = mood === 'noir' ? 0.18 : 0.12;

  return `linear-gradient(118deg, ${hexToRgba('#ffffff', whiteAlpha)} 0%, ${hexToRgba(
    '#ffffff',
    0
  )} 34%, ${hexToRgba(accent, accentAlpha)} 49%, ${hexToRgba(
    '#ffffff',
    whiteAlpha * 0.55
  )} 64%, ${hexToRgba('#ffffff', 0)} 100%)`;
}

function buildVignetteOverlay(
  accent: string,
  mood: GradientBackgroundTheme['mood'] = 'light'
) {
  const edgeColor = mood === 'noir' ? '#020617' : mixHexWithBlack(accent, 0.42);
  const edgeAlpha = mood === 'noir' ? 0.44 : 0.14;

  return `radial-gradient(ellipse 92% 82% at 50% 44%, ${hexToRgba(
    '#ffffff',
    mood === 'noir' ? 0.18 : 0.24
  )} 0%, ${hexToRgba('#ffffff', 0.05)} 46%, ${hexToRgba(edgeColor, edgeAlpha)} 100%)`;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((component) => Math.round(component).toString(16).padStart(2, '0'))
    .join('')}`;
}

function hexToRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixHexWithWhite(hex: string, whiteAmount: number) {
  const { r, g, b } = hexToRgb(hex);

  return rgbToHex(
    r + (255 - r) * whiteAmount,
    g + (255 - g) * whiteAmount,
    b + (255 - b) * whiteAmount
  );
}

function mixHexWithBlack(hex: string, blackAmount: number) {
  const { r, g, b } = hexToRgb(hex);

  return rgbToHex(r * (1 - blackAmount), g * (1 - blackAmount), b * (1 - blackAmount));
}
