import { apiRequest } from "../../../services/apiClient";

export async function getNotifications(userId) {
  return apiRequest(`/api/notifications/users/${userId}`);
}

export async function markNotificationAsRead(notificationId) {
  return apiRequest(`/api/notifications/${notificationId}/read`, { method: "PATCH" });
}

export async function markAllAsRead(userId) {
  const notifications = await getNotifications(userId);
  const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

  await Promise.all(unreadIds.map(markNotificationAsRead));

  return unreadIds.length;
}
