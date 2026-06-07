import { ApiError, apiRequest } from "../../../services/apiClient";
import {
  ensureCurrentUserProfile,
  findUserByEmail,
  findUserByFriendCode,
  findUserById,
} from "../../../services/userService";
import { publishRealtimeEvent } from "../../realtime/services/realtimeService";

const CHAT_STORAGE_KEY = "orioneta.chat.local-state";
const CHAT_UPDATED_EVENT = "orioneta-chat-updated";
const UUID_REGEX = /^[0-9a-fA-F-]{36}$/;

const SEED_CONVERSATIONS = [
  {
    id: "seed-orion",
    name: "OrionTheProgrammer",
    avatar: "O",
    lastMessage: "Dale, lo veo manana",
    time: "12:34",
    unread: 2,
    online: true,
  },
  {
    id: "seed-flipper",
    name: "Flipper",
    avatar: "F",
    lastMessage: "Nos vemos?",
    time: "11:20",
    unread: 0,
    online: false,
  },
  {
    id: "seed-zbleend",
    name: "zBleend",
    avatar: "Z",
    lastMessage: "Ok gracias!",
    time: "09:05",
    unread: 1,
    online: true,
  },
];

const SEED_CHANNELS = [
  {
    id: "seed-channel-general",
    name: "general",
    lastMessage: "Bienvenidos al canal",
    time: "10:00",
    unread: 5,
    members: 12,
  },
];

const SEED_MESSAGES = {
  "seed-orion": [
    { id: "seed-message-1", sender: "OrionTheProgrammer", content: "Oye ya terminaste el conversation-service?", time: "12:20", mine: false },
    { id: "seed-message-2", sender: "Tu", content: "Casi, me falta la infraestructura", time: "12:21", mine: true },
    { id: "seed-message-3", sender: "OrionTheProgrammer", content: "Dale, yo voy con el user-service", time: "12:22", mine: false },
    { id: "seed-message-4", sender: "Tu", content: "Ok perfecto, lo vemos manana entonces", time: "12:34", mine: true },
  ],
};

const userCache = new Map();

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function createInitialState() {
  return {
    conversations: clone(SEED_CONVERSATIONS),
    channels: clone(SEED_CHANNELS),
    messages: clone(SEED_MESSAGES),
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readState() {
  const stored = localStorage.getItem(CHAT_STORAGE_KEY);

  if (!stored) {
    const initialState = createInitialState();
    writeState(initialState);
    return initialState;
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      conversations: parsed.conversations || [],
      channels: parsed.channels || [],
      messages: parsed.messages || {},
    };
  } catch {
    const initialState = createInitialState();
    writeState(initialState);
    return initialState;
  }
}

function writeState(state) {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state));
}

function notifyChatUpdated() {
  window.dispatchEvent(new Event(CHAT_UPDATED_EVENT));
}

function isLocalConversation(conversationId) {
  return String(conversationId || "").startsWith("seed-")
    || String(conversationId || "").startsWith("chat-");
}

async function getCurrentProfileOrNull() {
  try {
    return await ensureCurrentUserProfile();
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) {
      return null;
    }

    throw error;
  }
}

function getDisplayName(user) {
  return user?.displayName || user?.userName || user?.email || "Usuario Orioneta";
}

function getAvatar(userOrName) {
  const source = typeof userOrName === "string" ? userOrName : getDisplayName(userOrName);
  return source.trim().charAt(0).toUpperCase() || "O";
}

function formatMessageTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function parseMessagePayload(content) {
  if (typeof content !== "string") {
    return { text: "" };
  }

  try {
    const parsed = JSON.parse(content);

    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    // Plain text message.
  }

  return { text: content };
}

function getMessageSummary(content, type = "TEXT") {
  const payload = parseMessagePayload(content);
  const text = payload.text?.trim();

  if (text) {
    return text;
  }

  if (type === "IMAGE") {
    return "Imagen";
  }

  if (type === "VIDEO") {
    return "Video";
  }

  if (type === "AUDIO") {
    return "Audio";
  }

  if (type === "FILE") {
    return payload.attachment?.name || "Archivo";
  }

  return content || "Mensaje";
}

function sortByLastActivity(conversations) {
  return [...conversations].sort((a, b) => {
    if (!a.time && b.time) return 1;
    if (a.time && !b.time) return -1;
    return 0;
  });
}

function normalizeLocalConversation(input) {
  const name = input.name?.trim() || input.displayName?.trim() || "Nuevo chat";
  const id = String(input.id || input.friendId || createId("chat"));

  return {
    id,
    friendId: input.friendId || input.id || null,
    name,
    avatar: input.avatar || getAvatar(name),
    lastMessage: input.lastMessage || "Aun no hay mensajes",
    time: input.time || "",
    unread: Number(input.unread || 0),
    online: Boolean(input.online),
    backend: false,
  };
}

async function findUserCached(userId) {
  if (!userId) {
    return null;
  }

  const cacheKey = String(userId);
  if (userCache.has(cacheKey)) {
    return userCache.get(cacheKey);
  }

  try {
    const user = await findUserById(userId);
    userCache.set(cacheKey, user);
    return user;
  } catch {
    return null;
  }
}

function getParticipantIds(conversation) {
  return (conversation.participants || [])
    .map((participant) => participant.userId)
    .filter(Boolean);
}

function getOtherParticipantId(conversation, currentUserId) {
  return getParticipantIds(conversation)
    .find((participantId) => String(participantId) !== String(currentUserId));
}

async function fetchConversationMessages(conversationId) {
  return apiRequest(`/api/messages/conversation/${conversationId}`);
}

async function normalizeBackendMessage(message, currentUserId) {
  const mine = String(message.senderId) === String(currentUserId);
  const sender = mine ? null : await findUserCached(message.senderId);

  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    sender: mine ? "Tu" : getDisplayName(sender),
    content: message.content,
    type: message.type,
    status: message.status,
    time: formatMessageTime(message.createdAt),
    mine,
    createdAt: message.createdAt,
  };
}

async function normalizeBackendMessages(messages, currentUserId) {
  return Promise.all((messages || []).map((message) => normalizeBackendMessage(message, currentUserId)));
}

async function normalizeBackendConversation(conversation, currentProfile, messages = null) {
  const currentUserId = currentProfile.userID;
  const otherParticipantId = getOtherParticipantId(conversation, currentUserId);
  const otherParticipant = await findUserCached(otherParticipantId);
  const rawMessages = messages || [];
  const lastMessage = rawMessages.at(-1);
  const fallbackName = conversation.type === "PRIVATE_CHAT" ? "Chat privado" : "Grupo";
  const name = conversation.name?.trim() || getDisplayName(otherParticipant) || fallbackName;
  const status = otherParticipant?.status;

  return {
    id: conversation.id,
    type: conversation.type,
    friendId: otherParticipantId || null,
    name,
    avatar: getAvatar(otherParticipant || name),
    lastMessage: lastMessage ? getMessageSummary(lastMessage.content, lastMessage.type) : "Aun no hay mensajes",
    time: formatMessageTime(lastMessage?.createdAt || conversation.updatedAt),
    unread: 0,
    online: status === "ONLINE",
    participants: conversation.participants || [],
    backend: true,
  };
}

async function getBackendConversations(currentProfile) {
  const home = await apiRequest(`/api/bff/home/${currentProfile.userID}`);
  const conversations = home.conversations || [];

  return Promise.all(conversations.map(async (conversation) => {
    const messages = await fetchConversationMessages(conversation.id).catch(() => []);
    return normalizeBackendConversation(conversation, currentProfile, messages);
  }));
}

async function findExistingPrivateConversation(currentProfile, friendId) {
  const conversations = await getBackendConversations(currentProfile);

  return conversations.find((conversation) => (
    conversation.type === "PRIVATE_CHAT" && String(conversation.friendId) === String(friendId)
  ));
}

async function resolveConversationTarget(target) {
  const normalizedTarget = target.trim();

  if (!normalizedTarget) {
    throw new ApiError("Ingresa un email, friend code o ID de usuario", 0);
  }

  if (normalizedTarget.includes("@")) {
    return findUserByEmail(normalizedTarget.toLowerCase());
  }

  if (UUID_REGEX.test(normalizedTarget)) {
    return findUserById(normalizedTarget);
  }

  return findUserByFriendCode(normalizedTarget.toUpperCase());
}

async function createBackendPrivateConversation(currentProfile, friendProfile) {
  if (String(currentProfile.userID) === String(friendProfile.userID)) {
    throw new ApiError("No puedes abrir un chat contigo mismo", 400);
  }

  const existingConversation = await findExistingPrivateConversation(currentProfile, friendProfile.userID);
  if (existingConversation) {
    return existingConversation;
  }

  const conversation = await apiRequest("/api/bff/chats", {
    method: "POST",
    body: {
      type: "PRIVATE_CHAT",
      name: "",
      description: "",
      participantIds: [currentProfile.userID, friendProfile.userID],
    },
  });

  return normalizeBackendConversation(conversation, currentProfile, []);
}

export const chatService = {
  getDirectMessages: async () => {
    const currentProfile = await getCurrentProfileOrNull();

    if (!currentProfile) {
      await delay();
      return sortByLastActivity(readState().conversations);
    }

    return sortByLastActivity(await getBackendConversations(currentProfile));
  },

  getChannels: async () => {
    await delay();
    return readState().channels;
  },

  getUnreadConversations: async () => {
    const currentProfile = await getCurrentProfileOrNull();

    if (!currentProfile) {
      await delay();
      return readState().conversations.filter((conversation) => conversation.unread > 0);
    }

    return (await getBackendConversations(currentProfile)).filter((conversation) => conversation.unread > 0);
  },

  getMessages: async (conversationId) => {
    if (isLocalConversation(conversationId)) {
      await delay(80);
      return readState().messages[String(conversationId)] || [];
    }

    const currentProfile = await ensureCurrentUserProfile();
    const query = new URLSearchParams({ userId: currentProfile.userID });
    const chatView = await apiRequest(`/api/bff/chats/${conversationId}?${query.toString()}`);

    return normalizeBackendMessages(chatView.messages || [], currentProfile.userID);
  },

  createDirectConversation: async ({ name, target }) => {
    const currentProfile = await getCurrentProfileOrNull();
    const rawTarget = target || name || "";

    if (!currentProfile) {
      await delay();
      const conversation = normalizeLocalConversation({ name: rawTarget });
      const state = readState();

      state.conversations = [conversation, ...state.conversations];
      state.messages[conversation.id] = [];

      writeState(state);
      notifyChatUpdated();

      return conversation;
    }

    const friendProfile = await resolveConversationTarget(rawTarget);
    const conversation = await createBackendPrivateConversation(currentProfile, friendProfile);
    notifyChatUpdated();

    return conversation;
  },

  upsertDirectConversation: async (conversationInput) => {
    const currentProfile = await getCurrentProfileOrNull();

    if (currentProfile && conversationInput.friendId) {
      const friendProfile = await findUserById(conversationInput.friendId);
      const conversation = await createBackendPrivateConversation(currentProfile, friendProfile);
      notifyChatUpdated();
      return conversation;
    }

    await delay(80);
    const conversation = normalizeLocalConversation(conversationInput);
    const state = readState();
    const currentIndex = state.conversations.findIndex((item) => (
      item.id === conversation.id || item.friendId === conversation.friendId
    ));

    if (currentIndex >= 0) {
      state.conversations[currentIndex] = {
        ...state.conversations[currentIndex],
        ...conversation,
        lastMessage: state.conversations[currentIndex].lastMessage || conversation.lastMessage,
        time: state.conversations[currentIndex].time || conversation.time,
      };
    } else {
      state.conversations = [conversation, ...state.conversations];
      state.messages[conversation.id] = [];
    }

    writeState(state);
    notifyChatUpdated();

    return currentIndex >= 0 ? state.conversations[currentIndex] : conversation;
  },

  sendMessage: async (conversationId, content, type = "TEXT") => {
    const lastMessage = getMessageSummary(content, type);

    if (isLocalConversation(conversationId)) {
      await delay();
      const id = String(conversationId);
      const state = readState();
      const newMessage = {
        id: createId("message"),
        sender: "Tu",
        content,
        type,
        time: nowTime(),
        mine: true,
      };

      if (!state.messages[id]) {
        state.messages[id] = [];
      }

      state.messages[id].push(newMessage);
      state.conversations = state.conversations.map((conversation) => (
        conversation.id === id
          ? { ...conversation, lastMessage, time: newMessage.time, unread: 0 }
          : conversation
      ));

      writeState(state);
      notifyChatUpdated();

      return newMessage;
    }

    const currentProfile = await ensureCurrentUserProfile();
    const sentMessage = await apiRequest("/api/bff/chats/messages", {
      method: "POST",
      body: {
        conversationId,
        senderId: currentProfile.userID,
        content,
        type,
      },
    });

    notifyChatUpdated();

    const normalizedMessage = await normalizeBackendMessage(sentMessage, currentProfile.userID);

    publishRealtimeEvent({
      type: "MESSAGE_SENT",
      conversationId,
      messageId: normalizedMessage.id,
      senderId: currentProfile.userID,
      content: normalizedMessage.content,
      messageType: normalizedMessage.type,
      occurredAt: normalizedMessage.createdAt || new Date().toISOString(),
    });

    return normalizedMessage;
  },

  searchConversations: async (query, type = "all") => {
    const normalizedQuery = query.trim().toLowerCase();

    if (type === "channels") {
      await delay(80);
      const channels = readState().channels;
      return {
        dms: [],
        channels: normalizedQuery
          ? channels.filter((item) => item.name.toLowerCase().includes(normalizedQuery))
          : channels,
      };
    }

    const dms = await chatService.getDirectMessages();

    return {
      dms: normalizedQuery
        ? dms.filter((item) => item.name.toLowerCase().includes(normalizedQuery))
        : dms,
      channels: [],
    };
  },

  markAsRead: async (conversationId) => {
    if (!isLocalConversation(conversationId)) {
      return true;
    }

    await delay(80);
    const id = String(conversationId);
    const state = readState();

    state.conversations = state.conversations.map((conversation) => (
      conversation.id === id ? { ...conversation, unread: 0 } : conversation
    ));
    state.channels = state.channels.map((channel) => (
      channel.id === id ? { ...channel, unread: 0 } : channel
    ));

    writeState(state);
    notifyChatUpdated();

    return true;
  },

  subscribe: (callback) => {
    window.addEventListener(CHAT_UPDATED_EVENT, callback);
    return () => window.removeEventListener(CHAT_UPDATED_EVENT, callback);
  },
};
