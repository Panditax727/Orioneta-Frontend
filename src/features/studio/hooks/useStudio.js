import { useState, useEffect, useCallback, useRef } from "react";
import { studioService } from "../services/studioService";
import { netaMarketService } from "../services/netaMarketService";
import { ensureCurrentUserProfile } from "../../../services/userService";

export function useStudio() {
  const [state, setState] = useState(() => studioService.getDefaultState());
  const [savedThemes, setSavedThemes] = useState([]);
  const [marketTemplates, setMarketTemplates] = useState([]);
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [current, themes, market, featured] = await Promise.all([
          studioService.loadCurrentSettings(),
          studioService.getSavedThemes(),
          netaMarketService.getTemplates().catch(() => []),
          netaMarketService.getFeaturedTemplates().catch(() => []),
        ]);
        setState(current);
        setSavedThemes(themes);
        setMarketTemplates(market);
        setFeaturedTemplates(featured);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, []);

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const updateColors = useCallback((colors) => {
    setState(prev => ({ ...prev, colors: { ...prev.colors, ...colors } }));
  }, []);

  const updateFont = useCallback((font) => {
    setState(prev => ({ ...prev, font: { ...prev.font, ...font } }));
  }, []);

  const updateBubbles = useCallback((bubbles) => {
    setState(prev => ({ ...prev, bubbles: { ...prev.bubbles, ...bubbles } }));
  }, []);

  const updateAnimations = useCallback((animations) => {
    setState(prev => ({ ...prev, animations: { ...prev.animations, ...animations } }));
  }, []);

  const updateName = useCallback((name) => {
    setState(prev => ({ ...prev, name }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      await Promise.all([
        studioService.saveToCustomization(state),
        studioService.saveTheme(state),
      ]);
      const themes = await studioService.getSavedThemes();
      setSavedThemes(themes);
      showMessage("success", "Tema guardado correctamente");
    } catch (err) {
      showMessage("error", err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [state, showMessage]);

  const handleExport = useCallback(() => {
    studioService.exportTheme(state);
    showMessage("success", "Tema exportado");
  }, [state, showMessage]);

  const handleImport = useCallback(async (file) => {
    try {
      const imported = await studioService.importTheme(file);
      setState(imported);
      showMessage("success", `Tema "${imported.name || "importado"}" cargado`);
    } catch (err) {
      showMessage("error", err.message);
    }
  }, [showMessage]);

  const handleLoadTheme = useCallback(async (theme) => {
    setState(theme);
    showMessage("success", `Tema "${theme.name}" cargado`);
  }, [showMessage]);

  const handleDeleteTheme = useCallback(async (themeName) => {
    try {
      await studioService.deleteSavedTheme(themeName);
      const themes = await studioService.getSavedThemes();
      setSavedThemes(themes);
      showMessage("success", "Tema eliminado");
    } catch (err) {
      showMessage("error", err.message);
    }
  }, [showMessage]);

  const handleReset = useCallback(() => {
    setState(studioService.getDefaultState());
    showMessage("success", "Tema restablecido a valores por defecto");
  }, [showMessage]);

  const handlePublishToMarket = useCallback(async () => {
    try {
      setPublishing(true);
      const profile = await ensureCurrentUserProfile();
      const userId = profile?.id || profile?.userId || profile?.userID;

      if (!userId) {
        showMessage("error", "No se pudo obtener el ID de usuario");
        return;
      }

      const templateData = netaMarketService.studioStateToTemplate(state, userId);
      const created = await netaMarketService.createTemplate(templateData);

      // Refresh market templates
      const [market, featured] = await Promise.all([
        netaMarketService.getTemplates(),
        netaMarketService.getFeaturedTemplates(),
      ]);
      setMarketTemplates(market);
      setFeaturedTemplates(featured);

      showMessage("success", `Tema "${state.name}" publicado en Neta Market`);
    } catch (err) {
      showMessage("error", err.message || "Error al publicar tema");
    } finally {
      setPublishing(false);
    }
  }, [state, showMessage]);

  const handleDownloadFromMarket = useCallback(async (templateId) => {
    try {
      const templateData = await netaMarketService.downloadTemplate(templateId);
      const studioState = netaMarketService.templateToStudioState(templateData);
      setState(studioState);
      showMessage("success", "Plantilla descargada y aplicada");
    } catch (err) {
      showMessage("error", err.message || "Error al descargar plantilla");
    }
  }, [showMessage]);

  const visuals = {
    accent: state.colors.accent,
    accentGradient: `linear-gradient(135deg, ${state.colors.accent}, ${state.colors.accentSecondary})`,
    incomingBubble: state.colors.incomingBubble,
    chatBackground: state.colors.background,
    fontFamily: state.font.family,
  };

  return {
    state,
    savedThemes,
    marketTemplates,
    featuredTemplates,
    loading,
    saving,
    publishing,
    message,
    visuals,
    fileInputRef,
    updateColors,
    updateFont,
    updateBubbles,
    updateAnimations,
    updateName,
    handleSave,
    handleExport,
    handleImport,
    handleLoadTheme,
    handleDeleteTheme,
    handleReset,
    handlePublishToMarket,
    handleDownloadFromMarket,
    showMessage,
  };
}
