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
const GROUP_META_STORAGE_KEY = "orioneta.chat.group-meta";
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

function readGroupMetaStore() {
  try {
    return JSON.parse(localStorage.getItem(GROUP_META_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeGroupMeta(conversationId, updates = {}) {
  const store = readGroupMetaStore();
  const key = String(conversationId);

  store[key] = {
    ...(store[key] || {}),
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(GROUP_META_STORAGE_KEY, JSON.stringify(store));
}

function applyGroupMeta(conversation) {
  if (!conversation?.isGroup) {
    return conversation;
  }

  const meta = readGroupMetaStore()[String(conversation.id)];

  if (!meta) {
    return conversation;
  }

  return {
    ...conversation,
    ...(meta.name ? { name: meta.name } : {}),
    ...(meta.avatarPhoto ? { avatarPhoto: meta.avatarPhoto, avatarUrl: meta.avatarPhoto } : {}),
    ...(meta.bio !== undefined ? { bio: meta.bio, description: meta.description || meta.bio } : {}),
    ...(meta.ownerId ? { ownerId: meta.ownerId } : {}),
  };
}

function resolveGroupOwnerId(conversation, members = []) {
  if (conversation.ownerId) {
    return conversation.ownerId;
  }

  if (conversation.owner?.id || conversation.owner?.userId) {
    return conversation.owner.id || conversation.owner.userId;
  }

  if (conversation.createdBy) {
    return conversation.createdBy;
  }

  const ownerParticipant = (conversation.participants || []).find((participant) => {
    const role = String(participant.role || participant.participantRole || "").toUpperCase();
    return role === "OWNER" || role === "ADMIN";
  });

  if (ownerParticipant) {
    return getParticipantUserId(ownerParticipant);
  }

  const ownerMember = members.find((member) => {
    const role = String(member.role || "").toUpperCase();
    return role === "OWNER" || role === "ADMIN";
  });

  return ownerMember?.id || ownerMember?.userId || null;
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

function getProfilePhoto(user) {
  return user?.profilePhoto || user?.avatarUrl || user?.profilePhotoReference || "";
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

function buildMemberFromParticipant(participant, currentUserId) {
  const userId = getParticipantUserId(participant);

  if (!userId || String(userId) === String(participant?.conversationId)) {
    return null;
  }

  const user = participant.user || participant.profile || participant;
  const participantType = String(participant.type || user.type || "").toUpperCase();

  if (participantType === "GROUP" || participantType === "GROUP_CHAT") {
    return null;
  }

  const name = String(userId) === String(currentUserId)
    ? "Tu"
    : getDisplayName(user);

  const role = String(
    participant.role || participant.participantRole || user.role || "",
  ).toUpperCase();

  return {
    id: userId,
    userId,
    name,
    avatar: getAvatar(user || name),
    avatarPhoto: getProfilePhoto(user),
    online: user?.status === "ONLINE",
    role: role || "MEMBER",
  };
}

async function buildMembersFromParticipants(participants, currentUserId, conversationId) {
  const members = (participants || [])
    .map((participant) => buildMemberFromParticipant(participant, currentUserId))
    .filter(Boolean);

  const uniqueMembers = new Map();

  members.forEach((member) => {
    if (String(member.id) === String(conversationId)) {
      return;
    }

    uniqueMembers.set(String(member.id), member);
  });

  const resolvedMembers = await Promise.all(
    [...uniqueMembers.values()].map(async (member) => {
      if (member.name !== "Tu" && member.name.startsWith("Usuario")) {
        const user = await findUserCached(member.id);

        if (user) {
          return {
            ...member,
            name: getDisplayName(user),
            avatar: getAvatar(user),
            avatarPhoto: getProfilePhoto(user),
            online: user?.status === "ONLINE",
          };
        }
      }

      return member;
    }),
  );

  return resolvedMembers;
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

async function normalizeBackendMessage(
  message,
  currentUserId,
  currentProfile = null,
) {
  const mine = String(message.senderId) === String(currentUserId);
  const sender = mine ? currentProfile : await findUserCached(message.senderId);
  const senderName = mine ? "Tu" : getDisplayName(sender);

  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    sender: senderName,
    senderAvatarPhoto: mine ? getProfilePhoto(currentProfile) : getProfilePhoto(sender),
    senderInitial: getAvatar(sender || senderName),
    content: message.content,
    type: message.type,
    status: message.status,
    time: formatMessageTime(message.createdAt),
    mine,
    edited: Boolean(message.edited),
    createdAt: message.createdAt,
  };
}

async function normalizeBackendMessages(messages, currentUserId, currentProfile = null) {
  const normalizedMessages = await Promise.all(
    sortRawMessages(messages || []).map((message) =>
      normalizeBackendMessage(message, currentUserId, currentProfile),
    ),
  );

  return collapseNearDuplicateMessages(normalizedMessages);
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

  const isGroup = conversation.type === "GROUP_CHAT" || conversation.type === "GROUP";
  const otherParticipantId = isGroup ? null : getOtherParticipantId(conversation, currentUserId);
  const otherParticipant = isGroup ? null : await findUserCached(otherParticipantId);
  const rawMessages = sortRawMessages(messages || []);
  const lastMessage = rawMessages.at(-1);
  const lastActivityAt = getConversationActivityAt(conversation, rawMessages);
  const name = isGroup
    ? (conversation.name?.trim() || "Grupo")
    : (conversation.name?.trim() || getDisplayName(otherParticipant) || "Chat privado");
  const status = otherParticipant?.status;

  const members = isGroup
    ? await buildMembersFromParticipants(
        conversation.participants || conversation.members || [],
        currentUserId,
        conversation.id,
      )
    : [];

  const ownerId = isGroup ? resolveGroupOwnerId(conversation, members) : null;

  const normalizedConversation = {
    id: conversation.id,
    type: conversation.type,
    isGroup,
    ownerId,
    friendId: otherParticipantId || null,
    name,
    avatar: isGroup ? (name.trim().charAt(0).toUpperCase() || "#") : getAvatar(otherParticipant || name),
    avatarPhoto: isGroup
      ? (conversation.avatarPhoto || conversation.avatarUrl || conversation.imageUrl || "")
      : getProfilePhoto(otherParticipant),
    badges: isGroup ? [] : getProfileBadges(otherParticipant),
    lastMessage: lastMessage
      ? getMessageSummary(lastMessage.content, lastMessage.type)
      : "Aun no hay mensajes",
    time: formatMessageTime(lastMessage?.createdAt || conversation.updatedAt),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    lastActivityAt,
    unread: Number(conversation.unread ?? conversation.unreadCount ?? 0),
    online: isGroup ? false : status === "ONLINE",
    rawMessages,
    participants: conversation.participants || [],
    members: members.map((member) => ({
      ...member,
      role: member.role || (ownerId && String(member.id) === String(ownerId) ? "OWNER" : "MEMBER"),
      isAdmin: ownerId ? String(member.id) === String(ownerId) : false,
    })),
    duplicateConversationIds: [conversation.id],
    backend: true,
    bio: isGroup ? (conversation.bio || conversation.description || "") : undefined,
    description: isGroup ? (conversation.description || conversation.bio || "") : undefined,
  };

  return applyGroupMeta(normalizedConversation);
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
    if (!shouldUseBffFallback(error) || error.status >= 500) {
      throw error;
    }

    return apiRequest("/api/bff/chats/messages", {
      method: "POST",
      body: payload,
    });
  }
}

function collapseNearDuplicateMessages(messages) {
  return messages.reduce((uniqueMessages, message) => {
    const previousMessage = uniqueMessages.at(-1);

    if (
      previousMessage &&
      previousMessage.senderId === message.senderId &&
      previousMessage.content === message.content &&
      previousMessage.type === message.type &&
      areCloseTimestamps(previousMessage.createdAt, message.createdAt)
    ) {
      return uniqueMessages;
    }

    uniqueMessages.push(message);
    return uniqueMessages;
  }, []);
}

function areCloseTimestamps(firstValue, secondValue) {
  const firstTimestamp = Date.parse(firstValue || "");
  const secondTimestamp = Date.parse(secondValue || "");

  if (Number.isNaN(firstTimestamp) || Number.isNaN(secondTimestamp)) {
    return false;
  }

  return Math.abs(firstTimestamp - secondTimestamp) <= 10000;
}

function shouldUseBffFallback(error) {
  return error instanceof ApiError && (error.status === 0 || error.status >= 500);
}

export const chatService = {
  getDirectMessages: async () => {
    const currentProfile = await getCurrentProfileOrNull();

    if (!currentProfile) {
      await delay();
      return sortByLastActivity(readState().conversations).map(applyGroupMeta);
    }

    return sortByLastActivity(await getBackendConversations(currentProfile)).map(applyGroupMeta);
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
      return normalizeBackendMessages(messages || [], currentUserId, currentProfile);
    } catch (error) {
      if (!shouldUseBffFallback(error)) {
        throw error;
      }

      const query = new URLSearchParams({ userId: currentUserId });
      const chatView = await apiRequest(
        `/api/bff/chats/${conversationId}?${query.toString()}`,
      );

      return normalizeBackendMessages(
        chatView.messages || [],
        currentUserId,
        currentProfile,
      );
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

  editMessage: async (conversationId, messageId, content) => {
    const republishEvent = async (updatedMessage) => {
      const currentProfile = await ensureCurrentUserProfile().catch(() => null);
      const currentUserId = currentProfile ? getUserId(currentProfile) : null;

      if (currentUserId) {
        publishRealtimeEvent({
          type: "MESSAGE_EDITED",
          conversationId: String(conversationId),
          messageId,
          content,
          senderId: currentUserId,
          senderName: currentProfile ? getDisplayName(currentProfile) : null,
          occurredAt: new Date().toISOString(),
        });
      }

      notifyChatUpdated();
    };

    if (isLocalConversation(conversationId)) {
      await delay();

      const id = String(conversationId);
      const state = readState();

      if (!state.messages[id]) return null;

      state.messages[id] = state.messages[id].map((msg) =>
        msg.id === messageId
          ? { ...msg, content, edited: true, editedAt: new Date().toISOString() }
          : msg,
      );

      writeState(state);
      notifyChatUpdated();

      return state.messages[id].find((msg) => msg.id === messageId) || null;
    }

    try {
      const currentProfile = await ensureCurrentUserProfile();
      const currentUserId = getUserId(currentProfile);
      const targetConversationId = getCanonicalConversationId(conversationId);

      const updatedMessage = await apiRequest(`/api/messages/${messageId}`, {
        method: "PATCH",
        body: { content },
      });

      const normalized = await normalizeBackendMessage(updatedMessage, currentUserId, currentProfile);
      await republishEvent(normalized);
      notifyChatUpdated();

      return normalized;
    } catch {
      const id = String(conversationId);
      const state = readState();

      if (!state.messages[id]) return null;

      state.messages[id] = state.messages[id].map((msg) =>
        msg.id === messageId
          ? { ...msg, content, edited: true, editedAt: new Date().toISOString() }
          : msg,
      );

      writeState(state);
      notifyChatUpdated();

      return state.messages[id].find((msg) => msg.id === messageId) || null;
    }
  },

  deleteMessage: async (conversationId, messageId) => {
    if (isLocalConversation(conversationId)) {
      await delay();

      const id = String(conversationId);
      const state = readState();

      if (!state.messages[id]) return;

      state.messages[id] = state.messages[id].filter((msg) => msg.id !== messageId);
      writeState(state);
      notifyChatUpdated();

      return;
    }

    try {
      await apiRequest(`/api/messages/${messageId}`, { method: "DELETE" });
    } catch {
      // fallback: remove locally
      const id = String(conversationId);
      const state = readState();

      if (state.messages[id]) {
        state.messages[id] = state.messages[id].filter((msg) => msg.id !== messageId);
        writeState(state);
      }
    }

    notifyChatUpdated();
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
        senderAvatarPhoto: "",
        senderInitial: "T",
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
      currentProfile,
    );

    publishRealtimeEvent({
      type: "MESSAGE_SENT",
      conversationId: targetConversationId,
      messageId: normalizedMessage.id,
      senderId: currentUserId,
      senderName: getDisplayName(currentProfile),
      senderAvatar: getProfilePhoto(currentProfile),
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
    const id = String(conversationId);

    if (!isLocalConversation(conversationId)) {
      try {
        const currentProfile = await ensureCurrentUserProfile();
        const currentUserId = getUserId(currentProfile);

        if (!currentUserId) {
          return true;
        }

        const messages = await fetchConversationMessages(conversationId);
        const unreadMessages = messages.filter(
          (msg) => !msg.read && String(msg.senderId) !== String(currentUserId),
        );

        await Promise.allSettled(
          unreadMessages.map((msg) =>
            apiRequest(`/api/messages/${msg.id}/read`, {
              method: "PATCH",
            }).catch(() => {}),
          ),
        );
      } catch {
        // fallback: solo local
      }

      return true;
    }

    await delay(80);

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

  addParticipant: async (conversationId, userId) => {
    const canonicalId = getCanonicalConversationId(conversationId);

    return apiRequest(`/api/conversations/${canonicalId}/participants/${userId}`, {
      method: "POST",
    });
  },

  deleteConversation: async (conversationId, { isGroup = false } = {}) => {
    const id = String(conversationId);

    if (isLocalConversation(id)) {
      await delay();

      const state = readState();

      state.conversations = state.conversations.filter(
        (conversation) => conversation.id !== id,
      );
      delete state.messages[id];
      writeState(state);
      notifyChatUpdated();

      return true;
    }

    const currentProfile = await ensureCurrentUserProfile();
    const currentUserId = getUserId(currentProfile);

    if (!currentUserId) {
      throw new ApiError("No se pudo identificar al usuario actual", 0);
    }

    const canonicalId = getCanonicalConversationId(id);

    try {
      // Use leave endpoint for both groups and private chats
      await apiRequest(
        `/api/conversations/${canonicalId}/participants/${currentUserId}`,
        { method: "DELETE" },
      );

      // On success (204 No Content), remove from local state
      const state = readState();
      state.conversations = state.conversations.filter(
        (conversation) => conversation.id !== id,
      );
      delete state.messages[id];
      writeState(state);
      notifyChatUpdated();

      return true;
    } catch (error) {
      // Handle errors - if conversation doesn't exist on backend, remove locally
      if (error instanceof ApiError && error.status === 404) {
        const state = readState();
        const existsLocally = state.conversations.some(
          (conversation) => conversation.id === id,
        );

        if (existsLocally) {
          state.conversations = state.conversations.filter(
            (conversation) => conversation.id !== id,
          );
          delete state.messages[id];
          writeState(state);
          notifyChatUpdated();
        }
        return true;
      }

      // For other errors, still try to remove locally if it exists
      const state = readState();
      const existsLocally = state.conversations.some(
        (conversation) => conversation.id === id,
      );

      if (existsLocally) {
        state.conversations = state.conversations.filter(
          (conversation) => conversation.id !== id,
        );
        delete state.messages[id];
        writeState(state);
        notifyChatUpdated();
      }

      throw error;
    }
  },

  updateConversation: async (conversationId, updates = {}) => {
    const id = String(conversationId);
    const normalizedUpdates = {
      ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
      ...(updates.bio !== undefined ? { bio: updates.bio.trim() } : {}),
      ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
      ...(updates.avatarPhoto !== undefined ? { avatarPhoto: updates.avatarPhoto } : {}),
    };

    if (isLocalConversation(id)) {
      await delay();

      const state = readState();

      state.conversations = state.conversations.map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              ...normalizedUpdates,
              avatar: normalizedUpdates.name
                ? normalizedUpdates.name.trim().charAt(0).toUpperCase()
                : conversation.avatar,
            }
          : conversation,
      );
      writeState(state);
      writeGroupMeta(id, normalizedUpdates);
      notifyChatUpdated();

      return applyGroupMeta(
        state.conversations.find((conversation) => conversation.id === id) || null,
      );
    }

    const canonicalId = getCanonicalConversationId(id);
    const payload = {
      ...(normalizedUpdates.name ? { name: normalizedUpdates.name } : {}),
      ...(normalizedUpdates.bio ? { bio: normalizedUpdates.bio, description: normalizedUpdates.bio } : {}),
      ...(normalizedUpdates.description ? { description: normalizedUpdates.description } : {}),
      ...(normalizedUpdates.avatarPhoto ? { avatarPhoto: normalizedUpdates.avatarPhoto, avatarUrl: normalizedUpdates.avatarPhoto } : {}),
    };

    try {
      const updatedConversation = await apiRequest(`/api/conversations/${canonicalId}`, {
        method: "PATCH",
        body: payload,
      });

      const currentProfile = await ensureCurrentUserProfile();
      const normalized = await normalizeBackendConversation(
        { ...updatedConversation, ...payload },
        currentProfile,
        [],
      );

      if (normalizedUpdates.avatarPhoto) {
        normalized.avatarPhoto = normalizedUpdates.avatarPhoto;
      }

      writeGroupMeta(id, {
        ...normalizedUpdates,
        ownerId: normalized.ownerId,
      });
      notifyChatUpdated();

      return applyGroupMeta(normalized);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        const state = readState();
        const existingConversation = state.conversations.find(
          (conversation) => conversation.id === id,
        );

        if (existingConversation) {
          const patchedConversation = {
            ...existingConversation,
            ...normalizedUpdates,
          };

          state.conversations = state.conversations.map((conversation) =>
            conversation.id === id ? patchedConversation : conversation,
          );
          writeState(state);
          notifyChatUpdated();

          return patchedConversation;
        }
      }

      if (normalizedUpdates.avatarPhoto || normalizedUpdates.name || normalizedUpdates.bio) {
        writeGroupMeta(id, normalizedUpdates);
        notifyChatUpdated();

        return applyGroupMeta({
          id,
          isGroup: true,
          ...normalizedUpdates,
        });
      }

      throw error;
    }
  },

  createGroupConversation: async ({ name, description, bio, photoFile, participantIds }) => {
    const currentProfile = await getCurrentProfileOrNull();

    let photoUrl = "";
    if (photoFile) {
      photoUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(photoFile);
      });
    }

    if (!currentProfile) {
      await delay();

      const conversation = normalizeLocalConversation({
        name,
        description: description || "",
        bio: bio || "",
        avatarPhoto: photoUrl,
        participantIds: participantIds || [],
      });

      conversation.isGroup = true;
      conversation.type = "GROUP_CHAT";
      conversation.bio = bio || "";
      conversation.description = description || bio || "";
      conversation.ownerId = "local-you";
      conversation.members = [
        { id: "local-you", userId: "local-you", name: "Tu", avatar: "T", online: true, role: "OWNER", isAdmin: true },
        ...(participantIds || []).map((id) => ({
          id,
          name: `Usuario ${id.slice(0, 8)}`,
          avatar: "?",
          online: false,
        })),
      ];

      const state = readState();
      state.conversations = [conversation, ...state.conversations];
      state.messages[conversation.id] = [];
      writeState(state);
      writeGroupMeta(conversation.id, {
        avatarPhoto: photoUrl || "",
        bio: bio || "",
        description: description || bio || "",
        ownerId: "local-you",
      });
      notifyChatUpdated();

      return conversation;
    }

    const currentUserId = getUserId(currentProfile);

    const payload = {
      type: "GROUP_CHAT",
      name: name.trim(),
      description: description?.trim() || "",
      bio: bio?.trim() || "",
      ownerId: currentUserId,
      participantIds: [
        currentUserId,
        ...(participantIds || []),
      ],
    };

    try {
      const conversation = await apiRequest("/api/conversations", {
        method: "POST",
        body: payload,
      });

      const normalized = await normalizeBackendConversation(
        conversation,
        currentProfile,
        [],
      );

      if (photoUrl) {
        normalized.avatarPhoto = photoUrl;
      }
      normalized.isGroup = true;
      normalized.bio = bio?.trim() || "";
      normalized.ownerId = currentUserId;

      writeGroupMeta(normalized.id, {
        avatarPhoto: photoUrl || "",
        bio: bio?.trim() || "",
        description: description?.trim() || bio?.trim() || "",
        ownerId: currentUserId,
      });

      notifyChatUpdated();

      return normalized;
    } catch (error) {
      if (!shouldUseBffFallback(error)) {
        throw error;
      }

      const conversation = await apiRequest("/api/bff/chats", {
        method: "POST",
        body: payload,
      });

      const normalized = await normalizeBackendConversation(
        conversation,
        currentProfile,
        [],
      );

      if (photoUrl) {
        normalized.avatarPhoto = photoUrl;
      }
      normalized.isGroup = true;
      normalized.bio = bio?.trim() || "";
      normalized.ownerId = currentUserId;

      writeGroupMeta(normalized.id, {
        avatarPhoto: photoUrl || "",
        bio: bio?.trim() || "",
        description: description?.trim() || bio?.trim() || "",
        ownerId: currentUserId,
      });

      notifyChatUpdated();

      return normalized;
    }
  },

  isConversationAlias: (conversationId, candidateConversationId) => {
    return getRelatedConversationIds(conversationId)
      .map(String)
      .includes(String(candidateConversationId));
  },
};
