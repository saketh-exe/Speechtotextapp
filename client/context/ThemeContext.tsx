import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { lightPalette, darkPalette, m3ToPalette, type AppPalette } from '@/constants/theme';

// Seed used on Android <12 and iOS as the fallback source color
const SEED_COLOR = '#4040CC';

interface ThemeContextType {
  palette: AppPalette;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  palette: lightPalette,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Reads wallpaper-based dynamic colors on Android 12+ (Material You / Monet).
  // Falls back to a palette generated from SEED_COLOR on older Android and iOS.
  const { theme } = useMaterial3Theme({ fallbackSourceColor: SEED_COLOR });

  let palette: AppPalette;
  try {
    const scheme = theme?.light ? (isDark ? theme.dark : theme.light) : null;
    palette = scheme ? m3ToPalette(scheme, isDark) : (isDark ? darkPalette : lightPalette);
  } catch {
    palette = isDark ? darkPalette : lightPalette;
  }

  return (
    <ThemeContext.Provider value={{ palette, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
