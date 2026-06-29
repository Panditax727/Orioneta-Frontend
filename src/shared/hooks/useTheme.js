import { createContext, useContext } from "react";
import { theme } from "../theme";

// Contexto del tema
const ThemeContext = createContext({
  theme,
  toggleTheme: () => {},
});

// Hook para usar el tema
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Si no hay provider, retornar el tema por defecto
    return {
      theme,
      toggleTheme: () => {},
    };
  }
  return context;
}

// Provider del tema activo para la personalizacion visual.
export function ThemeProvider({ children, customTheme }) {
  const currentTheme = customTheme || theme;
  
  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        toggleTheme: () => {},
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
