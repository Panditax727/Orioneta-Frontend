// Servicio para manejar la lógica de canales
// Por ahora usa datos mockeados, luego se conectará con el backend

const MOCK_CHANNELS = [
  { id: 1, name: "general", description: "Canal general para todos", members: 12, unread: 5 },
  { id: 2, name: "frontend", description: "Discusiones sobre desarrollo frontend", members: 8, unread: 2 },
  { id: 3, name: "backend", description: "Discusiones sobre desarrollo backend", members: 6, unread: 0 },
  { id: 4, name: "gaming", description: "Videojuegos y gaming", members: 15, unread: 3 },
  { id: 5, name: "music", description: "Música y artistas", members: 9, unread: 0 },
];

export const channelsService = {
  // Obtener todos los canales
  getChannels: async () => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CHANNELS;
  },

  // Obtener un canal por ID
  getChannelById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_CHANNELS.find(channel => channel.id === id);
  },

  // Crear un nuevo canal
  createChannel: async (channelData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newChannel = {
      id: MOCK_CHANNELS.length + 1,
      ...channelData,
      members: 1,
      unread: 0,
    };
    MOCK_CHANNELS.push(newChannel);
    return newChannel;
  },

  // Actualizar un canal
  updateChannel: async (id, channelData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = MOCK_CHANNELS.findIndex(channel => channel.id === id);
    if (index !== -1) {
      MOCK_CHANNELS[index] = { ...MOCK_CHANNELS[index], ...channelData };
      return MOCK_CHANNELS[index];
    }
    throw new Error("Canal no encontrado");
  },

  // Eliminar un canal
  deleteChannel: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = MOCK_CHANNELS.findIndex(channel => channel.id === id);
    if (index !== -1) {
      MOCK_CHANNELS.splice(index, 1);
      return true;
    }
    throw new Error("Canal no encontrado");
  },

  // Buscar canales
  searchChannels: async (query) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (!query) return MOCK_CHANNELS;
    return MOCK_CHANNELS.filter(channel =>
      channel.name.toLowerCase().includes(query.toLowerCase()) ||
      channel.description.toLowerCase().includes(query.toLowerCase())
    );
  },
};
