/**
 * SKYTRACK TAC-OPS design system.
 * Tactical Glassmorphic HUD + High-Density Technical Minimalism.
 * Tokens derived from stitch_skytrack_live_aviation_intelligence / DESIGN.md
 */
import { Platform } from 'react-native';

export const SKY = {
  colors: {
    surface: '#0a1422',
    surfaceDim: '#0a1422',
    surfaceBright: '#303a49',
    surfaceContainerLowest: '#050e1c',
    surfaceContainerLow: '#121c2a',
    surfaceContainer: '#16202f',
    surfaceContainerHigh: '#212a39',
    surfaceContainerHighest: '#2c3545',
    onSurface: '#d9e3f7',
    onSurfaceVariant: '#bdc8d1',
    inverseSurface: '#d9e3f7',
    inverseOnSurface: '#273140',
    outline: '#87929a',
    outlineVariant: '#3e484f',
    surfaceTint: '#7bd0ff',
    primary: '#8ed5ff',
    onPrimary: '#00354a',
    primaryContainer: '#38bdf8',
    onPrimaryContainer: '#004965',
    secondary: '#4cd7f6',
    onSecondary: '#003640',
    secondaryContainer: '#03b5d3',
    onSecondaryContainer: '#00424e',
    tertiary: '#52e87c',
    onTertiary: '#003915',
    tertiaryContainer: '#2ccb63',
    onTertiaryContainer: '#004f20',
    error: '#ffb4ab',
    onError: '#690005',
    errorContainer: '#93000a',
    onErrorContainer: '#ffdad6',
    primaryFixed: '#c4e7ff',
    primaryFixedDim: '#7bd0ff',
    onPrimaryFixed: '#001e2c',
    onPrimaryFixedVariant: '#004c69',
    secondaryFixed: '#acedff',
    secondaryFixedDim: '#4cd7f6',
    onSecondaryFixed: '#001f26',
    onSecondaryFixedVariant: '#004e5c',
    tertiaryFixed: '#6bff8f',
    tertiaryFixedDim: '#4ae176',
    onTertiaryFixed: '#002109',
    onTertiaryFixedVariant: '#005321',
    surfaceVariant: '#2c3545',
    // Tactical status tokens
    statusLive: '#22c55e',
    statusAlert: '#f59e0b',
    statusCritical: '#ef4444',
  },
  fonts: {
    SpaceGroteskLight: 'SpaceGrotesk_300Light',
    SpaceGroteskRegular: 'SpaceGrotesk_400Regular',
    SpaceGroteskMedium: 'SpaceGrotesk_500Medium',
    SpaceGroteskSemiBold: 'SpaceGrotesk_600SemiBold',
    SpaceGroteskBold: 'SpaceGrotesk_700Bold',
    InterRegular: 'Inter_400Regular',
    InterMedium: 'Inter_500Medium',
    InterSemiBold: 'Inter_600SemiBold',
    InterBold: 'Inter_700Bold',
    MonoRegular: 'JetBrainsMono_400Regular',
    MonoMedium: 'JetBrainsMono_500Medium',
    MonoSemiBold: 'JetBrainsMono_600SemiBold',
    MonoBold: 'JetBrainsMono_700Bold',
  },
};

/** Typography roles used across SKYTRACK HUD screens. */
export const type = {
  headlineXl: {
    fontFamily: SKY.fonts.SpaceGroteskBold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  headlineXlMobile: {
    fontFamily: SKY.fonts.SpaceGroteskBold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  headlineLgMobile: {
    fontFamily: SKY.fonts.SpaceGroteskSemiBold,
    fontSize: 20,
    lineHeight: 26,
  },
  headlineMd: {
    fontFamily: SKY.fonts.SpaceGroteskSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: SKY.fonts.InterRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: SKY.fonts.InterRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: SKY.fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  metricDisplay: {
    fontFamily: SKY.fonts.MonoBold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.8,
  },
  metricLabel: {
    fontFamily: SKY.fonts.MonoMedium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  telemetry: {
    fontFamily: SKY.fonts.MonoRegular,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  pill: {
    fontFamily: SKY.fonts.MonoSemiBold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.8,
  },
} as const;

/** Layout spacing scale (base-4). */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

/** Corner radii. */
export const radius = {
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
  '2xl': 12,
  full: 9999,
} as const;

/**
 * Legacy template tokens retained so existing starter components
 * (themed-text / themed-view / collapsible / modal) keep working.
 */
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: SKY.colors.surface,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});