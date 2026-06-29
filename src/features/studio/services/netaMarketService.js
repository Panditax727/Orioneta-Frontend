import { getSession } from "../../auth/session";
import { ApiError, apiRequest, resolveApiUrl } from "../../../services/apiClient";

const NETA_MARKET_BASE = "/api/neta-market";

export const netaMarketService = {
  /**
   * Get all templates
   */
  async getTemplates() {
    return apiRequest(`${NETA_MARKET_BASE}/templates`, {
      method: "GET",
    });
  },

  /**
   * Get featured templates
   */
  async getFeaturedTemplates() {
    return apiRequest(`${NETA_MARKET_BASE}/templates/featured`, {
      method: "GET",
    });
  },

  /**
   * Create a new template
   */
  async createTemplate(templateData) {
    if (templateData instanceof FormData) {
      return sendMultipartTemplate(templateData);
    }

    return apiRequest(`${NETA_MARKET_BASE}/templates`, {
      method: "POST",
      body: templateData,
    });
  },

  /**
   * Publish a Studio theme as a real file upload.
   */
  async createTemplateFromStudio(studioState, authorUserId) {
    const fileName = `${slugify(studioState.name || "tema-orioneta")}.orioneta-theme.json`;
    const themeFile = new Blob([JSON.stringify(studioState, null, 2)], {
      type: "application/json",
    });
    const formData = new FormData();

    formData.append("authorUserId", authorUserId);
    formData.append("name", studioState.name || "Tema Orioneta");
    formData.append(
      "description",
      `Tema visual personalizado: ${studioState.name || "Tema Orioneta"}`,
    );
    formData.append("type", "GLOBAL_THEME");
    formData.append("version", studioState.version || "1.0.0");
    formData.append("file", themeFile, fileName);

    return sendMultipartTemplate(formData);
  },

  /**
   * Download a template by ID
   */
  async downloadTemplate(templateId) {
    const template = await apiRequest(`${NETA_MARKET_BASE}/templates/${templateId}/download`, {
      method: "POST",
      body: { id: templateId },
    });

    const themeFile = await fetchTemplateFile(template.fileUrl);

    if (!themeFile) {
      return template;
    }

    return {
      ...themeFile,
      marketTemplate: template,
      name: themeFile.name || template.name,
      description: themeFile.description || template.description,
      version: themeFile.version || template.version,
    };
  },

  /**
   * Convert studio state to template format for backend
   */
  studioStateToTemplate(studioState, authorUserId) {
    return {
      authorUserId,
      name: studioState.name,
      description: `Tema visual personalizado: ${studioState.name}`,
      type: "GLOBAL_THEME",
      previewImageUrl: "",
      fileUrl: JSON.stringify(studioState), // serializa el tema como "archivo"
      version: studioState.version || "1.0",
    };
  },

  /**
   * Convert backend template to studio state
   */
  templateToStudioState(template) {
    if (template?.colors && template?.font && template?.bubbles) {
      return normalizeStudioState(template);
    }

    return {
      name: template.name,
      description: template.description,
      version: template.version,
      // Colors and other settings would come from the downloaded file
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
    };
  },
};

async function fetchTemplateFile(fileUrl) {
  if (!fileUrl || fileUrl.startsWith("local://")) {
    return null;
  }

  const session = getSession();
  const headers = {
    Accept: "application/json",
  };

  if (session?.accessToken) {
    headers.Authorization = `${session.tokenType || "Bearer"} ${session.accessToken}`;
  }

  let response;

  try {
    response = await fetch(resolveApiUrl(fileUrl), { headers });
  } catch (error) {
    throw new ApiError("No pudimos descargar el archivo del tema", 0, error);
  }

  if (!response.ok) {
    throw new ApiError("No se pudo leer el archivo del tema", response.status);
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError("El archivo descargado no es un tema valido", 422, text);
  }
}

function normalizeStudioState(template) {
  return {
    name: template.name || "Tema Orioneta",
    description: template.description || "",
    version: template.version || "1.0.0",
    colors: {
      accent: template.colors?.accent || "#7c3aed",
      accentSecondary: template.colors?.accentSecondary || "#4f46e5",
      background: template.colors?.background || "#0d0e14",
      incomingBubble: template.colors?.incomingBubble || "#1a1b26",
      textPrimary: template.colors?.textPrimary || "#c0caf5",
      textSecondary: template.colors?.textSecondary || "#565f89",
      border: template.colors?.border || "#1e2030",
    },
    font: {
      family: template.font?.family || "Inter, system-ui, sans-serif",
      size: Number(template.font?.size || 14),
    },
    bubbles: {
      style: template.bubbles?.style || "DEFAULT",
      radius: Number(template.bubbles?.radius || 0),
      padding: Number(template.bubbles?.padding || 0),
    },
    animations: {
      level: Number(template.animations?.level || 3),
      messageAnimation: template.animations?.messageAnimation !== false,
    },
  };
}

async function sendMultipartTemplate(formData) {
  const session = getSession();
  const headers = {};

  if (session?.accessToken) {
    headers.Authorization = `${session.tokenType || "Bearer"} ${session.accessToken}`;
  }

  let response;

  try {
    response = await fetch(resolveApiUrl(`${NETA_MARKET_BASE}/templates`), {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (error) {
    throw new ApiError("No pudimos conectar con Neta Market", 0, error);
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.message || data.error || "No se pudo publicar el tema"
        : data || "No se pudo publicar el tema";

    throw new ApiError(message, response.status, data);
  }

  return data;
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "tema-orioneta";
}
