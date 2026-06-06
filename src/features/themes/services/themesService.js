// Servicio para manejar temas y personalización de interfaz
// Por ahora usa datos mockeados, luego se conectará con el backend

const MOCK_THEMES = [
  {
    id: 1,
    name: "Dark Purple",
    description: "Tema oscuro con acentos púrpura",
    preview: {
      background: "#0d0e14",
      primary: "#7c3aed",
      secondary: "#4f46e5",
      text: "#c0caf5",
      border: "#1e2030",
    },
    author: "Orioneta Team",
    downloads: 1250,
    rating: 4.8,
    isOfficial: true,
    isInstalled: true,
  },
  {
    id: 2,
    name: "Ocean Blue",
    description: "Tema inspirado en el océano",
    preview: {
      background: "#0a1929",
      primary: "#2196f3",
      secondary: "#1976d2",
      text: "#b3e5fc",
      border: "#1565c0",
    },
    author: "Community",
    downloads: 890,
    rating: 4.5,
    isOfficial: false,
    isInstalled: false,
  },
  {
    id: 3,
    name: "Forest Green",
    description: "Tema natural con tonos verdes",
    preview: {
      background: "#0d1b0d",
      primary: "#22c55e",
      secondary: "#16a34a",
      text: "#bbf7d0",
      border: "#15803d",
    },
    author: "Community",
    downloads: 650,
    rating: 4.3,
    isOfficial: false,
    isInstalled: false,
  },
  {
    id: 4,
    name: "Sunset Orange",
    description: "Tema cálido con tonos naranja",
    preview: {
      background: "#1a0d0d",
      primary: "#f97316",
      secondary: "#ea580c",
      text: "#fed7aa",
      border: "#c2410c",
    },
    author: "Community",
    downloads: 420,
    rating: 4.2,
    isOfficial: false,
    isInstalled: false,
  },
  {
    id: 5,
    name: "Cyberpunk",
    description: "Tema futurista con neón",
    preview: {
      background: "#0a0a0a",
      primary: "#ff00ff",
      secondary: "#00ffff",
      text: "#ffffff",
      border: "#ff00ff",
    },
    author: "Orioneta Team",
    downloads: 2100,
    rating: 4.9,
    isOfficial: true,
    isInstalled: false,
  },
  {
    id: 6,
    name: "Minimal Light",
    description: "Tema claro minimalista",
    preview: {
      background: "#ffffff",
      primary: "#6366f1",
      secondary: "#818cf8",
      text: "#1f2937",
      border: "#e5e7eb",
    },
    author: "Community",
    downloads: 780,
    rating: 4.4,
    isOfficial: false,
    isInstalled: false,
  },
];

export const themesService = {
  // Obtener todos los temas disponibles
  getAllThemes: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_THEMES;
  },

  // Obtener temas oficiales
  getOfficialThemes: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_THEMES.filter(theme => theme.isOfficial);
  },

  // Obtener temas de la comunidad
  getCommunityThemes: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_THEMES.filter(theme => !theme.isOfficial);
  },

  // Obtener tema instalado
  getInstalledTheme: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_THEMES.find(theme => theme.isInstalled) || MOCK_THEMES[0];
  },

  // Instalar tema
  installTheme: async (themeId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const themeIndex = MOCK_THEMES.findIndex(t => t.id === themeId);
    if (themeIndex !== -1) {
      MOCK_THEMES.forEach(t => t.isInstalled = false);
      MOCK_THEMES[themeIndex].isInstalled = true;
      MOCK_THEMES[themeIndex].downloads++;
    }
    return MOCK_THEMES[themeIndex];
  },

  // Desinstalar tema
  uninstallTheme: async (themeId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const themeIndex = MOCK_THEMES.findIndex(t => t.id === themeId);
    if (themeIndex !== -1) {
      MOCK_THEMES[themeIndex].isInstalled = false;
    }
    return true;
  },

  // Buscar temas
  searchThemes: async (query) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (!query) return MOCK_THEMES;
    return MOCK_THEMES.filter(theme =>
      theme.name.toLowerCase().includes(query.toLowerCase()) ||
      theme.description.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Obtener tema por ID
  getThemeById: async (themeId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_THEMES.find(theme => theme.id === themeId);
  },

  // Calificar tema
  rateTheme: async (themeId, rating) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const themeIndex = MOCK_THEMES.findIndex(t => t.id === themeId);
    if (themeIndex !== -1) {
      // Simulación de cálculo de rating
      const currentRating = MOCK_THEMES[themeIndex].rating;
      const newRating = (currentRating + rating) / 2;
      MOCK_THEMES[themeIndex].rating = Math.round(newRating * 10) / 10;
    }
    return MOCK_THEMES[themeIndex];
  },
};
