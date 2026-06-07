import { useCallback, useEffect, useMemo, useState } from "react";
import {
  customizationService,
  getCustomizationVisuals,
  subscribeToCustomizationChanges,
} from "../services/customizationService";

export function useCustomization(conversationId = null) {
  const [userCustomization, setUserCustomization] = useState(null);
  const [conversationCustomization, setConversationCustomization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCustomization = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      const [userData, conversationData] = await Promise.all([
        customizationService.getUserCustomization(),
        customizationService.getConversationCustomization(conversationId),
      ]);

      setUserCustomization(userData);
      setConversationCustomization(conversationData);
    } catch (loadError) {
      if (!silent) {
        setError(loadError.message || "No se pudo cargar la personalizacion");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [conversationId]);

  const updateUserCustomization = useCallback(async (updates) => {
    try {
      setSaving(true);
      setError("");

      const updated = await customizationService.updateUserCustomization(updates);
      setUserCustomization(updated);
      return updated;
    } catch (saveError) {
      setError(saveError.message || "No se pudo guardar la configuracion");
      throw saveError;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateConversationCustomization = useCallback(async (updates) => {
    if (!conversationId) {
      return null;
    }

    try {
      setSaving(true);
      setError("");

      const updated = await customizationService.updateConversationCustomization(conversationId, updates);
      setConversationCustomization(updated);
      return updated;
    } catch (saveError) {
      setError(saveError.message || "No se pudo guardar el chat");
      throw saveError;
    } finally {
      setSaving(false);
    }
  }, [conversationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadCustomization();
    });
  }, [loadCustomization]);

  useEffect(() => subscribeToCustomizationChanges(() => {
    void loadCustomization({ silent: true });
  }), [loadCustomization]);

  const visuals = useMemo(
    () => getCustomizationVisuals(userCustomization, conversationCustomization),
    [conversationCustomization, userCustomization],
  );

  return {
    userCustomization,
    conversationCustomization,
    visuals,
    loading,
    saving,
    error,
    reload: loadCustomization,
    updateUserCustomization,
    updateConversationCustomization,
  };
}
