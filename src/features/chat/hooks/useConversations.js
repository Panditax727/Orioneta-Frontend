import { useState, useEffect, useCallback } from "react";
import { chatService } from "../services/chatService";

export function useConversations(type = "dms") {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = type === "dms" 
        ? await chatService.getDirectMessages()
        : await chatService.getChannels();
      setConversations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const searchConversations = useCallback(async (query) => {
    try {
      const results = await chatService.searchConversations(query, type);
      return type === "dms" ? results.dms : results.channels;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [type]);

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

  return {
    conversations,
    loading,
    error,
    searchConversations,
    markAsRead,
    refetch: fetchConversations,
  };
}
