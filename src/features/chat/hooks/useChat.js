import { useState, useCallback, useEffect, useRef } from "react";
import { subscribeRealtimeEvents } from "../../realtime/services/realtimeService";
import { chatService } from "../services/chatService";

export function useChat(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchMessages = useCallback(async ({ silent = false } = {}) => {
    if (!conversationId) return;

    if (fetchingRef.current) {
      return;
    }
    
    try {
      fetchingRef.current = true;

      if (!silent) {
        setLoading(true);
      }

      const data = await chatService.getMessages(conversationId);
      setMessages((currentMessages) => (
        areMessagesEqual(currentMessages, data) ? currentMessages : data
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
  }, [conversationId]);

  const sendMessage = useCallback(async (content, options = {}) => {
    if (!conversationId || !content.trim()) return;
    
    try {
      setSending(true);
      setError(null);
      const newMessage = await chatService.sendMessage(
        conversationId,
        content,
        options.type || "TEXT",
      );
      setMessages((currentMessages) =>
        upsertMessages(currentMessages, [newMessage]),
      );
      return newMessage;
    } catch (err) {
      const recoveredMessages = await chatService.getMessages(conversationId)
        .catch(() => null);
      const recoveredMessage = findRecoveredSentMessage(
        recoveredMessages,
        content,
        options.type || "TEXT",
      );

      if (recoveredMessage) {
        setMessages((currentMessages) =>
          upsertMessages(currentMessages, recoveredMessages),
        );
        setError(null);
        return recoveredMessage;
      }

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
      if (document.visibilityState === "visible") {
        void fetchMessages({ silent: true });
      }
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    return subscribeRealtimeEvents((event) => {
      if (!isMessageEventForConversation(event, conversationId)) {
        return;
      }

      void fetchMessages({ silent: true });
    });
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

function isMessageEventForConversation(event, conversationId) {
  if (!event?.type || !event?.conversationId) {
    return false;
  }

  return event.type === "MESSAGE_SENT"
    && chatService.isConversationAlias(conversationId, event.conversationId);
}

function areMessagesEqual(currentMessages, nextMessages) {
  if (currentMessages.length !== nextMessages.length) {
    return false;
  }

  return currentMessages.every((message, index) => {
    const nextMessage = nextMessages[index];

    return message.id === nextMessage.id
      && message.content === nextMessage.content
      && message.status === nextMessage.status
      && message.senderAvatarPhoto === nextMessage.senderAvatarPhoto;
  });
}

function upsertMessages(currentMessages, nextMessages) {
  const messagesById = new Map();

  [...currentMessages, ...nextMessages].forEach((message) => {
    messagesById.set(message.id, message);
  });

  return [...messagesById.values()].sort((a, b) => {
    const aTimestamp = Date.parse(a.createdAt || "");
    const bTimestamp = Date.parse(b.createdAt || "");

    if (Number.isNaN(aTimestamp) || Number.isNaN(bTimestamp)) {
      return 0;
    }

    return aTimestamp - bTimestamp;
  });
}

function findRecoveredSentMessage(messages, content, type) {
  if (!Array.isArray(messages)) {
    return null;
  }

  return [...messages]
    .reverse()
    .find((message) =>
      message.mine &&
      message.content === content &&
      (message.type || "TEXT") === type,
    ) || null;
}
