import {
  acceptFriendRequest,
  cancelFriendRequest,
  listFriends,
  listReceivedRequests,
  listSentRequests,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "../../../services/friendshipService";
import {
  ensureCurrentUserProfile,
  updateUserProfile,
  updateUserStatus,
  updateUserVisibility,
} from "../../../services/userService";

const DOMAIN_TO_UI_STATUS = {
  ONLINE: "online",
  AWAY: "idle",
  BUSY: "dnd",
  OFFLINE: "offline",
};

const UI_TO_DOMAIN_STATUS = {
  online: "ONLINE",
  idle: "AWAY",
  dnd: "BUSY",
  offline: "OFFLINE",
};

const STATUS_LABELS = {
  online: "En linea",
  idle: "Ausente",
  dnd: "No molestar",
  offline: "Desconectado",
};

function toUiProfile(profile) {
  const status = DOMAIN_TO_UI_STATUS[profile.status] || "offline";
  const name = profile.displayName || profile.userName || profile.email || "Usuario";

  return {
    id: profile.userID,
    userID: profile.userID,
    name,
    userName: profile.userName,
    avatar: name.trim().charAt(0).toUpperCase() || "O",
    email: profile.email,
    friendCode: profile.friendCode,
    status,
    activity: STATUS_LABELS[status],
    bio: profile.bio,
    profilePhoto: profile.profilePhoto,
    visibility: profile.visibility || "PUBLIC",
    joinedDate: profile.createdAt
      ? new Date(profile.createdAt).toLocaleDateString()
      : "",
  };
}

function toUiFriend(enrichedFriendship) {
  const friend = enrichedFriendship.friend;

  if (!friend) {
    return {
      id: enrichedFriendship.friendId,
      name: "Usuario no disponible",
      avatar: "?",
      status: "offline",
      activity: "No disponible",
      friendshipId: enrichedFriendship.id,
      raw: enrichedFriendship,
    };
  }

  return {
    ...toUiProfile(friend),
    id: friend.userID,
    friendshipId: enrichedFriendship.id,
    raw: enrichedFriendship,
  };
}

export const statusService = {
  getFriends: async () => {
    const profile = await ensureCurrentUserProfile();
    const friendships = await listFriends(profile.userID);
    return friendships.map(toUiFriend);
  },

  getUserProfile: async () => {
    const profile = await ensureCurrentUserProfile();
    return toUiProfile(profile);
  },

  updateUserStatus: async (status) => {
    const profile = await ensureCurrentUserProfile();
    const updatedProfile = await updateUserStatus(
      profile.userID,
      UI_TO_DOMAIN_STATUS[status] || "OFFLINE",
    );

    return toUiProfile(updatedProfile);
  },

  updateUserProfile: async (profileData) => {
    const profile = await ensureCurrentUserProfile();
    const updatedProfile = await updateUserProfile(profile.userID, {
      displayName: profileData.displayName,
      bio: profileData.bio,
      profilePhoto: profileData.profilePhoto,
    });

    return toUiProfile(updatedProfile);
  },

  updateUserVisibility: async (visibility) => {
    const profile = await ensureCurrentUserProfile();
    const updatedProfile = await updateUserVisibility(profile.userID, visibility);

    return toUiProfile(updatedProfile);
  },

  searchFriends: async (query) => {
    const friends = await statusService.getFriends();

    if (!query) {
      return friends;
    }

    return friends.filter((friend) =>
      friend.name.toLowerCase().includes(query.toLowerCase()),
    );
  },

  getFriendsByStatus: async (status) => {
    const friends = await statusService.getFriends();
    return friends.filter((friend) => friend.status === status);
  },

  getFriendRequests: async () => {
    const profile = await ensureCurrentUserProfile();
    const [received, sent] = await Promise.all([
      listReceivedRequests(profile.userID),
      listSentRequests(profile.userID),
    ]);

    return { received, sent };
  },

  sendFriendRequest: async (target) => {
    const profile = await ensureCurrentUserProfile();
    return sendFriendRequest({
      senderUserId: profile.userID,
      target,
    });
  },

  acceptFriendRequest: async (requestId) => {
    const profile = await ensureCurrentUserProfile();
    return acceptFriendRequest(requestId, profile.userID);
  },

  rejectFriendRequest: async (requestId) => {
    const profile = await ensureCurrentUserProfile();
    return rejectFriendRequest(requestId, profile.userID);
  },

  cancelFriendRequest: async (requestId) => {
    const profile = await ensureCurrentUserProfile();
    return cancelFriendRequest(requestId, profile.userID);
  },

  removeFriend: async (friendId) => {
    const profile = await ensureCurrentUserProfile();
    return removeFriend(profile.userID, friendId);
  },
};
