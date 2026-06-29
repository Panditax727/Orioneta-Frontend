import { apiRequest } from "../../../services/apiClient";

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
    return apiRequest(`${NETA_MARKET_BASE}/templates`, {
      method: "POST",
      body: templateData,
    });
  },

  /**
   * Download a template by ID
   */
  async downloadTemplate(templateId) {
    return apiRequest(`${NETA_MARKET_BASE}/templates/${templateId}/download`, {
      method: "POST",
      body: { id: templateId },
    });
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
    // The fileUrl should contain the theme data
    // For now, we'll need to fetch the file content
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
