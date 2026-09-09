import { Platform } from 'react-native';

export const Colors = {
  primary: '#3122C3',
  primaryDark: '#221C6E',
  primaryLight: '#EEF0FD',
  primaryHover: '#2719A5',

  // Decorative Accent Dots (from Illustration)
  accents: {
    coral: '#FF3B62',
    teal: '#1ED2B2',
    amber: '#FFAB1D',
    skyBlue: '#0084F8',
    purpleDot: '#3A2AA6',
  },

  // Backgrounds
  background: '#FFFFFF',
  screenLight: '#F8F9FD',
  headerBackground: '#3122C3',
  cardBackground: '#FFFFFF',

  // Inputs
  inputBackground: '#FFFFFF',
  inputBorder: '#E2E5EC',
  inputBorderFocus: '#3122C3',
  inputBorderError: '#EF4444',
  inputPlaceholder: '#A0A5B1',
  inputText: '#1F2430',

  // Text
  textTitle: '#221C6E',
  textHeaderDark: '#1F2430',
  textSubtitle: '#6C727F',
  textMuted: '#9EA4B3',
  textLink: '#3122C3',
  textWhite: '#FFFFFF',

  // Buttons
  buttonDisabledBg: '#F0F1F8',
  buttonDisabledText: '#CACDD8',
  buttonActiveBg: '#3122C3',
  buttonActiveText: '#FFFFFF',

  // Status & Feedback
  success: '#10B981',
  successLight: '#ECFDF5',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  info: '#3B82F6',

  // Checkbox
  checkboxBorder: '#C4C8D4',
  checkboxActive: '#3122C3',
} as const;

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  input: 16,
  button: 16,
  card: 22,
  sheet: 36,
  full: 9999,
} as const;

export const Typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'system-ui',
  }),
  sizes: {
    xs: 12,
    sm: 13,
    md: 14,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    display: 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  button: {
    shadowColor: '#3122C3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
} as const;
