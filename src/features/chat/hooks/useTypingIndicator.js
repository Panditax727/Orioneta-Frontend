import { useEffect, useRef, useCallback, useState } from "react";
import { publishRealtimeEvent, subscribeRealtimeEvents } from "../../realtime/services/realtimeService";

const TYPING_TIMEOUT = 3000;
const TYPING_PUBLISH_INTERVAL = 4000;

export function useTypingIndicator(conversationId, currentUserId) {
  const [typingUsers, setTypingUsers] = useState({});
  const lastPublishedRef = useRef(0);
  const typingTimeoutRef = useRef(null);

  const publishTyping = useCallback((type) => {
    if (!conversationId || !currentUserId) return;

    const now = Date.now();
    if (now - lastPublishedRef.current < TYPING_PUBLISH_INTERVAL) return;
    lastPublishedRef.current = now;

    publishRealtimeEvent({
      type,
      conversationId,
      senderId: currentUserId,
      occurredAt: new Date().toISOString(),
    });
  }, [conversationId, currentUserId]);

  const onUserTyping = useCallback(() => {
    publishTyping("TYPING_START");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      publishTyping("TYPING_STOP");
    }, TYPING_TIMEOUT);
  }, [publishTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (conversationId && currentUserId) {
        publishRealtimeEvent({
          type: "TYPING_STOP",
          conversationId,
          senderId: currentUserId,
          occurredAt: new Date().toISOString(),
        });
      }
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (!conversationId) return;

    return subscribeRealtimeEvents((event) => {
      if (event.type === "TYPING_START" && String(event.conversationId) === String(conversationId) && String(event.senderId) !== String(currentUserId)) {
        setTypingUsers((prev) => ({
          ...prev,
          [event.senderId]: event.occurredAt || Date.now(),
        }));
      }

      if (event.type === "TYPING_STOP" && String(event.conversationId) === String(conversationId)) {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[event.senderId];
          return next;
        });
      }
    });
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (Object.keys(typingUsers).length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        const next = { ...prev };
        for (const [userId, timestamp] of Object.entries(next)) {
          if (now - new Date(timestamp).getTime() > TYPING_TIMEOUT) {
            delete next[userId];
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [typingUsers]);

  return { typingUsers, onUserTyping };
}
