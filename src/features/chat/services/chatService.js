import { ApiError, apiRequest } from "../../../services/apiClient";
import {
  ensureCurrentUserProfile,
  findUserByEmail,
  findUserByFriendCode,
  findUserById,
} from "../../../services/userService";
import { publishRealtimeEvent } from "../../realtime/services/realtimeService";
import { getProfileBadges } from "../../status/utils/profileBadges";

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
    {
      id: "seed-message-1",
      sender: "OrionTheProgrammer",
      content: "Oye ya terminaste el conversation-service?",
      time: "12:20",
      mine: false,
    },
    {
      id: "seed-message-2",
      sender: "Tu",
      content: "Casi, me falta la infraestructura",
      time: "12:21",
      mine: true,
    },
    {
      id: "seed-message-3",
      sender: "OrionTheProgrammer",
      content: "Dale, yo voy con el user-service",
      time: "12:22",
      mine: false,
    },
    {
      id: "seed-message-4",
      sender: "Tu",
      content: "Ok perfecto, lo vemos manana entonces",
      time: "12:34",
      mine: true,
    },
  ],
};

const userCache = new Map();
const conversationAliases = new Map();

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
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createInitialState() {
  return {
    conversations: clone(SEED_CONVERSATIONS),
    channels: clone(SEED_CHANNELS),
    messages: clone(SEED_MESSAGES),
  };
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
  return (
    String(conversationId || "").startsWith("seed-") ||
    String(conversationId || "").startsWith("chat-")
  );
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

function getUserId(user) {
  return user?.id || user?.userId || user?.userID || user?.uuid || null;
}

function getFriendIdFromInput(input) {
  return (
    input?.targetUserId ||
    input?.friendId ||
    input?.friendUserId ||
    input?.userId ||
    input?.userID ||
    input?.friend?.id ||
    input?.friend?.userId ||
    input?.friend?.userID ||
    input?.profile?.id ||
    input?.profile?.userId ||
    input?.profile?.userID ||
    input?.friendProfile?.id ||
    input?.friendProfile?.userId ||
    input?.friendProfile?.userID ||
    null
  );
}

function getFriendProfileFromInput(input) {
  if (input?.friend) {
    return input.friend;
  }

  if (input?.profile) {
    return input.profile;
  }

  if (input?.friendProfile) {
    return input.friendProfile;
  }

  return null;
}

function getDisplayName(user) {
  return (
    user?.displayName ||
    user?.userName ||
    user?.username ||
    user?.email ||
    "Usuario Orioneta"
  );
}

function getAvatar(userOrName) {
  const source =
    typeof userOrName === "string" ? userOrName : getDisplayName(userOrName);

  return source.trim().charAt(0).toUpperCase() || "O";
}

function normalizeFriendDisplayName(input) {
  return (
    input?.name ||
    input?.displayName ||
    input?.userName ||
    input?.username ||
    input?.email ||
    input?.friend?.displayName ||
    input?.friend?.userName ||
    input?.friend?.username ||
    input?.friend?.email ||
    input?.profile?.displayName ||
    input?.profile?.userName ||
    input?.profile?.username ||
    input?.profile?.email ||
    "Chat privado"
  );
}

function formatMessageTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
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
    // Mensaje plano.
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

function getTimestamp(value) {
  const timestamp = Date.parse(value || "");

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortByLastActivity(conversations) {
  return [...conversations].sort((a, b) => {
    const bTimestamp = getTimestamp(b.lastActivityAt || b.updatedAt || b.createdAt);
    const aTimestamp = getTimestamp(a.lastActivityAt || a.updatedAt || a.createdAt);

    return bTimestamp - aTimestamp;
  });
}

function normalizeLocalConversation(input) {
  const name = normalizeFriendDisplayName(input);
  const friendId = getFriendIdFromInput(input);
  const id = String(
    input.conversationId || input.chatId || friendId || createId("chat"),
  );

  return {
    id,
    friendId,
    name,
    avatar:
      input.avatar ||
      input.friend?.avatar ||
      getAvatar(name),
    avatarPhoto:
      input.avatarPhoto ||
      input.profilePhoto ||
      input.friend?.profilePhoto ||
      input.friend?.avatarUrl ||
      input.profile?.profilePhoto ||
      input.profile?.avatarUrl ||
      "",
    badges:
      input.badges ||
      input.friend?.badges ||
      input.profile?.badges ||
      getProfileBadges(input.friend || input.profile || input),
    lastMessage: input.lastMessage || "Aun no hay mensajes",
    time: input.time || "",
    unread: Number(input.unread || 0),
    online: Boolean(
      input.online ||
      input.status === "ONLINE" ||
      input.friend?.status === "ONLINE",
    ),
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

function getParticipantUserId(participant) {
  return participant?.userId || participant?.userID || participant?.id || null;
}

function getParticipantIds(conversation) {
  if (Array.isArray(conversation.participantIds)) {
    return conversation.participantIds.filter(Boolean);
  }

  return (conversation.participants || [])
    .map(getParticipantUserId)
    .filter(Boolean);
}

function getOtherParticipantId(conversation, currentUserId) {
  return getParticipantIds(conversation).find(
    (participantId) => String(participantId) !== String(currentUserId),
  );
}

async function fetchConversationMessages(conversationId) {
  return apiRequest(`/api/messages/conversation/${conversationId}`);
}

async function fetchUserConversations(userId) {
  return apiRequest(`/api/conversations/users/${userId}`);
}

function getRelatedConversationIds(conversationId) {
  const key = String(conversationId);
  const aliases = conversationAliases.get(key);

  return aliases?.length ? aliases : [conversationId];
}

function getCanonicalConversationId(conversationId) {
  return getRelatedConversationIds(conversationId)[0] || conversationId;
}

async function fetchRelatedConversationMessages(conversationId) {
  const conversationIds = getRelatedConversationIds(conversationId);
  const results = await Promise.allSettled(
    conversationIds.map((id) => fetchConversationMessages(id)),
  );
  const fulfilledResults = results.filter(
    (result) => result.status === "fulfilled",
  );

  if (fulfilledResults.length > 0) {
    return fulfilledResults.flatMap((result) => result.value || []);
  }

  throw results.find((result) => result.status === "rejected")?.reason ||
    new ApiError("No se pudieron cargar los mensajes", 0);
}

function uniqueRawMessages(messages) {
  const uniqueMessages = new Map();

  (messages || []).forEach((message) => {
    const key =
      message.id ||
      [
        message.conversationId,
        message.senderId,
        message.createdAt,
        message.content,
      ].join(":");

    if (!uniqueMessages.has(key)) {
      uniqueMessages.set(key, message);
    }
  });

  return [...uniqueMessages.values()];
}

function sortRawMessages(messages) {
  return uniqueRawMessages(messages).sort((a, b) => {
    const aTimestamp = getTimestamp(a.createdAt || a.updatedAt);
    const bTimestamp = getTimestamp(b.createdAt || b.updatedAt);

    return aTimestamp - bTimestamp;
  });
}

function getConversationActivityAt(conversation, messages = []) {
  const lastMessage = sortRawMessages(messages).at(-1);

  return (
    lastMessage?.createdAt ||
    conversation.updatedAt ||
    conversation.createdAt ||
    null
  );
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
  return Promise.all(
    sortRawMessages(messages || []).map((message) =>
      normalizeBackendMessage(message, currentUserId),
    ),
  );
}

async function normalizeBackendConversation(
  conversation,
  currentProfile,
  messages = null,
) {
  const currentUserId = getUserId(currentProfile);

  if (!currentUserId) {
    throw new ApiError("No se pudo identificar al usuario actual", 0);
  }

  const otherParticipantId = getOtherParticipantId(conversation, currentUserId);
  const otherParticipant = await findUserCached(otherParticipantId);
  const rawMessages = sortRawMessages(messages || []);
  const lastMessage = rawMessages.at(-1);
  const lastActivityAt = getConversationActivityAt(conversation, rawMessages);
  const fallbackName =
    conversation.type === "PRIVATE_CHAT" ? "Chat privado" : "Grupo";
  const name =
    conversation.name?.trim() ||
    getDisplayName(otherParticipant) ||
    fallbackName;
  const status = otherParticipant?.status;

  return {
    id: conversation.id,
    type: conversation.type,
    friendId: otherParticipantId || null,
    name,
    avatar: getAvatar(otherParticipant || name),
    avatarPhoto: otherParticipant?.profilePhoto || otherParticipant?.avatarUrl || "",
    badges: getProfileBadges(otherParticipant),
    lastMessage: lastMessage
      ? getMessageSummary(lastMessage.content, lastMessage.type)
      : "Aun no hay mensajes",
    time: formatMessageTime(lastMessage?.createdAt || conversation.updatedAt),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    lastActivityAt,
    unread: 0,
    online: status === "ONLINE",
    rawMessages,
    participants: conversation.participants || [],
    duplicateConversationIds: [conversation.id],
    backend: true,
  };
}

async function getBackendConversations(currentProfile) {
  const currentUserId = getUserId(currentProfile);

  if (!currentUserId) {
    throw new ApiError("No se pudo identificar al usuario actual", 0);
  }

  const conversations = await getConversationListWithFallback(currentUserId);

  const normalizedConversations = await Promise.all(
    conversations.map(async (conversation) => {
      const messages = await fetchConversationMessages(conversation.id).catch(
        () => [],
      );
      return normalizeBackendConversation(
        conversation,
        currentProfile,
        messages,
      );
    }),
  );

  return mergeDuplicatePrivateConversations(
    normalizedConversations,
    currentUserId,
  );
}

function getConversationGroupKey(conversation, currentUserId) {
  if (conversation.type !== "PRIVATE_CHAT") {
    return `conversation:${conversation.id}`;
  }

  if (conversation.friendId) {
    return `private:${conversation.friendId}`;
  }

  const otherParticipantIds = getParticipantIds(conversation)
    .filter((participantId) => String(participantId) !== String(currentUserId))
    .sort();

  return `private:${otherParticipantIds.join(":") || conversation.id}`;
}

function pickCanonicalConversation(firstConversation, secondConversation) {
  if (!firstConversation) {
    return secondConversation;
  }

  const firstCreatedAt = getTimestamp(firstConversation.createdAt);
  const secondCreatedAt = getTimestamp(secondConversation.createdAt);

  if (!firstCreatedAt && secondCreatedAt) {
    return secondConversation;
  }

  if (firstCreatedAt && secondCreatedAt && secondCreatedAt < firstCreatedAt) {
    return secondConversation;
  }

  return firstConversation;
}

function mergeConversationGroup(currentConversation, nextConversation) {
  const canonicalConversation = pickCanonicalConversation(
    currentConversation,
    nextConversation,
  );
  const duplicateIds = new Set([
    ...(currentConversation?.duplicateConversationIds || []),
    ...(nextConversation?.duplicateConversationIds || [nextConversation.id]),
  ]);
  const rawMessages = sortRawMessages([
    ...(currentConversation?.rawMessages || []),
    ...(nextConversation.rawMessages || []),
  ]);
  const lastMessage = rawMessages.at(-1);
  const mostRecentConversation =
    getTimestamp(nextConversation.lastActivityAt) >
    getTimestamp(currentConversation?.lastActivityAt)
      ? nextConversation
      : currentConversation;
  const lastActivityAt =
    lastMessage?.createdAt ||
    mostRecentConversation?.lastActivityAt ||
    canonicalConversation.lastActivityAt;
  const orderedDuplicateIds = [
    canonicalConversation.id,
    ...[...duplicateIds].filter(
      (conversationId) => conversationId !== canonicalConversation.id,
    ),
  ];

  return {
    ...canonicalConversation,
    lastMessage: lastMessage
      ? getMessageSummary(lastMessage.content, lastMessage.type)
      : mostRecentConversation?.lastMessage || canonicalConversation.lastMessage,
    time: formatMessageTime(lastActivityAt),
    updatedAt: mostRecentConversation?.updatedAt || canonicalConversation.updatedAt,
    lastActivityAt,
    rawMessages,
    duplicateConversationIds: orderedDuplicateIds,
  };
}

function mergeDuplicatePrivateConversations(conversations, currentUserId) {
  conversationAliases.clear();

  const groupedConversations = new Map();

  conversations.forEach((conversation) => {
    const groupKey = getConversationGroupKey(conversation, currentUserId);
    const currentConversation = groupedConversations.get(groupKey);

    groupedConversations.set(
      groupKey,
      mergeConversationGroup(currentConversation, conversation),
    );
  });

  const mergedConversations = sortByLastActivity([
    ...groupedConversations.values(),
  ]);

  mergedConversations.forEach((conversation) => {
    const aliases = conversation.duplicateConversationIds || [conversation.id];

    aliases.forEach((alias) => {
      conversationAliases.set(String(alias), aliases);
    });
  });

  return mergedConversations;
}

async function getConversationListWithFallback(currentUserId) {
  try {
    return await fetchUserConversations(currentUserId);
  } catch (error) {
    if (!shouldUseBffFallback(error)) {
      throw error;
    }

    const home = await apiRequest(`/api/bff/home/${currentUserId}`);
    return home.conversations || [];
  }
}

async function findExistingPrivateConversation(currentProfile, friendId) {
  const conversations = await getBackendConversations(currentProfile);

  return conversations.find(
    (conversation) =>
      conversation.type === "PRIVATE_CHAT" &&
      String(conversation.friendId) === String(friendId),
  );
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

async function resolveFriendProfileFromInput(input) {
  if (!input) {
    throw new ApiError("No se recibió información del amigo", 0);
  }

  const embeddedFriendProfile = getFriendProfileFromInput(input);

  if (embeddedFriendProfile) {
    return embeddedFriendProfile;
  }

  const friendId = getFriendIdFromInput(input);

  if (friendId && UUID_REGEX.test(String(friendId))) {
    return findUserById(friendId);
  }

  if (input.email) {
    return findUserByEmail(input.email);
  }

  if (input.friendCode) {
    return findUserByFriendCode(input.friendCode);
  }

  const target = input.target || input.name || input.displayName || "";

  if (target) {
    return resolveConversationTarget(target);
  }

  throw new ApiError("No se pudo resolver el amigo seleccionado", 0);
}

async function createBackendPrivateConversation(currentProfile, friendProfile) {
  const currentUserId = getUserId(currentProfile);
  const friendUserId = getUserId(friendProfile);

  if (!currentUserId) {
    throw new ApiError("No se pudo identificar al usuario actual", 0);
  }

  if (!friendUserId) {
    throw new ApiError("No se pudo identificar al amigo seleccionado", 0);
  }

  if (String(currentUserId) === String(friendUserId)) {
    throw new ApiError("No puedes abrir un chat contigo mismo", 400);
  }

  const existingConversation = await findExistingPrivateConversation(
    currentProfile,
    friendUserId,
  );

  if (existingConversation) {
    return existingConversation;
  }

  const payload = {
    type: "PRIVATE_CHAT",
    name: "",
    description: "",
    participantIds: [currentUserId, friendUserId],
  };

  const conversation = await createPrivateConversationWithFallback(payload);

  return normalizeBackendConversation(conversation, currentProfile, []);
}

async function createPrivateConversationWithFallback(payload) {
  try {
    return await apiRequest("/api/conversations", {
      method: "POST",
      body: payload,
    });
  } catch (error) {
    if (!shouldUseBffFallback(error)) {
      throw error;
    }

    return apiRequest("/api/bff/chats", {
      method: "POST",
      body: payload,
    });
  }
}

async function sendMessageWithFallback(payload) {
  try {
    return await apiRequest("/api/messages", {
      method: "POST",
      body: payload,
    });
  } catch (error) {
    if (!shouldUseBffFallback(error)) {
      throw error;
    }

    return apiRequest("/api/bff/chats/messages", {
      method: "POST",
      body: payload,
    });
  }
}

function shouldUseBffFallback(error) {
  return error instanceof ApiError && (error.status === 0 || error.status >= 500);
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
      return readState().conversations.filter(
        (conversation) => conversation.unread > 0,
      );
    }

    return (await getBackendConversations(currentProfile)).filter(
      (conversation) => conversation.unread > 0,
    );
  },

  getMessages: async (conversationId) => {
    if (isLocalConversation(conversationId)) {
      await delay(80);
      return readState().messages[String(conversationId)] || [];
    }

    const currentProfile = await ensureCurrentUserProfile();
    const currentUserId = getUserId(currentProfile);

    if (!currentUserId) {
      throw new ApiError("No se pudo identificar al usuario actual", 0);
    }

    try {
      const messages = await fetchRelatedConversationMessages(conversationId);
      return normalizeBackendMessages(messages || [], currentUserId);
    } catch (error) {
      if (!shouldUseBffFallback(error)) {
        throw error;
      }

      const query = new URLSearchParams({ userId: currentUserId });
      const chatView = await apiRequest(
        `/api/bff/chats/${conversationId}?${query.toString()}`,
      );

      return normalizeBackendMessages(chatView.messages || [], currentUserId);
    }
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
    const conversation = await createBackendPrivateConversation(
      currentProfile,
      friendProfile,
    );

    notifyChatUpdated();

    return conversation;
  },

  upsertDirectConversation: async (conversationInput) => {
    const currentProfile = await getCurrentProfileOrNull();

    if (currentProfile) {
      const friendProfile =
        await resolveFriendProfileFromInput(conversationInput);
      const conversation = await createBackendPrivateConversation(
        currentProfile,
        friendProfile,
      );

      notifyChatUpdated();

      return conversation;
    }

    await delay(80);

    const conversation = normalizeLocalConversation(conversationInput);
    const state = readState();

    const currentIndex = state.conversations.findIndex(
      (item) =>
        item.id === conversation.id || item.friendId === conversation.friendId,
    );

    if (currentIndex >= 0) {
      state.conversations[currentIndex] = {
        ...state.conversations[currentIndex],
        ...conversation,
        lastMessage:
          state.conversations[currentIndex].lastMessage ||
          conversation.lastMessage,
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

      state.conversations = state.conversations.map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              lastMessage,
              time: newMessage.time,
              unread: 0,
            }
          : conversation,
      );

      writeState(state);
      notifyChatUpdated();

      return newMessage;
    }

    const currentProfile = await ensureCurrentUserProfile();
    const currentUserId = getUserId(currentProfile);

    if (!currentUserId) {
      throw new ApiError("No se pudo identificar al usuario actual", 0);
    }

    const targetConversationId = getCanonicalConversationId(conversationId);
    const sentMessage = await sendMessageWithFallback({
      conversationId: targetConversationId,
      senderId: currentUserId,
      content,
      type,
    });

    notifyChatUpdated();

    const normalizedMessage = await normalizeBackendMessage(
      sentMessage,
      currentUserId,
    );

    publishRealtimeEvent({
      type: "MESSAGE_SENT",
      conversationId: targetConversationId,
      messageId: normalizedMessage.id,
      senderId: currentUserId,
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
          ? channels.filter((item) =>
              item.name.toLowerCase().includes(normalizedQuery),
            )
          : channels,
      };
    }

    const dms = await chatService.getDirectMessages();

    return {
      dms: normalizedQuery
        ? dms.filter((item) =>
            item.name.toLowerCase().includes(normalizedQuery),
          )
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

    state.conversations = state.conversations.map((conversation) =>
      conversation.id === id ? { ...conversation, unread: 0 } : conversation,
    );

    state.channels = state.channels.map((channel) =>
      channel.id === id ? { ...channel, unread: 0 } : channel,
    );

    writeState(state);
    notifyChatUpdated();

    return true;
  },

  subscribe: (callback) => {
    window.addEventListener(CHAT_UPDATED_EVENT, callback);
    return () => window.removeEventListener(CHAT_UPDATED_EVENT, callback);
  },

  isConversationAlias: (conversationId, candidateConversationId) => {
    return getRelatedConversationIds(conversationId)
      .map(String)
      .includes(String(candidateConversationId));
  },
};
