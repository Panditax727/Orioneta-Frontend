import { customizationService, GLOBAL_THEME_PRESETS, FONT_PRESETS, BUBBLE_STYLES } from "../../customization/services/customizationService";

const STUDIO_THEMES_KEY = "orioneta.studio.themes";

const DEFAULT_STATE = {
  name: "Tema personalizado",
  colors: {
    accent: "#7c3aed",
    accentSecondary: "#4f46e5",
    background: "#0d0e14",
    incomingBubble: "#1a1b26",
    textPrimary: "#c0caf5",
    textSecondary: "#565f89",
    border: "#1e2030",
  },
  font: {
    family: "Inter, system-ui, sans-serif",
    size: 14,
  },
  bubbles: {
    style: "DEFAULT",
    radius: 0,
    padding: 0,
  },
  animations: {
    level: 3,
    messageAnimation: true,
  },
  version: "1.0",
};

function loadSavedThemes() {
  try {
    const stored = localStorage.getItem(STUDIO_THEMES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveThemes(themes) {
  localStorage.setItem(STUDIO_THEMES_KEY, JSON.stringify(themes));
}

export const studioService = {
  getDefaultState: () => JSON.parse(JSON.stringify(DEFAULT_STATE)),

  loadCurrentSettings: async () => {
    try {
      const userCustomization = await customizationService.getUserCustomization();
      const themePreset = GLOBAL_THEME_PRESETS.find(t => t.id === userCustomization.activeGlobalThemeId) || GLOBAL_THEME_PRESETS[0];

      return {
        name: "Desde configuración actual",
        colors: {
          accent: themePreset.accent,
          accentSecondary: themePreset.accentSecondary,
          background: themePreset.background,
          incomingBubble: themePreset.incoming,
          textPrimary: "#c0caf5",
          textSecondary: "#565f89",
          border: "#1e2030",
        },
        font: {
          family: userCustomization.activeFontId === "mono"
            ? "'JetBrains Mono', monospace"
            : "Inter, system-ui, sans-serif",
          size: 14,
        },
        bubbles: {
          style: "DEFAULT",
          radius: 0,
          padding: 0,
        },
        animations: {
          level: userCustomization.animationLevel ?? 3,
          messageAnimation: true,
        },
      };
    } catch {
      return DEFAULT_STATE;
    }
  },

  saveToCustomization: async (studioState) => {
    const themeId = studioState.name.toLowerCase().replace(/\s+/g, "-");
    const customTheme = {
      id: themeId,
      name: studioState.name,
      accent: studioState.colors.accent,
      accentSecondary: studioState.colors.accentSecondary,
      incoming: studioState.colors.incomingBubble,
      background: studioState.colors.background,
    };

    return customizationService.updateUserCustomization({
      activeGlobalThemeId: themeId,
      customTheme,
      activeFontId: studioState.font.family.includes("mono") ? "mono" : "inter",
      animationLevel: studioState.animations.level,
      compactMode: studioState.bubbles.style === "COMPACT",
    });
  },

  saveTheme: async (studioState) => {
    const themes = loadSavedThemes();
    const existing = themes.findIndex(t => t.name === studioState.name);
    const entry = { ...studioState, savedAt: new Date().toISOString() };

    if (existing >= 0) {
      themes[existing] = entry;
    } else {
      themes.push(entry);
    }

    saveThemes(themes);
    return entry;
  },

  getSavedThemes: async () => loadSavedThemes(),

  deleteSavedTheme: async (themeName) => {
    const themes = loadSavedThemes().filter(t => t.name !== themeName);
    saveThemes(themes);
    return true;
  },

  exportTheme: (studioState) => {
    const blob = new Blob([JSON.stringify(studioState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studioState.name.replace(/\s+/g, "_").toLowerCase()}.orioneta-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importTheme: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.colors || !data.font || !data.bubbles) {
            reject(new Error("El archivo no es un tema válido de Orioneta"));
            return;
          }
          resolve(data);
        } catch {
          reject(new Error("Error al leer el archivo de tema"));
        }
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsText(file);
    });
  },
};
