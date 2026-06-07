import { ApiError, apiRequest } from "../../../services/apiClient";
import { ensureCurrentUserProfile } from "../../../services/userService";
import { getSession } from "../../auth/session";

const CUSTOMIZATION_UPDATED_EVENT = "orioneta.customization.updated";
const USER_CUSTOMIZATION_KEY = "orioneta.customization.user";
const CONVERSATION_CUSTOMIZATION_KEY = "orioneta.customization.conversations";

export const GLOBAL_THEME_PRESETS = [
  {
    id: "default",
    name: "Orioneta",
    accent: "#7c3aed",
    accentSecondary: "#4f46e5",
    incoming: "#1a1b26",
    background: "#0d0e14",
  },
  {
    id: "neta-night",
    name: "Neta Night",
    accent: "#06b6d4",
    accentSecondary: "#7c3aed",
    incoming: "#13212b",
    background: "#071018",
  },
  {
    id: "aurora",
    name: "Aurora",
    accent: "#22c55e",
    accentSecondary: "#0891b2",
    incoming: "#122119",
    background: "#07110d",
  },
  {
    id: "ember",
    name: "Ember",
    accent: "#f97316",
    accentSecondary: "#e11d48",
    incoming: "#241713",
    background: "#120b0a",
  },
];

export const CHAT_THEME_PRESETS = [
  { id: "default-chat", name: "Limpio", background: "#0d0e14" },
  { id: "neta-group", name: "Neta Group", background: "linear-gradient(180deg, #0d0e14 0%, #101426 100%)" },
  { id: "aurora-bg", name: "Aurora", background: "linear-gradient(180deg, #07110d 0%, #0d1721 100%)" },
  { id: "ember-bg", name: "Ember", background: "linear-gradient(180deg, #120b0a 0%, #17101c 100%)" },
];

export const FONT_PRESETS = [
  { id: "system", name: "Sistema", family: "system-ui, sans-serif" },
  { id: "inter", name: "Inter", family: "Inter, system-ui, sans-serif" },
  { id: "mono", name: "Mono", family: "'JetBrains Mono', 'Fira Code', monospace" },
];

export const BUBBLE_STYLES = [
  { id: "DEFAULT", name: "Default" },
  { id: "COMPACT", name: "Compacto" },
  { id: "ROUNDED", name: "Redondo" },
  { id: "MINIMAL", name: "Minimal" },
];

const FALLBACK_TEMPLATES = [
  {
    id: "neta-night",
    authorUserId: null,
    name: "Neta Night",
    description: "Tema oscuro con acento cyan.",
    type: "GLOBAL_THEME",
    status: "APPROVED",
    previewImageUrl: "",
    fileUrl: "local://neta-night",
    version: "1.0.0",
    downloads: 128,
    ratingAverage: 4.8,
  },
  {
    id: "aurora-bg",
    authorUserId: null,
    name: "Aurora Chat",
    description: "Fondo verde-azul para conversaciones.",
    type: "BACKGROUND",
    status: "APPROVED",
    previewImageUrl: "",
    fileUrl: "local://aurora-bg",
    version: "1.0.0",
    downloads: 87,
    ratingAverage: 4.6,
  },
  {
    id: "rounded-bubbles",
    authorUserId: null,
    name: "Burbujas Redondas",
    description: "Burbujas suaves para chats largos.",
    type: "BUBBLE_STYLE",
    status: "APPROVED",
    previewImageUrl: "",
    fileUrl: "local://rounded-bubbles",
    version: "0.3.0",
    downloads: 41,
    ratingAverage: 4.3,
  },
];

function notifyCustomizationUpdated() {
  window.dispatchEvent(new Event(CUSTOMIZATION_UPDATED_EVENT));
}

function userStorageKey(userId) {
  return `${USER_CUSTOMIZATION_KEY}.${userId}`;
}

function conversationStorageKey(userId, conversationId) {
  return `${CONVERSATION_CUSTOMIZATION_KEY}.${userId}.${conversationId}`;
}

function safeRead(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function defaultUserCustomization(userId) {
  return {
    id: null,
    userId,
    activeGlobalThemeId: "default",
    activeFontId: "system",
    animationLevel: 3,
    compactMode: false,
    localOnly: true,
  };
}

function defaultConversationCustomization(userId, conversationId) {
  return {
    id: null,
    conversationId,
    userId,
    activeChatThemeId: "default-chat",
    activeBackgroundId: "default-chat",
    bubbleStyle: "DEFAULT",
    fontSize: 14,
    localOnly: true,
  };
}

function normalizeUserCustomization(customization, userId) {
  return {
    ...defaultUserCustomization(userId),
    ...customization,
    userId,
    animationLevel: Number(customization?.animationLevel ?? 3),
    compactMode: Boolean(customization?.compactMode),
  };
}

function normalizeConversationCustomization(customization, userId, conversationId) {
  return {
    ...defaultConversationCustomization(userId, conversationId),
    ...customization,
    userId,
    conversationId,
    fontSize: Number(customization?.fontSize ?? 14),
    bubbleStyle: customization?.bubbleStyle || "DEFAULT",
  };
}

async function getCurrentProfile() {
  try {
    return await ensureCurrentUserProfile();
  } catch (error) {
    const session = getSession();

    if (error instanceof ApiError && error.status === 0 && session) {
      return {
        userID: session.profileUserId || session.userId || session.email,
        email: session.email,
        localOnly: true,
      };
    }

    throw error;
  }
}

async function withApiFallback(apiAction, fallbackAction) {
  try {
    return await apiAction();
  } catch (error) {
    if (
      error instanceof ApiError
      && error.status >= 400
      && error.status < 500
      && error.status !== 404
    ) {
      throw error;
    }

    return fallbackAction(error);
  }
}

function normalizeTemplateName(template) {
  return `${template?.name || ""} ${template?.description || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolveThemeIdFromTemplate(template) {
  const name = normalizeTemplateName(template);

  if (name.includes("neta")) return "neta-night";
  if (name.includes("aurora")) return "aurora";
  if (name.includes("ember")) return "ember";

  return "default";
}

function resolveBackgroundIdFromTemplate(template) {
  const name = normalizeTemplateName(template);

  if (name.includes("aurora")) return "aurora-bg";
  if (name.includes("ember")) return "ember-bg";
  if (name.includes("neta")) return "neta-group";

  return "default-chat";
}

function resolveFontIdFromTemplate(template) {
  const name = normalizeTemplateName(template);

  if (name.includes("mono") || name.includes("code")) return "mono";
  if (name.includes("inter")) return "inter";

  return "system";
}

function resolveBubbleStyleFromTemplate(template) {
  const name = normalizeTemplateName(template);

  if (name.includes("redond") || name.includes("round")) return "ROUNDED";
  if (name.includes("compact")) return "COMPACT";
  if (name.includes("minimal")) return "MINIMAL";

  return "DEFAULT";
}

export function subscribeToCustomizationChanges(callback) {
  window.addEventListener(CUSTOMIZATION_UPDATED_EVENT, callback);
  return () => window.removeEventListener(CUSTOMIZATION_UPDATED_EVENT, callback);
}

export function getThemePreset(themeId) {
  return GLOBAL_THEME_PRESETS.find((theme) => theme.id === themeId) || GLOBAL_THEME_PRESETS[0];
}

export function getChatThemePreset(themeId) {
  return CHAT_THEME_PRESETS.find((theme) => theme.id === themeId) || CHAT_THEME_PRESETS[0];
}

export function getFontPreset(fontId) {
  return FONT_PRESETS.find((font) => font.id === fontId) || FONT_PRESETS[0];
}

export function getCustomizationVisuals(userCustomization, conversationCustomization) {
  const globalTheme = getThemePreset(userCustomization?.activeGlobalThemeId);
  const chatTheme = getChatThemePreset(
    conversationCustomization?.activeBackgroundId
      || conversationCustomization?.activeChatThemeId,
  );
  const font = getFontPreset(userCustomization?.activeFontId);

  return {
    accent: globalTheme.accent,
    accentGradient: `linear-gradient(135deg, ${globalTheme.accent}, ${globalTheme.accentSecondary})`,
    incomingBubble: globalTheme.incoming,
    chatBackground: chatTheme.background || globalTheme.background,
    fontFamily: font.family,
  };
}

export const customizationService = {
  getUserCustomization: async () => {
    const profile = await getCurrentProfile();
    const fallback = () => normalizeUserCustomization(
      safeRead(userStorageKey(profile.userID), defaultUserCustomization(profile.userID)),
      profile.userID,
    );

    if (profile.localOnly) {
      return fallback();
    }

    return withApiFallback(
      async () => normalizeUserCustomization(
        await apiRequest(`/api/customizations/users/${profile.userID}`),
        profile.userID,
      ),
      fallback,
    );
  },

  updateUserCustomization: async (updates) => {
    const profile = await getCurrentProfile();
    const current = await customizationService.getUserCustomization();
    const payload = normalizeUserCustomization({ ...current, ...updates }, profile.userID);
    const fallback = () => {
      safeWrite(userStorageKey(profile.userID), payload);
      return { ...payload, localOnly: true };
    };

    const saved = profile.localOnly
      ? fallback()
      : await withApiFallback(
        async () => normalizeUserCustomization(
          await apiRequest(`/api/customizations/users/${profile.userID}`, {
            method: "PUT",
            body: payload,
          }),
          profile.userID,
        ),
        fallback,
      );

    notifyCustomizationUpdated();
    return saved;
  },

  getConversationCustomization: async (conversationId) => {
    const profile = await getCurrentProfile();

    if (!conversationId) {
      return defaultConversationCustomization(profile.userID, null);
    }

    const fallback = () => normalizeConversationCustomization(
      safeRead(
        conversationStorageKey(profile.userID, conversationId),
        defaultConversationCustomization(profile.userID, conversationId),
      ),
      profile.userID,
      conversationId,
    );

    if (profile.localOnly) {
      return fallback();
    }

    return withApiFallback(
      async () => normalizeConversationCustomization(
        await apiRequest(`/api/customizations/conversations/${conversationId}/users/${profile.userID}`),
        profile.userID,
        conversationId,
      ),
      fallback,
    );
  },

  updateConversationCustomization: async (conversationId, updates) => {
    const profile = await getCurrentProfile();
    const current = await customizationService.getConversationCustomization(conversationId);
    const payload = normalizeConversationCustomization(
      { ...current, ...updates },
      profile.userID,
      conversationId,
    );
    const fallback = () => {
      safeWrite(conversationStorageKey(profile.userID, conversationId), payload);
      return { ...payload, localOnly: true };
    };

    const saved = profile.localOnly
      ? fallback()
      : await withApiFallback(
        async () => normalizeConversationCustomization(
          await apiRequest(`/api/customizations/conversations/${conversationId}/users/${profile.userID}`, {
            method: "PUT",
            body: payload,
          }),
          profile.userID,
          conversationId,
        ),
        fallback,
      );

    notifyCustomizationUpdated();
    return saved;
  },

  getFeaturedTemplates: async () => withApiFallback(
    () => apiRequest("/api/neta-market/templates/featured"),
    () => FALLBACK_TEMPLATES,
  ),

  searchTemplates: async ({ query = "", type = "" } = {}) => {
    const params = new URLSearchParams({ status: "APPROVED" });

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (type) {
      params.set("type", type);
    }

    return withApiFallback(
      () => apiRequest(`/api/neta-market/templates?${params.toString()}`),
      () => FALLBACK_TEMPLATES.filter((template) => {
        const matchesType = !type || template.type === type;
        const matchesQuery = !query.trim()
          || `${template.name} ${template.description}`.toLowerCase().includes(query.trim().toLowerCase());

        return matchesType && matchesQuery;
      }),
    );
  },

  downloadTemplate: async (templateId) => withApiFallback(
    () => apiRequest(`/api/neta-market/templates/${templateId}/download`, { method: "POST" }),
    () => FALLBACK_TEMPLATES.find((template) => template.id === templateId) || null,
  ),

  applyTemplate: async (template, conversationId = null) => {
    await customizationService.downloadTemplate(template.id);

    if (template.type === "GLOBAL_THEME") {
      return customizationService.updateUserCustomization({
        activeGlobalThemeId: resolveThemeIdFromTemplate(template),
      });
    }

    if (template.type === "FONT") {
      return customizationService.updateUserCustomization({
        activeFontId: resolveFontIdFromTemplate(template),
      });
    }

    if (!conversationId) {
      throw new ApiError("Selecciona un chat para aplicar este template", 400);
    }

    if (template.type === "BACKGROUND") {
      return customizationService.updateConversationCustomization(conversationId, {
        activeBackgroundId: resolveBackgroundIdFromTemplate(template),
      });
    }

    if (template.type === "BUBBLE_STYLE") {
      return customizationService.updateConversationCustomization(conversationId, {
        bubbleStyle: resolveBubbleStyleFromTemplate(template),
      });
    }

    return customizationService.updateConversationCustomization(conversationId, {
      activeChatThemeId: resolveBackgroundIdFromTemplate(template),
    });
  },
};
