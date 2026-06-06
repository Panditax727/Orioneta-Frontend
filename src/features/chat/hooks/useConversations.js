import { useState, useEffect, useCallback } from "react";
import { chatService } from "../services/chatService";

export function useConversations(type = "dms") {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const normalizedType = type === "chats" ? "dms" : type;

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = normalizedType === "dms"
        ? await chatService.getDirectMessages()
        : await chatService.getChannels();
      setConversations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    void fetchConversations();
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
