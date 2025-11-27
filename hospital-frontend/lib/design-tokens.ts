// hospital-frontend/lib/design-tokens.ts
// Professional Healthcare-Finance Design System
// Fixed Asset Trading Platform

export const colors = {
  // Primary - Professional Finance (Deep Indigo)
  primary: {
    50: '#f0f4ff',
    100: '#e6edff',
    200: '#c7d9ff',
    400: '#8ab4ff',
    500: '#1a237e', // Main
    600: '#1a237e',
    700: '#0d1353',
    900: '#0a0d33',
  },
  
  // Secondary - Healthcare (Teal)
  secondary: {
    50: '#e0f2f1',
    100: '#b2dfdb',
    400: '#4db6ac',
    500: '#00695c', // Main
    600: '#00897b',
    700: '#004d40',
  },
  
  // Neutral - Professional Gray
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Status Colors
  success: '#2e7d32',
  success_light: '#4caf50',
  warning: '#ff9800',
  danger: '#d32f2f',
  info: '#1976d2',
  
  // Text
  text: {
    primary: '#1a1a1a',
    secondary: '#424242',
    tertiary: '#757575',
    disabled: '#bdbdbd',
    inverse: '#ffffff',
  },
  
  // Backgrounds
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#eeeeee',
  },
  
  // Borders
  border: {
    light: '#e0e0e0',
    dark: '#bdbdbd',
  },
};

export const typography = {
  // Font Families
  font: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    mono: "'Roboto Mono', monospace",
  },
  
  // Headings
  h1: {
    fontSize: '32px',
    fontWeight: 700,
    lineHeight: '1.2',
  },
  h2: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: '1.3',
  },
  h3: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '1.3',
  },
  h4: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '1.4',
  },
  
  // Body
  body: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.5',
  },
  bodySmall: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '1.5',
  },
  
  // Labels & UI
  label: {
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  caption: {
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.3px',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
};

export const radius = {
  none: '0px',
  sm: '2px',
  md: '4px',
  lg: '6px',
  xl: '8px',
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 4px rgba(0, 0, 0, 0.08)',
  lg: '0 4px 8px rgba(0, 0, 0, 0.1)',
  xl: '0 8px 16px rgba(0, 0, 0, 0.12)',
};

// Roles with their primary colors
export const roleColors: Record<string, string> = {
  patient: colors.primary[500],
  hospital: colors.secondary[500],
  bank: colors.neutral[800],
};

// Status badge styles
export const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: '#fff3e0', text: '#e65100', border: '#ffb74d' },
  approved: { bg: '#e8f5e9', text: '#1b5e20', border: '#81c784' },
  rejected: { bg: '#ffebee', text: '#b71c1c', border: '#e57373' },
  completed: { bg: '#e0f2f1', text: '#004d40', border: '#4db6ac' },
  active: { bg: '#e8f5e9', text: '#1b5e20', border: '#81c784' },
  inactive: { bg: '#f5f5f5', text: '#424242', border: '#bdbdbd' },
  warning: { bg: '#fff3e0', text: '#e65100', border: '#ffb74d' },
  minted: { bg: '#e0f2f1', text: '#004d40', border: '#4db6ac' },
  verified: { bg: '#e8f5e9', text: '#1b5e20', border: '#81c784' },
};
