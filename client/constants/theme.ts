import type { Material3Scheme } from '@pchmn/expo-material3-theme';

export interface AppPalette {
  // Surfaces
  background: string;
  surface: string;
  surfaceVariant: string;
  // Text
  text: string;
  textMuted: string;
  // Brand
  icon: string;
  primary: string;
  secondary: string;
  // Semantic
  success: string;
  danger: string;
  record: string;
  recordPulse: string;
  // Tab bar
  tabBar: string;
  tabBarBorder: string;
  tabBarInactive: string;
  // Misc
  shadow: string;
}

/** Map a Material3 color scheme (light or dark) into our AppPalette */
export function m3ToPalette(m3: Material3Scheme, isDark: boolean): AppPalette {
  // Derive a semi-transparent tab bar from the M3 surface
  const tabBarAlpha = isDark ? 'f7' : 'f5';
  return {
    background: m3.background,
    surface: m3.surface,
    surfaceVariant: m3.surfaceVariant,
    text: m3.onSurface,
    textMuted: m3.onSurfaceVariant,
    icon: m3.primary,
    primary: m3.primary,
    secondary: m3.secondary,
    success: m3.tertiary,
    danger: m3.error,
    record: m3.error,
    recordPulse: m3.error + '33',
    tabBar: m3.surface + tabBarAlpha,
    tabBarBorder: m3.outlineVariant + '66',
    tabBarInactive: m3.onSurfaceVariant,
    shadow: '#000',
  };
}

export const lightPalette: AppPalette = {
  background: '#EDE8FF',        // richer lavender
  surface: '#FFFFFF',
  surfaceVariant: '#D8D0FF',    // punchy violet card
  text: '#0F0A2E',              // deep navy-black
  textMuted: '#5A5480',
  icon: '#4040CC',              // vivid indigo
  primary: '#4040CC',
  secondary: '#E08000',         // deep amber
  success: '#1A9E60',
  danger: '#CC1F24',
  record: '#C00020',
  recordPulse: 'rgba(192,0,32,0.22)',
  tabBar: 'rgba(255,255,255,0.97)',
  tabBarBorder: 'rgba(0,0,0,0.09)',
  tabBarInactive: '#9490B8',
  shadow: '#000',
};

export const darkPalette: AppPalette = {
  background: '#100C24',        // deep purple-black
  surface: '#1C1740',           // rich elevated surface
  surfaceVariant: '#2A2458',    // vivid card background
  text: '#F0EEFF',
  textMuted: '#9E9CC0',
  icon: '#8B8BFF',              // bright violet
  primary: '#8B8BFF',
  secondary: '#FFB800',         // vivid gold
  success: '#25E07A',
  danger: '#FF3A3F',
  record: '#FF2050',
  recordPulse: 'rgba(255,32,80,0.30)',
  tabBar: 'rgba(16,12,36,0.98)',
  tabBarBorder: 'rgba(139,139,255,0.12)',
  tabBarInactive: '#6A67A0',
  shadow: '#000',
};
