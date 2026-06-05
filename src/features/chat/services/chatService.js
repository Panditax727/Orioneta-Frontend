// Servicio para manejar la lógica de chat y conversaciones
// Por ahora usa datos mockeados, luego se conectará con el backend

const MOCK_DMS = [
  {
    id: 1,
    name: "OrionTheProgrammer",
    avatar: "O",
    lastMessage: "Dale, lo veo mañana",
    time: "12:34",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Flipper",
    avatar: "F",
    lastMessage: "Nos vemos?",
    time: "11:20",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "zBleend",
    avatar: "Z",
    lastMessage: "Ok gracias!",
    time: "09:05",
    unread: 1,
    online: true,
  },
];

const MOCK_CHANNELS = [
  {
    id: 10,
    name: "general",
    lastMessage: "Bienvenidos al canal",
    time: "10:00",
    unread: 5,
    members: 12,
  },
  {
    id: 11,
    name: "desarrollo",
    lastMessage: "Merge aprobado",
    time: "08:45",
    unread: 0,
    members: 4,
  },
  {
    id: 12,
    name: "gaming",
    lastMessage: "Quien quiere jugar?",
    time: "ayer",
    unread: 3,
    members: 8,
  },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1, sender: "OrionTheProgrammer", content: "Oye ya terminaste el conversation-service?", time: "12:20", mine: false },
    { id: 2, sender: "Tu", content: "Casi, me falta la infraestructura", time: "12:21", mine: true },
    { id: 3, sender: "OrionTheProgrammer", content: "Dale, yo voy con el user-service", time: "12:22", mine: false },
    { id: 4, sender: "Tu", content: "Ok perfecto, lo vemos mañana entonces", time: "12:34", mine: true },
  ],
};

export const chatService = {
  // Obtener conversaciones directas (DMs)
  getDirectMessages: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_DMS;
  },

  // Obtener canales
  getChannels: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CHANNELS;
  },

  // Obtener mensajes de una conversación
  getMessages: async (conversationId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_MESSAGES[conversationId] || [];
  },

  // Enviar mensaje
  sendMessage: async (conversationId, content) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newMessage = {
      id: Date.now(),
      sender: "Tu",
      content,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mine: true,
    };
    
    if (!MOCK_MESSAGES[conversationId]) {
      MOCK_MESSAGES[conversationId] = [];
    }
    MOCK_MESSAGES[conversationId].push(newMessage);
    
    // Actualizar lastMessage en la conversación
    const dmIndex = MOCK_DMS.findIndex(dm => dm.id === conversationId);
    if (dmIndex !== -1) {
      MOCK_DMS[dmIndex].lastMessage = content;
      MOCK_DMS[dmIndex].time = newMessage.time;
    }
    
    return newMessage;
  },

  // Buscar conversaciones
  searchConversations: async (query, type = "all") => {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (!query) return { dms: MOCK_DMS, channels: MOCK_CHANNELS };
    
    const filteredDMs = MOCK_DMS.filter(dm =>
      dm.name.toLowerCase().includes(query.toLowerCase())
    );
    
    const filteredChannels = MOCK_CHANNELS.filter(channel =>
      channel.name.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      dms: type === "channels" ? [] : filteredDMs,
      channels: type === "dms" ? [] : filteredChannels,
    };
  },

  // Marcar conversación como leída
  markAsRead: async (conversationId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const dmIndex = MOCK_DMS.findIndex(dm => dm.id === conversationId);
    if (dmIndex !== -1) {
      MOCK_DMS[dmIndex].unread = 0;
    }
    const channelIndex = MOCK_CHANNELS.findIndex(ch => ch.id === conversationId);
    if (channelIndex !== -1) {
      MOCK_CHANNELS[channelIndex].unread = 0;
    }
    return true;
  },
};
