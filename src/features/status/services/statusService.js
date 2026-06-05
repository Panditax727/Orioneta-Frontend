// Servicio para manejar el estado y presencia de usuarios
// Por ahora usa datos mockeados, luego se conectará con el backend

const MOCK_FRIENDS = [
  {
    id: 1,
    name: "OrionTheProgrammer",
    avatar: "O",
    status: "online",
    activity: "Programando",
    lastSeen: null,
  },
  {
    id: 2,
    name: "Flipper",
    avatar: "F",
    status: "idle",
    activity: "Ausente",
    lastSeen: "Hace 5 min",
  },
  {
    id: 3,
    name: "zBleend",
    avatar: "Z",
    status: "online",
    activity: "Jugando",
    lastSeen: null,
  },
  {
    id: 4,
    name: "DevMaster",
    avatar: "D",
    status: "offline",
    activity: null,
    lastSeen: "Hace 2 horas",
  },
  {
    id: 5,
    name: "CodeNinja",
    avatar: "C",
    status: "dnd",
    activity: "No molestar",
    lastSeen: null,
  },
];

const MOCK_USER_PROFILE = {
  id: 999,
  name: "Panditax727",
  avatar: "P",
  email: "panditax@orioneta.com",
  status: "online",
  activity: "Disponible",
  bio: "Desarrollador Full Stack 🚀",
  joinedDate: "Enero 2025",
};

export const statusService = {
  // Obtener lista de amigos
  getFriends: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_FRIENDS;
  },

  // Obtener perfil del usuario actual
  getUserProfile: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_USER_PROFILE;
  },

  // Actualizar estado del usuario
  updateUserStatus: async (status, activity) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_USER_PROFILE.status = status;
    MOCK_USER_PROFILE.activity = activity;
    return MOCK_USER_PROFILE;
  },

  // Buscar amigos
  searchFriends: async (query) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (!query) return MOCK_FRIENDS;
    return MOCK_FRIENDS.filter(friend =>
      friend.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Obtener amigos por estado
  getFriendsByStatus: async (status) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_FRIENDS.filter(friend => friend.status === status);
  },
};
