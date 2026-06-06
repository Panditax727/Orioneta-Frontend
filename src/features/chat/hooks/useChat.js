import { useState, useCallback, useEffect } from "react";
import { chatService } from "../services/chatService";

export function useChat(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const sendMessage = useCallback(async (content) => {
    if (!conversationId || !content.trim()) return;
    
    try {
      setSending(true);
      setError(null);
      const newMessage = await chatService.sendMessage(conversationId, content);
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSending(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    queueMicrotask(() => {
      void fetchMessages();
    });

    const intervalId = window.setInterval(() => {
      void fetchMessages();
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, [conversationId, fetchMessages]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    fetchMessages,
  };
}
