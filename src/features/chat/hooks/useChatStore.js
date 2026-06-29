import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { chatService } from "../services/chatService";
import { subscribeRealtimeEvents } from "../../realtime/services/realtimeService";
import { playFeedbackSound } from "../components/chat-area/chatUtils";
import { getSessionIdentity } from "../../auth/session";

export function useChatStore(selectedUserId) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const fetchingRef = useRef(false);
  const selectedConvIdRef = useRef(null);

  const normalizeType = "dms";

  const fetchConversations = useCallback(async ({ silent = false } = {}) => {
    if (fetchingRef.current) return;
    try {
      fetchingRef.current = true;
      if (!silent) setLoading(true);
      const data = await chatService.getDirectMessages();
      setConversations((current) => {
        if (areEqual(current, data)) return current;
        const unreadMap = {};
        for (const conv of data) {
          if (typeof conv.unread === "number" && conv.unread > 0) {
            unreadMap[conv.id] = conv.unread;
          }
        }
        setUnreadCounts((prev) => ({ ...prev, ...unreadMap }));
        return data;
      });
      setError(null);
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      fetchingRef.current = false;
      if (!silent) setLoading(false);
    }
  }, []);

  const markConversationAsRead = useCallback(async (conversationId) => {
    try {
      await chatService.markAsRead(conversationId);
      setUnreadCounts((prev) => {
        if (!prev[conversationId]) return prev;
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unread: 0 } : c,
        ),
      );
    } catch {}
  }, []);

  const selectConversation = useCallback((conversation) => {
    if (!conversation) return;
    setSelectedConversation(conversation);
    selectedConvIdRef.current = conversation.id || conversation.conversationId;
    const convId = selectedConvIdRef.current;
    if (convId) {
      setUnreadCounts((prev) => {
        if (!prev[convId]) return prev;
        const next = { ...prev };
        delete next[convId];
        return next;
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, unread: 0 } : c,
        ),
      );
      chatService.markAsRead(convId).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const currentUserId = getSessionIdentity()?.id;
    const unsub = subscribeRealtimeEvents((event) => {
      if (event.type === "MESSAGE_SENT" && event.conversationId) {
        const convId = String(event.conversationId);
        const isActive = String(selectedConvIdRef.current || "") === convId;
        const isOwnMessage = currentUserId && String(event.senderId) === String(currentUserId);

        if (!isActive && !isOwnMessage) {
          setConversations((prev) => {
            const idx = prev.findIndex((c) => String(c.id) === convId);
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = { ...updated[idx], unread: (updated[idx].unread || 0) + 1, lastMessage: event.content, time: event.occurredAt };
            return updated;
          });
          setUnreadCounts((prev) => ({
            ...prev,
            [convId]: (prev[convId] || 0) + 1,
          }));
          playFeedbackSound("receive");
        }
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    queueMicrotask(() => fetchConversations());
  }, [fetchConversations]);

  useEffect(() => {
    const sub = chatService.subscribe(() => fetchConversations({ silent: true }));
    return sub;
  }, [fetchConversations]);

  return useMemo(() => ({
    conversations,
    loading,
    error,
    selectedConversation,
    unreadCounts,
    selectConversation,
    markConversationAsRead,
    fetchConversations,
    totalUnread: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
  }), [conversations, loading, error, selectedConversation, unreadCounts, selectConversation, markConversationAsRead, fetchConversations]);
}

function areEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((conv, i) => {
    const other = b[i];
    return conv.id === other.id
      && conv.name === other.name
      && conv.lastMessage === other.lastMessage
      && conv.time === other.time
      && conv.unread === other.unread
      && conv.avatarPhoto === other.avatarPhoto
      && conv.bio === other.bio
      && conv.online === other.online;
  });
}
