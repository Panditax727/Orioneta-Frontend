import { apiRequest, ApiError } from "../../../services/apiClient";
import { getSession } from "../../auth/session";
import { updateUserProfile, updateUserVisibility, ensureCurrentUserProfile } from "../../../services/userService";

const MOCK_USER_SETTINGS = {
  profile: {
    username: "Panditax",
    email: "panditax@orioneta.com",
    bio: "Developer & Designer",
    avatar: "P",
    status: "online",
    customStatus: "Coding something cool",
  },
  account: {
    language: "es",
    timezone: "America/Mexico_City",
    twoFactorEnabled: false,
    emailVerified: true,
  },
  privacy: {
    profileVisibility: "everyone",
    messageRequests: "everyone",
    showOnlineStatus: true,
    readReceipts: true,
  },
  notifications: {
    desktop: true,
    sound: true,
    mentions: true,
    messages: true,
    groups: true,
  },
  appearance: {
    theme: "dark",
    fontSize: "medium",
    chatDensity: "comfortable",
    sidebarBehavior: "auto-hide",
  },
};

let cachedSettings = { ...MOCK_USER_SETTINGS };

function getUserId() {
  const session = getSession();
  return session?.profileUserId || session?.userId || session?.email;
}

function isLocalProfile() {
  const session = getSession();
  return session?.profile?.localOnly === true;
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

function fallbackFetchSettings() {
  const stored = localStorage.getItem("orioneta.settings");
  if (stored) {
    try { return JSON.parse(stored); }
    catch { /* ignore */ }
  }
  return { ...MOCK_USER_SETTINGS };
}

function fallbackSaveSettings(data) {
  localStorage.setItem("orioneta.settings", JSON.stringify(data));
}

function appearanceToCustomization(appearance) {
  const map = { small: 12, medium: 14, large: 16 };
  return {
    activeFontId: appearance.fontSize ? `size-${appearance.fontSize}` : undefined,
    compactMode: appearance.chatDensity === "compact",
    animationLevel: appearance.sidebarBehavior === "manual" ? 1 : 3,
  };
}

function customizationToAppearance(customization) {
  const sizeMap = { 12: "small", 14: "medium", 16: "large" };
  const densityMap = { true: "compact", false: "comfortable" };

  return {
    theme: "dark",
    fontSize: sizeMap[customization.fontSize] || "medium",
    chatDensity: customization.compactMode ? "compact" : "comfortable",
    sidebarBehavior: customization.animationLevel <= 1 ? "manual" : "auto-hide",
  };
}

export const settingsService = {
  getUserSettings: async () => {
    try {
      if (isLocalProfile()) {
        cachedSettings = fallbackFetchSettings();
        return cachedSettings;
      }

      const userId = getUserId();
      const profile = await ensureCurrentUserProfile();

      const customization = await withApiFallback(
        () => apiRequest(`/api/customizations/users/${userId}`),
        () => null,
      );

      const appearance = customization ? customizationToAppearance(customization) : {};

      cachedSettings = {
        profile: {
          username: profile.userName || profile.name || "",
          email: profile.email || "",
          bio: profile.bio || "",
          avatar: profile.avatar || "U",
          status: profile.status || "online",
          customStatus: profile.customStatus || "",
        },
        account: {
          language: "es",
          timezone: "America/Mexico_City",
          twoFactorEnabled: false,
          emailVerified: profile.emailVerified ?? true,
          createdAt: profile.createdAt || "2024-01-15T00:00:00Z",
        },
        privacy: {
          profileVisibility: profile.visibility || "everyone",
          messageRequests: "everyone",
          showOnlineStatus: true,
          readReceipts: true,
        },
        notifications: { ...MOCK_USER_SETTINGS.notifications },
        appearance: { ...MOCK_USER_SETTINGS.appearance, ...appearance },
      };

      fallbackSaveSettings(cachedSettings);
      return cachedSettings;
    } catch {
      cachedSettings = fallbackFetchSettings();
      return cachedSettings;
    }
  },

  updateProfile: async (profileData) => {
    const userId = getUserId();

    const applyLocal = () => {
      cachedSettings.profile = { ...cachedSettings.profile, ...profileData };
      fallbackSaveSettings(cachedSettings);
      return cachedSettings.profile;
    };

    if (isLocalProfile() || !userId) {
      return applyLocal();
    }

    try {
      const body = {};
      if (profileData.username) body.userName = profileData.username;
      if (profileData.bio !== undefined) body.bio = profileData.bio;
      if (profileData.customStatus !== undefined) body.customStatus = profileData.customStatus;
      if (profileData.email) body.email = profileData.email;

      await updateUserProfile(userId, body);

      cachedSettings.profile = { ...cachedSettings.profile, ...profileData };
      fallbackSaveSettings(cachedSettings);
      return cachedSettings.profile;
    } catch {
      return applyLocal();
    }
  },

  updateAccount: async (accountData) => {
    cachedSettings.account = { ...cachedSettings.account, ...accountData };
    fallbackSaveSettings(cachedSettings);
    return cachedSettings.account;
  },

  updatePrivacy: async (privacyData) => {
    const userId = getUserId();

    const applyLocal = () => {
      cachedSettings.privacy = { ...cachedSettings.privacy, ...privacyData };
      fallbackSaveSettings(cachedSettings);
      return cachedSettings.privacy;
    };

    if (!isLocalProfile() && userId && privacyData.profileVisibility) {
      try {
        await updateUserVisibility(userId, privacyData.profileVisibility);
      } catch {
        // fallback to local save
      }
    }

    return applyLocal();
  },

  updateNotifications: async (notificationsData) => {
    cachedSettings.notifications = { ...cachedSettings.notifications, ...notificationsData };
    fallbackSaveSettings(cachedSettings);
    return cachedSettings.notifications;
  },

  updateAppearance: async (appearanceData) => {
    const userId = getUserId();

    const applyLocal = () => {
      cachedSettings.appearance = { ...cachedSettings.appearance, ...appearanceData };
      fallbackSaveSettings(cachedSettings);
      return cachedSettings.appearance;
    };

    if (!isLocalProfile() && userId) {
      try {
        const current = await withApiFallback(
          () => apiRequest(`/api/customizations/users/${userId}`),
          () => ({}),
        );

        await apiRequest(`/api/customizations/users/${userId}`, {
          method: "PUT",
          body: {
            ...current,
            ...appearanceToCustomization(appearanceData),
          },
        });
      } catch {
        // fallback to local save
      }
    }

    return applyLocal();
  },

  changePassword: async (currentPassword, newPassword) => {
    if (!newPassword) {
      throw new Error("La nueva contraseña es obligatoria");
    }
    if (newPassword.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    if (currentPassword === "wrong") {
      throw new Error("Contraseña actual incorrecta");
    }

    return true;
  },

  deleteAccount: async () => {
    const userId = getUserId();

    if (isLocalProfile() || !userId) {
      return true;
    }

    try {
      await apiRequest(`/api/users/${userId}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 0 || error.status === 404)) {
        return true;
      }
      throw error;
    }
  },
};
