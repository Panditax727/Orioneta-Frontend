import { useState, useEffect, useCallback } from "react";
import { chatService } from "../services/chatService";

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchConversations = useCallback(async (query, filter = "all") => {
    try {
      const results = await chatService.searchConversations(query, filter);
      return results;
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
    fetchConversations();
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
