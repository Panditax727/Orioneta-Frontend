import { apiRequest } from "./apiClient";
import { findUserById } from "./userService";

function getNormalizedUserId(user) {
  return user?.id || user?.userId || user?.userID || user?.uuid || null;
}

function getFriendId(friendship, currentUserId) {
  const normalizedCurrentUserId = String(currentUserId);

  const userId =
    friendship.userId || friendship.userID || friendship.ownerUserId || null;

  const friendId =
    friendship.friendId ||
    friendship.friendUserId ||
    friendship.targetUserId ||
    null;

  if (!userId && friendId) {
    return friendId;
  }

  if (!friendId && userId) {
    return userId;
  }

  if (String(userId) === normalizedCurrentUserId) {
    return friendId;
  }

  return userId;
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

function getAvatar(user) {
  const name = getDisplayName(user);
  return user?.avatar || name.trim().charAt(0).toUpperCase() || "O";
}

function getProfilePhoto(user) {
  return user?.profilePhoto || user?.avatarUrl || "";
}

async function enrichFriendship(friendship, currentUserId) {
  const friendId = getFriendId(friendship, currentUserId);

  try {
    const friend = await findUserById(friendId);

    return {
      ...friendship,

      // ID real del usuario amigo.
      friendId,

      // Perfil completo del amigo.
      friend,

      // Campos normalizados para que chatService pueda abrir el chat sin adivinar.
      targetUserId: getNormalizedUserId(friend) || friendId,
      name: getDisplayName(friend),
      displayName:
        friend?.displayName ||
        friend?.userName ||
        friend?.username ||
        "Usuario Orioneta",
      username: friend?.username || friend?.userName || "",
      email: friend?.email || "",
      avatar: getAvatar(friend),
      profilePhoto: getProfilePhoto(friend),
      online: friend?.status === "ONLINE",
    };
  } catch {
    return {
      ...friendship,
      friendId,
      friend: null,
      targetUserId: friendId,
      name: "Usuario Orioneta",
      displayName: "Usuario Orioneta",
      username: "",
      email: "",
      avatar: "O",
      profilePhoto: "",
      online: false,
    };
  }
}

async function enrichRequest(request) {
  const [sender, receiver] = await Promise.all([
    findUserById(request.senderUserId).catch(() => null),
    findUserById(request.receiverUserId).catch(() => null),
  ]);

  return {
    ...request,
    sender,
    receiver,
  };
}

export async function sendFriendRequest({ senderUserId, target }) {
  const trimmedTarget = target.trim();

  const body = {
    senderUserId,
  };

  if (trimmedTarget.includes("@")) {
    body.receiverEmail = trimmedTarget.toLowerCase();
  } else if (/^[0-9a-fA-F-]{36}$/.test(trimmedTarget)) {
    body.receiverUserId = trimmedTarget;
  } else {
    body.receiverFriendCode = trimmedTarget.toUpperCase();
  }

  return apiRequest("/api/friendships/requests", {
    method: "POST",
    body,
  });
}

export async function listFriends(userId) {
  const friendships = await apiRequest(
    `/api/friendships/users/${userId}/friends`,
  );

  return Promise.all(
    friendships.map((friendship) => enrichFriendship(friendship, userId)),
  );
}

export async function listReceivedRequests(userId) {
  const requests = await apiRequest(
    `/api/friendships/users/${userId}/requests/received`,
  );
  return Promise.all(requests.map(enrichRequest));
}

export async function listSentRequests(userId) {
  const requests = await apiRequest(
    `/api/friendships/users/${userId}/requests/sent`,
  );
  return Promise.all(requests.map(enrichRequest));
}

export async function acceptFriendRequest(requestId, requesterUserId) {
  return apiRequest(`/api/friendships/requests/${requestId}/accept`, {
    method: "PATCH",
    body: { requesterUserId },
  });
}

export async function rejectFriendRequest(requestId, requesterUserId) {
  return apiRequest(`/api/friendships/requests/${requestId}/reject`, {
    method: "PATCH",
    body: { requesterUserId },
  });
}

export async function cancelFriendRequest(requestId, requesterUserId) {
  return apiRequest(`/api/friendships/requests/${requestId}/cancel`, {
    method: "PATCH",
    body: { requesterUserId },
  });
}

export async function removeFriend(userId, friendId) {
  return apiRequest(
    `/api/friendships/users/${userId}/friends/${friendId}/remove`,
    {
      method: "PATCH",
    },
  );
}
