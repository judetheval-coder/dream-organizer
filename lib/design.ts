// Dark Dashboard Design System - Purple/Cyan Gradient
export const colors = {
  // Background layers
  background: '#0a0118',
  backgroundDark: '#050008',
  surface: '#1a0f2e',
  surfaceLight: '#251a3a',
  
  // Primary colors
  purple: '#7c3aed',
  purpleLight: '#9333ea',
  purpleDark: '#5b21b6',
  
  cyan: '#06b6d4',
  cyanLight: '#22d3ee',
  cyanDark: '#0891b2',
  
  // Accent colors
  pink: '#ec4899',
  yellow: '#fbbf24',
  
  // Text
  textPrimary: '#f9fafb',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  
  // UI elements
  border: '#2d1b4e',
  borderLight: '#3d2b5e',
  white: '#ffffff',
  black: '#000000',
};

export const gradients = {
  page: 'linear-gradient(135deg, #0a0118 0%, #1a0f2e 50%, #0a0118 100%)',
  purpleCyan: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
  card: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
  cardHover: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
  button: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
  glow: 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.3) 0%, transparent 70%)',
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
  glow: '0 0 20px rgba(124, 58, 237, 0.4)',
  glowCyan: '0 0 20px rgba(6, 182, 212, 0.4)',
};

export const borders = {
  sm: '1px solid #2d1b4e',
  md: '2px solid #2d1b4e',
  lg: '3px solid #2d1b4e',
};

export const radii = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

export const typography = {
  heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
};

export const theme = {
  colors,
  gradients,
  shadows,
  borders,
  radii,
  typography,
};

export type Theme = typeof theme;
