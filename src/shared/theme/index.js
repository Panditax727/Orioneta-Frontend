// Sistema de tema unificado para Orioneta
// Exporta todos los aspectos del tema

export { colors, primary, accent, background, text, status, functional, border, shadow } from "./colors";
export { typography, fontFamily, fontSize, fontWeight, lineHeight } from "./typography";
export { spacing, borderRadius, breakpoints } from "./spacing";

// Tema completo
export const theme = {
  colors: {
    primary: "#4F46E5",
    primaryLight: "#8B5CF6",
    primaryDark: "#3730A3",
    accent: "#06B6D4",
    background: {
      main: "#0d0e14",
      secondary: "#13141c",
      tertiary: "#1a1b26",
      quaternary: "#1e2030",
      elevated: "#252838",
    },
    text: {
      primary: "#ffffff",
      secondary: "#c0caf5",
      tertiary: "#565f89",
      muted: "#2d2f45",
    },
    status: {
      online: "#22c55e",
      idle: "#f59e0b",
      dnd: "#ef4444",
      offline: "#565f89",
    },
    functional: {
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#06B6D4",
    },
    border: {
      default: "#1e2030",
      focus: "#7c3aed",
      hover: "#252838",
    },
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    fontSize: {
      xs: 11,
      sm: 12,
      base: 13,
      md: 14,
      lg: 15,
      xl: 16,
      "2xl": 18,
      "3xl": 20,
      "4xl": 24,
      "5xl": 32,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadow: {
    primary: "0 4px 12px rgba(124, 58, 237, 0.3)",
    secondary: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};
