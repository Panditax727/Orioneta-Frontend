import { useState, useEffect, useCallback } from "react";
import { themesService } from "../services/themesService";

export function useThemes() {
  const [themes, setThemes] = useState([]);
  const [installedTheme, setInstalledTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchThemes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [allThemes, installed] = await Promise.all([
        themesService.getAllThemes(),
        themesService.getInstalledTheme(),
      ]);
      setThemes(allThemes);
      setInstalledTheme(installed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const installTheme = useCallback(async (themeId) => {
    try {
      const updated = await themesService.installTheme(themeId);
      setInstalledTheme(updated);
      setThemes(prev => prev.map(t => 
        t.id === themeId ? updated : { ...t, isInstalled: false }
      ));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const uninstallTheme = useCallback(async (themeId) => {
    try {
      await themesService.uninstallTheme(themeId);
      setInstalledTheme(null);
      setThemes(prev => prev.map(t => 
        t.id === themeId ? { ...t, isInstalled: false } : t
      ));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const searchThemes = useCallback(async (query) => {
    try {
      const results = await themesService.searchThemes(query);
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const rateTheme = useCallback(async (themeId, rating) => {
    try {
      const updated = await themesService.rateTheme(themeId, rating);
      setThemes(prev => prev.map(t => 
        t.id === themeId ? updated : t
      ));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchThemes();
    });
  }, [fetchThemes]);

  return {
    themes,
    installedTheme,
    loading,
    error,
    installTheme,
    uninstallTheme,
    searchThemes,
    rateTheme,
    refetch: fetchThemes,
  };
}
