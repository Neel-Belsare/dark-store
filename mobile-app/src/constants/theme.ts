export const COLORS = {
  // Login Page Signature Royal Purple & Indigo Gradient Palette
  brandYellow: '#4E2298',            // Replaced old mustard with Signature InventoryPro Purple
  brandYellowDark: '#2E0854',        // Deep Midnight Violet
  brandYellowLight: '#EDE9FE',       // Soft Lavender Tint
  brandYellowSubtle: '#F5F3FF',      // Ultra-light Violet

  brandGreen: '#4E2298',             // Primary Accent (Purple)
  brandGreenDark: '#2E0854',
  brandGreenLight: '#EDE9FE',
  brandGreenSubtle: '#F8F6FE',
  brandGreenBorder: '#DDD6FE',

  // Surfaces & Backgrounds
  background: '#F1F3F9',             // Sleek Cool Gray matching login background
  backgroundAlt: '#E2E8F0',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  surfaceMuted: '#F1F5F9',
  surfaceDark: '#1E1035',            // Deep Dark Aubergine for Header/Rider

  // Typography & Text Hierarchies
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  borderStrong: '#CBD5E1',
  borderFocus: '#4E2298',

  // Status & Telemetry Accents
  accentIndigo: '#4E2298',
  accentLavender: '#8B5CF6',
  accentChampagne: '#EDE9FE',
  accentDark: '#1E1035',
  accentCyan: '#38BDF8',
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