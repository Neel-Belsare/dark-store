export const COLORS = {
  // Signature Lavender & Dark Slate Palette (Modern Tablet Dashboard Aesthetic)
  brandYellow: '#EDE6DC', // Warm Champagne Sand
  brandYellowDark: '#7A7266',
  brandYellowLight: '#FBF8F5',
  brandYellowSubtle: '#FAF7F2',

  brandGreen: '#8B82F6', // Periwinkle Lavender Accent
  brandGreenDark: '#6E68B8',
  brandGreenLight: '#EEEDFE',
  brandGreenSubtle: '#F6F5FF',
  brandGreenBorder: '#D4D0FC',

  // Surfaces & Backgrounds
  background: '#F4F5F9',
  backgroundAlt: '#ECECF4',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F8FC',
  surfaceMuted: '#F0F1F7',
  surfaceDark: '#18181F', // Matte Dark Charcoal

  // Typography & Text Hierarchies
  textPrimary: '#14141E',
  textSecondary: '#4B4B5E',
  textTertiary: '#6E6E82',
  textMuted: '#9696A6',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#EAEBF2',
  borderSubtle: '#F2F2F8',
  borderStrong: '#D2D3E0',
  borderFocus: '#8B82F6',

  // Status & Telemetry Accents
  accentIndigo: '#8B82F6',
  accentLavender: '#B5AFF6',
  accentChampagne: '#EDE6DC',
  accentDark: '#18181F',
  accentCyan: '#06B6D4',
  dangerRed: '#EF4444',
  dangerRedLight: '#FEE2E2',
  warningAmber: '#F59E0B',
  warningAmberLight: '#FEF3C7',
  ratingGold: '#F59E0B',
  successEmerald: '#10B981',
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const TYPOGRAPHY = {
  caption: 10,
  footnote: 11,
  sub: 12,
  bodySmall: 13,
  body: 14,
  bodyMedium: 14,
  bodyLarge: 15,
  subtitle: 16,
  title: 18,
  headline: 20,
  hero: 24,
  h1: 24,
  h2: 20,
  h3: 16,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 22,
  xxl: 26,
  pill: 32,
  full: 9999,
};

export const SHADOWS = {
  subtle: {
    shadowColor: '#18181F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  small: {
    shadowColor: '#18181F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    shadowColor: '#18181F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#18181F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  stickyFooter: {
    shadowColor: '#18181F',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 8,
  },
  modal: {
    shadowColor: '#18181F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
};
