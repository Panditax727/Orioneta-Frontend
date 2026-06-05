// Sistema de tipografía basado en el diseño de Orioneta
// Fuente principal: Inter

export const typography = {
  fontFamily: {
    default: "Inter, system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  
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
  
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const { fontFamily, fontSize, fontWeight, lineHeight } = typography;
