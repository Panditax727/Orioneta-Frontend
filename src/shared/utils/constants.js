// Constantes de la aplicación

// API Endpoints (para cuando se conecte al backend)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
  },
  USER: {
    PROFILE: "/api/user/profile",
    STATUS: "/api/user/status",
  },
  CHANNELS: {
    LIST: "/api/channels",
    CREATE: "/api/channels",
    UPDATE: "/api/channels/:id",
    DELETE: "/api/channels/:id",
  },
  MESSAGES: {
    LIST: "/api/messages/:conversationId",
    SEND: "/api/messages",
  },
  CONVERSATIONS: {
    LIST: "/api/conversations",
    CREATE: "/api/conversations",
  },
  FRIENDS: {
    LIST: "/api/friends",
    ADD: "/api/friends",
    REMOVE: "/api/friends/:id",
  },
};

// Status de usuario
export const USER_STATUS = {
  ONLINE: "online",
  IDLE: "idle",
  DND: "dnd",
  OFFLINE: "offline",
};

// Tipos de conversación
export const CONVERSATION_TYPE = {
  DM: "dm",
  CHANNEL: "channel",
  GROUP: "group",
};

// Tamaños de avatar
export const AVATAR_SIZES = {
  XS: 24,
  SM: 32,
  MD: 40,
  LG: 48,
  XL: 64,
};

// Variantes de botón
export const BUTTON_VARIANTS = {
  PRIMARY: "primary",
  GHOST: "ghost",
  DANGER: "danger",
  SUBTLE: "subtle",
};

// Tamaños de botón
export const BUTTON_SIZES = {
  SM: "sm",
  MD: "md",
  LG: "lg",
};

// Tipos de archivo permitidos
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/zip",
];

// Tamaño máximo de archivo (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Límites de mensaje
export const MESSAGE_LIMITS = {
  MAX_LENGTH: 2000,
  MAX_ATTACHMENTS: 5,
};

// Tiempos de debounce/throttle (ms)
export const DEBOUNCE_TIMES = {
  SEARCH: 300,
  INPUT: 200,
  RESIZE: 100,
};

export const THROTTLE_TIMES = {
  SCROLL: 100,
  RESIZE: 150,
};
