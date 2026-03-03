import type { ThemePaletteId } from '../theme/palettes';
import { THEME_PALETTES } from '../theme/palettes';
import { getJson, removeKey, setJson } from '../storage/storage';

const SETTINGS_KEY = 'zero-variance.settings.v1';

export type AppSettings = {
  themeId: ThemePaletteId;
  defaultFloat: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  themeId: 'lavenderPink',
  defaultFloat: '0',
};

export async function loadSettings(): Promise<AppSettings> {
  const stored = await getJson<Partial<AppSettings>>(SETTINGS_KEY);
  const merged = {
    ...DEFAULT_SETTINGS,
    ...(stored ?? {}),
  };

  const maybeThemeId = (merged as unknown as { themeId?: unknown }).themeId;
  if (typeof maybeThemeId !== 'string' || !(maybeThemeId in THEME_PALETTES)) {
    return { ...merged, themeId: DEFAULT_SETTINGS.themeId };
  }

  return merged as AppSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setJson<AppSettings>(SETTINGS_KEY, settings);
}

export async function resetSettings(): Promise<void> {
  await removeKey(SETTINGS_KEY);
}

