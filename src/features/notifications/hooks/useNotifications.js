import { useCallback, useEffect, useRef, useState } from "react";
import { getSession, subscribeToSessionChanges } from "../../auth/session";
import { getNotifications, markNotificationAsRead, markAllAsRead } from "../services/notificationService";
import { subscribeRealtimeEvents } from "../../realtime/services/realtimeService";
import { findUserById } from "../../../services/userService";
import { playFeedbackSound } from "../../chat/components/chat-area/chatUtils";

const POLL_INTERVAL = 30000;

function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffMin < 1440) return `Hace ${Math.floor(diffMin / 60)}h`;
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

function buildNotificationFromRealtimeEvent(event) {
  const base = {
    id: event.clientEventId || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    read: false,
    createdAt: event.occurredAt || new Date().toISOString(),
  };

  switch (event.type) {
    case "MESSAGE_SENT":
      return {
        ...base,
        type: "MESSAGE_SENT",
        title: event.senderName || "Nuevo mensaje",
        body: event.content || "Tienes un mensaje nuevo",
        conversationId: event.conversationId,
        senderId: event.senderId,
        senderName: event.senderName,
        senderAvatar: event.senderAvatar,
      };
    case "FRIEND_REQUEST_SENT":
      return {
        ...base,
        type: "FRIEND_REQUEST_SENT",
        title: event.senderName || "Solicitud de amistad",
        body: event.senderName
          ? `${event.senderName} quiere ser tu amigo`
          : "Alguien quiere ser tu amigo",
        senderId: event.senderId,
        senderName: event.senderName,
        senderAvatar: event.senderAvatar,
      };
    case "FRIEND_REQUEST_ACCEPTED":
      return {
        ...base,
        type: "FRIEND_REQUEST_ACCEPTED",
        title: event.senderName || "Solicitud aceptada",
        body: event.senderName
          ? `${event.senderName} acepto tu solicitud`
          : "Tu solicitud de amistad fue aceptada",
        senderId: event.senderId,
        senderName: event.senderName,
        senderAvatar: event.senderAvatar,
      };
    case "NOTIFICATION_CREATED":
      return {
        ...base,
        type: event.notificationType || "NOTIFICATION",
        title: event.title || "Notificacion",
        body: event.body || "",
        conversationId: event.conversationId,
        senderId: event.senderId,
        senderName: event.senderName,
        senderAvatar: event.senderAvatar,
      };
    default:
      return null;
  }
}

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadIds, setUnreadIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);
  const userIdRef = useRef(null);
  const previousUnreadCountRef = useRef(0);

  const showToast = useCallback((notification) => {
    window.dispatchEvent(new CustomEvent("orioneta.notification.new", { detail: notification }));
  }, []);

  const addNotification = useCallback(async (notification) => {
    let enriched = notification;

    if (notification.senderId && !enriched.senderName && !enriched.senderAvatar) {
      try {
        const profile = await findUserById(notification.senderId);
        if (profile) {
          enriched = {
            ...notification,
            senderName: profile.displayName || profile.userName || enriched.senderName,
            senderAvatar: profile.profilePhoto || profile.avatarUrl || enriched.senderAvatar,
          };
        }
      } catch {}
    }

    setNotifications((prev) => [enriched, ...prev]);
    setUnreadIds((prev) => new Set(prev).add(enriched.id));
    previousUnreadCountRef.current += 1;
    showToast(enriched);
    playFeedbackSound("receive");
  }, [showToast]);

  const fetchNotifications = useCallback(async () => {
    const session = getSession();
    const userId = session?.profile?.userID || session?.profileUserId;

    if (!userId) {
      setNotifications([]);
      setUnreadIds(new Set());
      userIdRef.current = null;
      return;
    }

    userIdRef.current = userId;

    try {
      setLoading(true);
      const data = await getNotifications(userId);
      const rawList = Array.isArray(data) ? data : [];

      const enrichedList = await Promise.all(rawList.map(async (n) => {
        if (n.senderId && !n.senderName && !n.senderAvatar) {
          try {
            const profile = await findUserById(n.senderId);
            if (profile) {
              return {
                ...n,
                senderName: profile.displayName || profile.userName || n.senderName,
                senderAvatar: profile.profilePhoto || profile.avatarUrl || n.senderAvatar,
              };
            }
          } catch {}
        }
        return n;
      }));

      const newUnreadIds = new Set(enrichedList.filter((n) => !n.read).map((n) => n.id));
      const previousCount = previousUnreadCountRef.current;

      setNotifications(enrichedList);
      setUnreadIds(newUnreadIds);
      previousUnreadCountRef.current = newUnreadIds.size;
      setError(null);

      if (newUnreadIds.size > previousCount) {
        const newest = enrichedList.find((n) => !n.read)
          || enrichedList[0];
        if (newest) showToast(newest);
      }

      return enrichedList;
    } catch (err) {
      setError(err.message || "No se pudieron cargar las notificaciones");
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setUnreadIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n,
        ),
      );
    } catch (err) {
      console.error("Error al marcar notificacion como leida:", err);
    }
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(notificationId);
      return next;
    });
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    const session = getSession();
    const userId = session?.profile?.userID || session?.profileUserId;
    if (!userId) return;

    try {
      const count = await markAllAsRead(userId);
      setUnreadIds(new Set());
      setNotifications((prev) =>
        prev.map((n) => (n.read ? n : { ...n, read: true, readAt: new Date().toISOString() })),
      );
    } catch (err) {
      console.error("Error al marcar todo como leido:", err);
    }
  }, []);

  const unreadCount = unreadIds.size;

  useEffect(() => {
    const session = getSession();
    const userId = session?.profile?.userID || session?.profileUserId;
    if (userId) {
      void fetchNotifications();
    }

    pollingRef.current = window.setInterval(fetchNotifications, POLL_INTERVAL);

    const unsubscribe = subscribeToSessionChanges(() => {
      const nextSession = getSession();
      const nextUserId = nextSession?.profile?.userID || nextSession?.profileUserId;

      if (nextUserId !== userIdRef.current) {
        if (nextUserId) {
          void fetchNotifications();
        } else {
          setNotifications([]);
          setUnreadIds(new Set());
        }
      }
    });

    return () => {
      window.clearInterval(pollingRef.current);
      unsubscribe();
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const unsub = subscribeRealtimeEvents((event) => {
      if (!userIdRef.current) return;

      if (event.type === "MESSAGE_SENT" && String(event.senderId) === String(userIdRef.current)) {
        return;
      }

      if (["MESSAGE_SENT", "FRIEND_REQUEST_SENT", "FRIEND_REQUEST_ACCEPTED", "NOTIFICATION_CREATED"].includes(event.type)) {
        const notification = buildNotificationFromRealtimeEvent(event);
        if (notification) {
          addNotification(notification);
        }
      }
    });

    return unsub;
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    removeNotification,
    markAllAsRead: handleMarkAllAsRead,
    fetchNotifications,
    formatTime,
  };
}
