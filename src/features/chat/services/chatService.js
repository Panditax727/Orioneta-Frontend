const CHAT_STORAGE_KEY = "orioneta.chat.local-state";
const CHAT_UPDATED_EVENT = "orioneta-chat-updated";

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

function normalizeConversation(input) {
  const name = input.name?.trim() || input.displayName?.trim() || "Nuevo chat";
  const id = String(input.id || input.friendId || createId("chat"));

  return {
    id,
    friendId: input.friendId || input.id || null,
    name,
    avatar: input.avatar || name.charAt(0).toUpperCase(),
    lastMessage: input.lastMessage || "Aun no hay mensajes",
    time: input.time || "",
    unread: Number(input.unread || 0),
    online: Boolean(input.online),
  };
}

function sortByLastActivity(conversations) {
  return [...conversations].sort((a, b) => {
    if (!a.time && b.time) return 1;
    if (a.time && !b.time) return -1;
    return 0;
  });
}

export const chatService = {
  getDirectMessages: async () => {
    await delay();
    const state = readState();
    return sortByLastActivity(state.conversations);
  },

  getChannels: async () => {
    await delay();
    return readState().channels;
  },

  getUnreadConversations: async () => {
    await delay();
    return readState().conversations.filter((conversation) => conversation.unread > 0);
  },

  getMessages: async (conversationId) => {
    await delay(80);
    const state = readState();
    return state.messages[String(conversationId)] || [];
  },

  createDirectConversation: async ({ name }) => {
    await delay();
    const conversation = normalizeConversation({ name });
    const state = readState();

    state.conversations = [conversation, ...state.conversations];
    state.messages[conversation.id] = [];

    writeState(state);
    notifyChatUpdated();

    return conversation;
  },

  upsertDirectConversation: async (conversationInput) => {
    await delay(80);
    const conversation = normalizeConversation(conversationInput);
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

  sendMessage: async (conversationId, content) => {
    await delay();
    const id = String(conversationId);
    const state = readState();
    const newMessage = {
      id: createId("message"),
      sender: "Tu",
      content,
      time: nowTime(),
      mine: true,
    };

    if (!state.messages[id]) {
      state.messages[id] = [];
    }

    state.messages[id].push(newMessage);
    state.conversations = state.conversations.map((conversation) => (
      conversation.id === id
        ? { ...conversation, lastMessage: content, time: newMessage.time, unread: 0 }
        : conversation
    ));

    writeState(state);
    notifyChatUpdated();

    return newMessage;
  },

  searchConversations: async (query, type = "all") => {
    await delay(80);
    const state = readState();
    const normalizedQuery = query.trim().toLowerCase();
    const filterByName = (item) => item.name.toLowerCase().includes(normalizedQuery);
    const dms = normalizedQuery
      ? state.conversations.filter(filterByName)
      : state.conversations;
    const channels = normalizedQuery
      ? state.channels.filter(filterByName)
      : state.channels;

    return {
      dms: type === "channels" ? [] : dms,
      channels: type === "dms" ? [] : channels,
    };
  },

  markAsRead: async (conversationId) => {
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
