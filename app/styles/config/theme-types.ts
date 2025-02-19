/**
 * Type definitions for the modern theme system
 */

export interface ThemeColor {
  base: string;
  light: string;
  dark: string;
  alpha: number;
}

export interface ThemeColors {
  primary: ThemeColor;
  secondary: ThemeColor;
  accent: ThemeColor;
  background: {
    depth1: string;
    depth2: string;
    depth3: string;
    depth4: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

export interface ThemeBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface ThemeSpacing {
  base: number;
  scale: number;
}

export interface Theme {
  colors: ThemeColors;
  breakpoints: ThemeBreakpoints;
  spacing: ThemeSpacing;
  darkMode: boolean;
}
