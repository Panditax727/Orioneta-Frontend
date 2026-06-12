import { useState, useEffect, useCallback, useRef } from "react";
import { chatService } from "../services/chatService";

export function useConversations(type = "dms") {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const normalizedType = type === "chats" ? "dms" : type;
  const fetchingRef = useRef(false);

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

  return {
    conversations,
    loading,
    error,
    searchConversations,
    createConversation,
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
      && conversation.online === nextConversation.online;
  });
}
