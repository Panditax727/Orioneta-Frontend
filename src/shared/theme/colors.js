// Sistema de colores basado en el diseño de Orioneta
// Paleta de colores para el tema oscuro

export const colors = {
  // Primary Colors
  primary: {
    main: "#4F46E5",
    light: "#8B5CF6",
    dark: "#3730A3",
    gradient: "linear-gradient(135deg, #7c3aed, #4f46e5)",
  },
  
  // Secondary/Accent Colors
  accent: {
    cyan: "#06B6D4",
    purple: "#8B5CF6",
    pink: "#EC4899",
  },
  
  // Background Colors
  background: {
    main: "#0d0e14",
    secondary: "#13141c",
    tertiary: "#1a1b26",
    quaternary: "#1e2030",
    elevated: "#252838",
  },
  
  // Text Colors
  text: {
    primary: "#ffffff",
    secondary: "#c0caf5",
    tertiary: "#565f89",
    muted: "#2d2f45",
  },
  
  // Status Colors
  status: {
    online: "#22c55e",
    idle: "#f59e0b",
    dnd: "#ef4444",
    offline: "#565f89",
  },
  
  // Functional Colors
  functional: {
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06B6D4",
  },
  
  // Border Colors
  border: {
    default: "#1e2030",
    focus: "#7c3aed",
    hover: "#252838",
  },
  
  // Shadow Colors
  shadow: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
    md: "0 4px 6px rgba(0, 0, 0, 0.3)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.3)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.3)",
    primary: "0 4px 12px rgba(124, 58, 237, 0.3)",
  },
};

// Exportar colores individuales para uso directo
export const {
  primary,
  accent,
  background,
  text,
  status,
  functional,
  border,
  shadow,
} = colors;
