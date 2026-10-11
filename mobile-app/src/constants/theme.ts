export const COLORS = {
  // QuickZap Signature Gold & Royal Violet Palette
  brandYellow: '#f7ce00',            // QuickZap Signature Amber / Yellow
  brandYellowDark: '#6b5800',        // Deep Gold Ochre
  brandYellowLight: '#ffe174',       // Soft Warm Gold
  brandYellowSubtle: '#fffdf0',      // Ultra-light Warm Tint

  brandGreen: '#006d32',             // QuickZap Emerald Green Accent
  brandGreenDark: '#005224',
  brandGreenLight: '#80f89d',
  brandGreenSubtle: '#d8fedf',
  brandGreenBorder: '#a3f7ba',

  // Surfaces & Backgrounds
  background: '#f9f9fd',             // Sleek Cool QuickZap background
  backgroundAlt: '#eeedf2',
  surface: '#FFFFFF',
  surfaceSecondary: '#f3f3f7',
  surfaceMuted: '#e8e8ec',
  surfaceDark: '#1a1c1f',            // Deep Dark for Header/Rider

  // Typography & Text Hierarchies
  textPrimary: '#1a1c1f',
  textSecondary: '#4d4632',
  textTertiary: '#7f775f',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#e8e8ec',
  borderSubtle: '#f3f3f7',
  borderStrong: '#CBD5E1',
  borderFocus: '#6549be',

  // Status & Telemetry Accents
  accentIndigo: '#6549be',
  accentLavender: '#8B5CF6',
  accentChampagne: '#e7deff',
  accentDark: '#1a1c1f',
  accentCyan: '#38BDF8',
  dangerRed: '#EF4444',
  dangerRedLight: '#FEE2E2',
  warningAmber: '#F59E0B',
  warningAmberLight: '#FEF3C7',
  ratingGold: '#F59E0B',
  successEmerald: '#006d32',
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
    shadowColor: '#2E0854',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  small: {
    shadowColor: '#2E0854',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: '#2E0854',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#4E2298',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
  },
  stickyFooter: {
    shadowColor: '#2E0854',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  modal: {
    shadowColor: '#2E0854',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 12,
  },
};