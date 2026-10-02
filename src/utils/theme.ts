export interface ThemePalette {
  id: string;
  name: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryText: string;
  headerBg: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  summaryBg: string;
}

export const THEMES: Record<string, ThemePalette> = {
  'zoho-blue': {
    id: 'zoho-blue',
    name: 'Zoho Classic Blue',
    primary: '#1d4ed8',
    primaryLight: '#eff6ff',
    primaryDark: '#1e40af',
    primaryText: '#1e40af',
    headerBg: '#f8fafc',
    accentBorder: '#bfdbfe',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af',
    summaryBg: '#f0f7ff',
  },
  'emerald': {
    id: 'emerald',
    name: 'Emerald Retail',
    primary: '#047857',
    primaryLight: '#ecfdf5',
    primaryDark: '#065f46',
    primaryText: '#065f46',
    headerBg: '#f8fafc',
    accentBorder: '#a7f3d0',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
    summaryBg: '#f0fdf4',
  },
  'navy': {
    id: 'navy',
    name: 'Corporate Navy',
    primary: '#0f172a',
    primaryLight: '#f8fafc',
    primaryDark: '#020617',
    primaryText: '#0f172a',
    headerBg: '#f8fafc',
    accentBorder: '#cbd5e1',
    badgeBg: '#e2e8f0',
    badgeText: '#1e293b',
    summaryBg: '#f8fafc',
  },
  'charcoal': {
    id: 'charcoal',
    name: 'Minimal Charcoal',
    primary: '#334155',
    primaryLight: '#f1f5f9',
    primaryDark: '#1e293b',
    primaryText: '#334155',
    headerBg: '#fafafa',
    accentBorder: '#e2e8f0',
    badgeBg: '#f1f5f9',
    badgeText: '#334155',
    summaryBg: '#f8fafc',
  },
  'violet': {
    id: 'violet',
    name: 'Creative Violet',
    primary: '#6d28d9',
    primaryLight: '#f5f3ff',
    primaryDark: '#5b21b6',
    primaryText: '#5b21b6',
    headerBg: '#faf5ff',
    accentBorder: '#ddd6fe',
    badgeBg: '#ede9fe',
    badgeText: '#5b21b6',
    summaryBg: '#faf5ff',
  },
};

export function getTheme(themeKey?: string): ThemePalette {
  return THEMES[themeKey || 'zoho-blue'] || THEMES['zoho-blue'];
}
