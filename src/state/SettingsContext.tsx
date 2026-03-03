import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { ThemePaletteId } from '../theme/palettes';
import { loadSettings, saveSettings, type AppSettings, DEFAULT_SETTINGS } from './settings';

type SettingsContextValue = {
  settings: AppSettings;
  ready: boolean;
  setThemeId: (id: ThemePaletteId) => void;
  setDefaultFloat: (value: string) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadSettings()
      .then((loaded) => {
        if (!mounted) return;
        setSettings(loaded);
        setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setSettings(DEFAULT_SETTINGS);
        setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<SettingsContextValue>(() => {
    const persist = (next: AppSettings) => {
      setSettings(next);
      void saveSettings(next);
    };

    return {
      settings,
      ready,
      setThemeId: (id) => persist({ ...settings, themeId: id }),
      setDefaultFloat: (v) => persist({ ...settings, defaultFloat: v }),
    };
  }, [ready, settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

