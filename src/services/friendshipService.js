import { apiRequest } from "./apiClient";
import { findUserById } from "./userService";

function getFriendId(friendship, currentUserId) {
  return friendship.userId === currentUserId ? friendship.friendId : friendship.userId;
}

async function enrichFriendship(friendship, currentUserId) {
  const friendId = getFriendId(friendship, currentUserId);

  try {
    const friend = await findUserById(friendId);

    return {
      ...friendship,
      friendId,
      friend,
    };
  } catch {
    return {
      ...friendship,
      friendId,
      friend: null,
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
  const friendships = await apiRequest(`/api/friendships/users/${userId}/friends`);

  return Promise.all(
    friendships.map((friendship) => enrichFriendship(friendship, userId)),
  );
}

export async function listReceivedRequests(userId) {
  const requests = await apiRequest(`/api/friendships/users/${userId}/requests/received`);
  return Promise.all(requests.map(enrichRequest));
}

export async function listSentRequests(userId) {
  const requests = await apiRequest(`/api/friendships/users/${userId}/requests/sent`);
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
  return apiRequest(`/api/friendships/users/${userId}/friends/${friendId}/remove`, {
    method: "PATCH",
  });
}
