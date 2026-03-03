export type ThemePaletteId =
  | 'lavenderPink'
  | 'oceanCoral';

export type ThemePalette = {
  id: ThemePaletteId;
  name: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    mutedText: string;
    border: string;
    primary: string;
    primaryText: string;
    accent: string;
    accentText: string;
    danger: string;
    dangerText: string;
  };
};

export const THEME_PALETTES: Record<ThemePaletteId, ThemePalette> = {
  lavenderPink: {
    id: 'lavenderPink',
    name: 'Lavender & Pink',
    colors: {
      background: '#FFF7FF',
      surface: '#FFFFFF',
      text: '#1D1324',
      mutedText: '#6A5D72',
      border: '#E7D7F0',
      primary: '#B57EDC',
      primaryText: '#FFFFFF',
      accent: '#FF69B4',
      accentText: '#FFFFFF',
      danger: '#c9001b',
      dangerText: '#FFFFFF',
    },
  },
  oceanCoral: {
    id: 'oceanCoral',
    name: 'Ocean & Coral',
    colors: {
      background: '#F4FAFF',
      surface: '#FFFFFF',
      text: '#0B1B2B',
      mutedText: '#4A647A',
      border: '#D6E7F6',
      primary: '#0284C7',
      primaryText: '#FFFFFF',
      accent: '#FB7185',
      accentText: '#FFFFFF',
      danger: '#DC2626',
      dangerText: '#FFFFFF',
    },
  },
};

export function getPalette(id: ThemePaletteId): ThemePalette {
  return THEME_PALETTES[id];
}

