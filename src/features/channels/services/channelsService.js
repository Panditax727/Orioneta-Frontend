const CHANNELS = [
  {
    id: 1,
    name: "bienvenida",
    description: "Primeros pasos y anuncios del grupo",
    members: 12,
    unread: 5,
  },
  {
    id: 2,
    name: "ideas",
    description: "Propuestas para mejorar Orioneta",
    members: 8,
    unread: 2,
  },
  {
    id: 3,
    name: "equipo",
    description: "Coordinacion privada del equipo",
    members: 6,
    unread: 0,
  },
  {
    id: 4,
    name: "juegos",
    description: "Partidas, clips y planes para jugar",
    members: 15,
    unread: 3,
  },
  {
    id: 5,
    name: "musica",
    description: "Canciones, artistas y recomendaciones",
    members: 9,
    unread: 0,
  },
];

export const channelsService = {
  getChannels: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return CHANNELS;
  },

  getChannelById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return CHANNELS.find((channel) => channel.id === id);
  },

  createChannel: async (channelData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newChannel = {
      id: CHANNELS.length + 1,
      ...channelData,
      members: 1,
      unread: 0,
    };
    CHANNELS.push(newChannel);
    return newChannel;
  },

  updateChannel: async (id, channelData) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = CHANNELS.findIndex((channel) => channel.id === id);

    if (index !== -1) {
      CHANNELS[index] = { ...CHANNELS[index], ...channelData };
      return CHANNELS[index];
    }

    throw new Error("Canal no encontrado");
  },

  deleteChannel: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = CHANNELS.findIndex((channel) => channel.id === id);

    if (index !== -1) {
      CHANNELS.splice(index, 1);
      return true;
    }

    throw new Error("Canal no encontrado");
  },

  searchChannels: async (query) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!query) {
      return CHANNELS;
    }

    return CHANNELS.filter(
      (channel) =>
        channel.name.toLowerCase().includes(query.toLowerCase()) ||
        channel.description.toLowerCase().includes(query.toLowerCase()),
    );
  },
};
