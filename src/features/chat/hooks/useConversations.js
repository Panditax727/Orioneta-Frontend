import { useState, useEffect, useCallback, useRef } from "react";
import { chatService } from "../services/chatService";
import { subscribeRealtimeEvents } from "../../realtime/services/realtimeService";
import { getSession } from "../../auth/session";

export function useConversations(type = "dms") {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const normalizedType = type === "chats" ? "dms" : type;
  const fetchingRef = useRef(false);
  const currentUserIdRef = useRef(null);

  useEffect(() => {
    const session = getSession();
    currentUserIdRef.current = session?.profile?.userID || session?.profile?.userId || null;
  }, []);

  const fetchConversations = useCallback(async ({ silent = false } = {}) => {
    if (fetchingRef.current) {
      return;
    }

    try {
      fetchingRef.current = true;

      if (!silent) {
        setLoading(true);
      }

      const data = normalizedType === "dms"
        ? await chatService.getDirectMessages()
        : await chatService.getChannels();
      setConversations((currentConversations) => (
        areConversationsEqual(currentConversations, data)
          ? currentConversations
          : data
      ));
      setError(null);
    } catch (err) {
      if (!silent) {
        setError(err.message);
      }
    } finally {
      fetchingRef.current = false;

      if (!silent) {
        setLoading(false);
      }
    }
  }, [normalizedType]);

  const searchConversations = useCallback(async (query) => {
    try {
      const results = await chatService.searchConversations(query, normalizedType);
      return normalizedType === "dms" ? results.dms : results.channels;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [normalizedType]);

  const createConversation = useCallback(async (target) => {
    try {
      setError(null);
      const conversation = await chatService.createDirectConversation({ target });
      await fetchConversations();
      return conversation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchConversations]);

  const createGroupConversation = useCallback(async ({ name, description, bio, photoFile, participantIds }) => {
    try {
      setError(null);
      const conversation = await chatService.createGroupConversation({
        name,
        description,
        bio,
        photoFile,
        participantIds,
      });
      await fetchConversations();
      return conversation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchConversations]);

  const deleteConversation = useCallback(async (conversationId, options = {}) => {
    try {
      setError(null);
      await chatService.deleteConversation(conversationId, options);
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateConversation = useCallback(async (conversationId, updates) => {
    try {
      setError(null);
      const updated = await chatService.updateConversation(conversationId, updates);
      setConversations((prev) =>
        prev.map((conv) => (conv.id === conversationId ? { ...conv, ...updated } : conv)),
      );
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (conversationId) => {
    try {
      await chatService.markAsRead(conversationId);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unread: 0 } : conv
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchConversations();
    });
  }, [fetchConversations]);

  useEffect(() => chatService.subscribe(() => {
    void fetchConversations({ silent: true });
  }), [fetchConversations]);

  useEffect(() => subscribeRealtimeEvents((event) => {
    if (event.type === "MESSAGE_SENT" && event.conversationId) {
      if (String(event.senderId) === String(currentUserIdRef.current)) return;
      setConversations((prev) => {
        const index = prev.findIndex((c) => String(c.id) === String(event.conversationId));
        if (index === -1) return prev;
        const conv = prev[index];
        const updated = [...prev];
        updated.splice(index, 1);
        const lastMsg = event.content || conv.lastMessage;
        const time = event.occurredAt
          ? new Date(event.occurredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : conv.time;
        updated.unshift({
          ...conv,
          unread: (conv.unread || 0) + 1,
          lastMessage: lastMsg,
          time,
        });
        return updated;
      });
    }
  }), []);

  return {
    conversations,
    loading,
    error,
    searchConversations,
    createConversation,
    createGroupConversation,
    deleteConversation,
    updateConversation,
    markAsRead,
    refetch: fetchConversations,
  };
}

function areConversationsEqual(currentConversations, nextConversations) {
  if (currentConversations.length !== nextConversations.length) {
    return false;
  }

  return currentConversations.every((conversation, index) => {
    const nextConversation = nextConversations[index];

    return conversation.id === nextConversation.id
      && conversation.name === nextConversation.name
      && conversation.lastMessage === nextConversation.lastMessage
      && conversation.time === nextConversation.time
      && conversation.unread === nextConversation.unread
      && conversation.avatarPhoto === nextConversation.avatarPhoto
      && conversation.bio === nextConversation.bio
      && conversation.online === nextConversation.online;
  });
}
