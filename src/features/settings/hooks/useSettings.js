import { useState, useEffect, useCallback } from "react";
import { settingsService } from "../services/settingsService";

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getUserSettings();
      setSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await settingsService.updateProfile(profileData);
      setSettings(prev => ({ ...prev, profile: updated }));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateAccount = useCallback(async (accountData) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await settingsService.updateAccount(accountData);
      setSettings(prev => ({ ...prev, account: updated }));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updatePrivacy = useCallback(async (privacyData) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await settingsService.updatePrivacy(privacyData);
      setSettings(prev => ({ ...prev, privacy: updated }));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateNotifications = useCallback(async (notificationsData) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await settingsService.updateNotifications(notificationsData);
      setSettings(prev => ({ ...prev, notifications: updated }));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateAppearance = useCallback(async (appearanceData) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await settingsService.updateAppearance(appearanceData);
      setSettings(prev => ({ ...prev, appearance: updated }));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setSaving(true);
      setError(null);
      await settingsService.changePassword(currentPassword, newPassword);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      await settingsService.deleteAccount();
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchSettings();
    });
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    saving,
    updateProfile,
    updateAccount,
    updatePrivacy,
    updateNotifications,
    updateAppearance,
    changePassword,
    deleteAccount,
    refetch: fetchSettings,
  };
}
