import { apiRequest, ApiError } from "../../../services/apiClient";
import { customizationService } from "../../customization/services/customizationService";

const MOCK_ITEMS = [
  {
    id: "dark-purple",
    name: "Dark Purple",
    description: "Tema oscuro con acentos púrpura. Diseñado para sesiones largas con estilo elegante.",
    type: "GLOBAL_THEME",
    category: "themes",
    author: "Orioneta Team",
    downloads: 1250,
    ratingAverage: 4.8,
    ratingCount: 342,
    isOfficial: true,
    isInstalled: true,
    preview: { background: "#0d0e14", primary: "#7c3aed", secondary: "#4f46e5", text: "#c0caf5", border: "#1e2030" },
    version: "2.1.0",
    tags: ["oscuro", "púrpura", "elegante"],
    createdAt: "2024-01-15",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    description: "Tema inspirado en el océano profundo. Tonos azules relajantes para tus conversaciones.",
    type: "GLOBAL_THEME",
    category: "themes",
    author: "OceanDev",
    downloads: 890,
    ratingAverage: 4.5,
    ratingCount: 215,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#0a1929", primary: "#2196f3", secondary: "#1976d2", text: "#b3e5fc", border: "#1565c0" },
    version: "1.3.0",
    tags: ["azul", "océano", "relajante"],
    createdAt: "2024-03-20",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    description: "Tema natural con tonos verdes. Trae la naturaleza a tu interfaz.",
    type: "GLOBAL_THEME",
    category: "themes",
    author: "NatureLover",
    downloads: 650,
    ratingAverage: 4.3,
    ratingCount: 178,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#0d1b0d", primary: "#22c55e", secondary: "#16a34a", text: "#bbf7d0", border: "#15803d" },
    version: "1.0.0",
    tags: ["verde", "naturaleza", "oscuro"],
    createdAt: "2024-05-10",
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    description: "Tema cálido con tonos naranja. Perfecto para los amantes del atardecer.",
    type: "GLOBAL_THEME",
    category: "themes",
    author: "SunsetStudio",
    downloads: 420,
    ratingAverage: 4.2,
    ratingCount: 98,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#1a0d0d", primary: "#f97316", secondary: "#ea580c", text: "#fed7aa", border: "#c2410c" },
    version: "1.1.0",
    tags: ["naranja", "cálido", "atardecer"],
    createdAt: "2024-06-01",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Tema futurista con neón. Colores vibrantes para una experiencia electrizante.",
    type: "GLOBAL_THEME",
    category: "themes",
    author: "Orioneta Team",
    downloads: 2100,
    ratingAverage: 4.9,
    ratingCount: 521,
    isOfficial: true,
    isInstalled: false,
    preview: { background: "#0a0a0a", primary: "#ff00ff", secondary: "#00ffff", text: "#ffffff", border: "#ff00ff" },
    version: "3.0.0",
    tags: ["neón", "futurista", "vibrante"],
    createdAt: "2024-02-01",
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    description: "Tema claro minimalista. Limpio, simple y profesional.",
    type: "GLOBAL_THEME",
    category: "themes",
    author: "Minimalist",
    downloads: 780,
    ratingAverage: 4.4,
    ratingCount: 201,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#ffffff", primary: "#6366f1", secondary: "#818cf8", text: "#1f2937", border: "#e5e7eb" },
    version: "1.2.0",
    tags: ["claro", "minimalista", "profesional"],
    createdAt: "2024-04-15",
  },
  {
    id: "aurora-bg",
    name: "Aurora Borealis",
    description: "Fondo animado con auroras boreales. Verde y azul en movimiento.",
    type: "BACKGROUND",
    category: "backgrounds",
    author: "AuroraDev",
    downloads: 1560,
    ratingAverage: 4.7,
    ratingCount: 389,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "linear-gradient(135deg, #07110d, #0d1721)", primary: "#22c55e", secondary: "#0891b2", text: "#bbf7d0", border: "#115e59" },
    version: "2.0.0",
    tags: ["aurora", "animado", "verde"],
    createdAt: "2024-03-01",
  },
  {
    id: "city-night",
    name: "City Night",
    description: "Fondo urbano nocturno con luces de ciudad.",
    type: "BACKGROUND",
    category: "backgrounds",
    author: "CityScape",
    downloads: 920,
    ratingAverage: 4.4,
    ratingCount: 198,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "linear-gradient(180deg, #0f0f23, #1a1a3e)", primary: "#fbbf24", secondary: "#f59e0b", text: "#fef3c7", border: "#78350f" },
    version: "1.1.0",
    tags: ["nocturno", "ciudad", "luces"],
    createdAt: "2024-05-20",
  },
  {
    id: "space-bg",
    name: "Deep Space",
    description: "Fondo espacial con estrellas y nebulosas.",
    type: "BACKGROUND",
    category: "backgrounds",
    author: "Orioneta Team",
    downloads: 3100,
    ratingAverage: 4.9,
    ratingCount: 712,
    isOfficial: true,
    isInstalled: false,
    preview: { background: "radial-gradient(ellipse at center, #0d0221, #000000)", primary: "#a78bfa", secondary: "#7c3aed", text: "#e0e0ff", border: "#4c1d95" },
    version: "1.5.0",
    tags: ["espacio", "estrellas", "nebulosa"],
    createdAt: "2024-01-01",
  },
  {
    id: "rounded-bubbles",
    name: "Burbujas Redondas",
    description: "Burbujas suaves y redondeadas para un look más amigable en tus chats.",
    type: "BUBBLE_STYLE",
    category: "bubbles",
    author: "BubbleMaster",
    downloads: 2340,
    ratingAverage: 4.6,
    ratingCount: 567,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#13141c", primary: "#7c3aed", secondary: "#6d28d9", text: "#c0caf5", border: "#7c3aed" },
    version: "1.0.0",
    tags: ["redondo", "suave", "amigable"],
    createdAt: "2024-02-15",
  },
  {
    id: "compact-bubbles",
    name: "Burbujas Compactas",
    description: "Burbujas más pequeñas y densas para mostrar más mensajes en pantalla.",
    type: "BUBBLE_STYLE",
    category: "bubbles",
    author: "EfficientUI",
    downloads: 890,
    ratingAverage: 4.1,
    ratingCount: 234,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#13141c", primary: "#4f46e5", secondary: "#4338ca", text: "#c0caf5", border: "#4f46e5" },
    version: "1.2.0",
    tags: ["compacto", "denso", "eficiente"],
    createdAt: "2024-04-01",
  },
  {
    id: "minimal-bubbles",
    name: "Burbujas Minimalistas",
    description: "Burbujas sin bordes con un diseño limpio y moderno.",
    type: "BUBBLE_STYLE",
    category: "bubbles",
    author: "Minimalist",
    downloads: 1450,
    ratingAverage: 4.5,
    ratingCount: 412,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#13141c", primary: "#a78bfa", secondary: "#8b5cf6", text: "#c0caf5", border: "transparent" },
    version: "1.0.0",
    tags: ["minimalista", "limpio", "moderno"],
    createdAt: "2024-06-10",
  },
  {
    id: "inter-font",
    name: "Inter",
    description: "Fuente moderna y legible, perfecta para interfaces. Diseñada por Rasmus Andersson.",
    type: "FONT",
    category: "fonts",
    author: "Rasmus Andersson",
    downloads: 5600,
    ratingAverage: 4.8,
    ratingCount: 1203,
    isOfficial: true,
    isInstalled: false,
    preview: { background: "#13141c", primary: "#7c3aed", secondary: "#6d28d9", text: "#c0caf5", border: "#1e2030" },
    version: "4.0.0",
    tags: ["moderno", "legible", "interface"],
    createdAt: "2024-01-01",
  },
  {
    id: "mono-font",
    name: "JetBrains Mono",
    description: "Fuente monospace ideal para desarrolladores y código.",
    type: "FONT",
    category: "fonts",
    author: "JetBrains",
    downloads: 3200,
    ratingAverage: 4.7,
    ratingCount: 876,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#13141c", primary: "#06b6d4", secondary: "#0891b2", text: "#c0caf5", border: "#1e2030" },
    version: "2.3.0",
    tags: ["monospace", "desarrollador", "código"],
    createdAt: "2024-02-20",
  },
  {
    id: "fira-font",
    name: "Fira Code",
    description: "Fuente monospace con ligaduras para programación.",
    type: "FONT",
    category: "fonts",
    author: "Nikita Prokopov",
    downloads: 2800,
    ratingAverage: 4.6,
    ratingCount: 654,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#13141c", primary: "#22c55e", secondary: "#16a34a", text: "#c0caf5", border: "#1e2030" },
    version: "6.2.0",
    tags: ["monospace", "ligaduras", "programación"],
    createdAt: "2024-03-10",
  },
  {
    id: "slide-animation",
    name: "Slide & Fade",
    description: "Animaciones suaves de deslizamiento y desvanecimiento para mensajes.",
    type: "ANIMATION_PACK",
    category: "animations",
    author: "MotionLab",
    downloads: 1870,
    ratingAverage: 4.5,
    ratingCount: 445,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#13141c", primary: "#f97316", secondary: "#ea580c", text: "#c0caf5", border: "#1e2030" },
    version: "1.0.0",
    tags: ["slide", "fade", "suave"],
    createdAt: "2024-04-10",
  },
  {
    id: "bounce-animation",
    name: "Bounce Pack",
    description: "Animaciones divertidas con rebotes para dar vida a tus conversaciones.",
    type: "ANIMATION_PACK",
    category: "animations",
    author: "FunAnimator",
    downloads: 1240,
    ratingAverage: 4.2,
    ratingCount: 312,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#13141c", primary: "#e11d48", secondary: "#be123c", text: "#c0caf5", border: "#1e2030" },
    version: "1.1.0",
    tags: ["bounce", "divertido", "vibrante"],
    createdAt: "2024-05-25",
  },
  {
    id: "subtle-animation",
    name: "Subtle Motion",
    description: "Animaciones elegantes y sutiles que no distraen.",
    type: "ANIMATION_PACK",
    category: "animations",
    author: "Orioneta Team",
    downloads: 2200,
    ratingAverage: 4.7,
    ratingCount: 534,
    isOfficial: true,
    isInstalled: false,
    preview: { background: "#13141c", primary: "#7c3aed", secondary: "#6d28d9", text: "#c0caf5", border: "#1e2030" },
    version: "1.0.0",
    tags: ["sutil", "elegante", "profesional"],
    createdAt: "2024-01-20",
  },
  {
    id: "chime-sound",
    name: "Chime Pack",
    description: "Sonidos de notificación tipo campana, suaves y agradables.",
    type: "SOUND_PACK",
    category: "sounds",
    author: "AudioCraft",
    downloads: 980,
    ratingAverage: 4.3,
    ratingCount: 245,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#13141c", primary: "#06b6d4", secondary: "#0891b2", text: "#c0caf5", border: "#1e2030" },
    version: "1.0.0",
    tags: ["campana", "suave", "notificación"],
    createdAt: "2024-03-15",
  },
  {
    id: "retro-sound",
    name: "Retro Pack",
    description: "Sonidos inspirados en videojuegos clásicos para un toque nostálgico.",
    type: "SOUND_PACK",
    category: "sounds",
    author: "RetroGamer",
    downloads: 760,
    ratingAverage: 4.4,
    ratingCount: 189,
    isOfficial: false,
    isInstalled: false,
    preview: { background: "#13141c", primary: "#22c55e", secondary: "#16a34a", text: "#c0caf5", border: "#1e2030" },
    version: "1.0.0",
    tags: ["retro", "videojuego", "nostálgico"],
    createdAt: "2024-06-05",
  },
];

const INSTALLED_KEY = "orioneta.market.installed";

function getInstalledIds() {
  try {
    const stored = localStorage.getItem(INSTALLED_KEY);
    return stored ? JSON.parse(stored) : ["dark-purple"];
  } catch {
    return ["dark-purple"];
  }
}

function saveInstalledIds(ids) {
  localStorage.setItem(INSTALLED_KEY, JSON.stringify(ids));
}

function enrichItem(item, installedIds) {
  return { ...item, isInstalled: installedIds.includes(item.id) };
}

export const marketService = {
  getItems: async ({ category = "all", query = "", type = "", sort = "popular" } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== "all") params.set("category", category);
    if (query.trim()) params.set("q", query.trim());
    if (type) params.set("type", type);
    if (sort) params.set("sort", sort);
    params.set("status", "APPROVED");

    try {
      const data = await apiRequest(`/api/neta-market/templates?${params.toString()}`);
      const installedIds = getInstalledIds();
      return (Array.isArray(data) ? data : []).map(item => enrichItem(item, installedIds));
    } catch {
      const installedIds = getInstalledIds();
      let results = MOCK_ITEMS;

      if (category && category !== "all") {
        results = results.filter(item => item.category === category);
      }
      if (type) {
        results = results.filter(item => item.type === type);
      }
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        results = results.filter(item =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some(t => t.includes(q))
        );
      }

      switch (sort) {
        case "popular":
          results = [...results].sort((a, b) => b.downloads - a.downloads);
          break;
        case "rating":
          results = [...results].sort((a, b) => b.ratingAverage - a.ratingAverage);
          break;
        case "newest":
          results = [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case "downloads":
          results = [...results].sort((a, b) => b.downloads - a.downloads);
          break;
        default:
          break;
      }

      return results.map(item => enrichItem(item, installedIds));
    }
  },

  getFeatured: async () => {
    try {
      const data = await apiRequest("/api/neta-market/templates/featured");
      const installedIds = getInstalledIds();
      return (Array.isArray(data) ? data : []).map(item => enrichItem(item, installedIds));
    } catch {
      const installedIds = getInstalledIds();
      return MOCK_ITEMS
        .filter(item => item.ratingAverage >= 4.5)
        .slice(0, 6)
        .map(item => enrichItem(item, installedIds));
    }
  },

  getItemById: async (itemId) => {
    const installedIds = getInstalledIds();
    const item = MOCK_ITEMS.find(i => i.id === itemId);
    return item ? enrichItem(item, installedIds) : null;
  },

  installItem: async (itemId) => {
    try {
      await apiRequest(`/api/neta-market/templates/${itemId}/download`, { method: "POST" });
    } catch {
      // proceed with local install
    }

    const installedIds = getInstalledIds();
    if (!installedIds.includes(itemId)) {
      installedIds.push(itemId);
      saveInstalledIds(installedIds);
    }

    const item = MOCK_ITEMS.find(i => i.id === itemId);
    if (item) {
      item.downloads = (item.downloads || 0) + 1;
    }

    return true;
  },

  uninstallItem: async (itemId) => {
    const installedIds = getInstalledIds().filter(id => id !== itemId);
    saveInstalledIds(installedIds);
    return true;
  },

  rateItem: async (itemId, rating) => {
    const item = MOCK_ITEMS.find(i => i.id === itemId);
    if (item) {
      const oldTotal = item.ratingAverage * item.ratingCount;
      item.ratingCount = (item.ratingCount || 0) + 1;
      item.ratingAverage = Math.round(((oldTotal + rating) / item.ratingCount) * 10) / 10;
    }
    return true;
  },

  applyToChat: async (itemId) => {
    const item = MOCK_ITEMS.find(i => i.id === itemId);
    if (!item) {
      throw new Error("Item no encontrado");
    }

    await customizationService.downloadTemplate(itemId);

    if (item.type === "GLOBAL_THEME") {
      return customizationService.updateUserCustomization({
        activeGlobalThemeId: item.id === "dark-purple" ? "default" :
                             item.id === "ocean-blue" ? "neta-night" :
                             item.id === "cyberpunk" ? "ember" : "default",
      });
    }

    if (item.type === "FONT") {
      return customizationService.updateUserCustomization({
        activeFontId: item.id === "mono-font" ? "mono" :
                      item.id === "inter-font" ? "inter" : "system",
      });
    }

    if (item.type === "BUBBLE_STYLE") {
      const bubbleMap = {
        "rounded-bubbles": "ROUNDED",
        "compact-bubbles": "COMPACT",
        "minimal-bubbles": "MINIMAL",
      };
      return {
        bubbleStyle: bubbleMap[itemId] || "DEFAULT",
        applied: true,
      };
    }

    if (item.type === "BACKGROUND") {
      const bgMap = {
        "aurora-bg": "aurora-bg",
        "city-night": "ember-bg",
        "space-bg": "neta-group",
      };
      return {
        activeBackgroundId: bgMap[itemId] || "default-chat",
        applied: true,
      };
    }

    return { applied: true };
  },

  getCategories: async () => [
    { id: "all", label: "Todo", icon: "grid" },
    { id: "themes", label: "Temas", icon: "palette" },
    { id: "backgrounds", label: "Fondos", icon: "image" },
    { id: "bubbles", label: "Burbujas", icon: "message-circle" },
    { id: "fonts", label: "Fuentes", icon: "type" },
    { id: "animations", label: "Animaciones", icon: "zap" },
    { id: "sounds", label: "Sonidos", icon: "music" },
  ],
};
