// Servicio para manejar la configuración del usuario
// Por ahora usa datos mockeados, luego se conectará con el backend

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

export const settingsService = {
  // Obtener configuración del usuario
  getUserSettings: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_USER_SETTINGS;
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_USER_SETTINGS.profile = { ...MOCK_USER_SETTINGS.profile, ...profileData };
    return MOCK_USER_SETTINGS.profile;
  },

  // Actualizar cuenta
  updateAccount: async (accountData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_USER_SETTINGS.account = { ...MOCK_USER_SETTINGS.account, ...accountData };
    return MOCK_USER_SETTINGS.account;
  },

  // Actualizar privacidad
  updatePrivacy: async (privacyData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_USER_SETTINGS.privacy = { ...MOCK_USER_SETTINGS.privacy, ...privacyData };
    return MOCK_USER_SETTINGS.privacy;
  },

  // Actualizar notificaciones
  updateNotifications: async (notificationsData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_USER_SETTINGS.notifications = { ...MOCK_USER_SETTINGS.notifications, ...notificationsData };
    return MOCK_USER_SETTINGS.notifications;
  },

  // Actualizar apariencia
  updateAppearance: async (appearanceData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_USER_SETTINGS.appearance = { ...MOCK_USER_SETTINGS.appearance, ...appearanceData };
    return MOCK_USER_SETTINGS.appearance;
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulación de validación
    if (currentPassword === "wrong") {
      throw new Error("Contraseña actual incorrecta");
    }
    return true;
  },

  // Eliminar cuenta
  deleteAccount: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },
};
