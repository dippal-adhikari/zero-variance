import React, { createContext, useContext, useMemo } from 'react';
import type { Theme } from '@react-navigation/native';

import { getPalette, type ThemePalette } from './palettes';
import { useSettings } from '../state/SettingsContext';

type ThemeContextValue = {
  palette: ThemePalette;
  navTheme: Theme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  const value = useMemo<ThemeContextValue>(() => {
    const palette = getPalette(settings.themeId);
    const navTheme: Theme = {
      dark: palette.colors.background.toLowerCase() === '#0b1020' || palette.colors.background.toLowerCase() === '#0f0f12',
      colors: {
        primary: palette.colors.primary,
        background: palette.colors.background,
        card: palette.colors.surface,
        text: palette.colors.text,
        border: palette.colors.border,
        notification: palette.colors.accent,
      },
      fonts: {
        regular: { fontFamily: 'System', fontWeight: '400' },
        medium: { fontFamily: 'System', fontWeight: '500' },
        bold: { fontFamily: 'System', fontWeight: '700' },
        heavy: { fontFamily: 'System', fontWeight: '800' },
      },
    };
    return { palette, navTheme };
  }, [settings.themeId]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

