import type { Theme, ThemeColor } from './theme-types';

/**
 * Modern theme configuration with strict typing
 */

const createThemeColor = (hex: string, alpha = 1): ThemeColor => ({
  base: hex,
  light: adjustColorLightness(hex, 0.2),
  dark: adjustColorLightness(hex, -0.2),
  alpha,
});

const adjustColorLightness = (hex: string, _amount: number): string => {
  /*
   * Implementation of color adjustment would go here
   * For now, returning the original color
   */
  return hex;
};

export const defaultTheme: Theme = {
  colors: {
    primary: createThemeColor('#9e75f0'),
    secondary: createThemeColor('#8a2be2'),
    accent: createThemeColor('#803bef'),
    background: {
      depth1: 'var(--bolt-elements-bg-depth-1)',
      depth2: 'var(--bolt-elements-bg-depth-2)',
      depth3: 'var(--bolt-elements-bg-depth-3)',
      depth4: 'var(--bolt-elements-bg-depth-4)',
    },
    text: {
      primary: 'var(--bolt-elements-textPrimary)',
      secondary: 'var(--bolt-elements-textSecondary)',
      tertiary: 'var(--bolt-elements-textTertiary)',
    },
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },
  spacing: {
    base: 4,
    scale: 1.5,
  },
  darkMode: false,
};
