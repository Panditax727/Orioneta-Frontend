import { useState, useCallback, useEffect, useRef } from "react";
import { subscribeRealtimeEvents } from "../../realtime/services/realtimeService";
import { chatService } from "../services/chatService";

export function useChat(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

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
      lastFetchTimeRef.current = Date.now();
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

  const pollTimerRef = useRef(null);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    queueMicrotask(() => {
      void fetchMessages();
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchMessages({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    pollTimerRef.current = window.setInterval(() => {
      void fetchMessages({ silent: true });
    }, 15000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    };
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    return subscribeRealtimeEvents((event) => {
      if (!isMessageEventForConversation(event, conversationId)) {
        return;
      }

      if (event.type === "MESSAGE_SENT") {
        const newMsg = normalizeMessageFromEvent(event);
        if (newMsg) {
          setMessages((prev) => upsertMessages(prev, [newMsg]));
        }
        setTimeout(() => fetchMessages({ silent: true }), 200);
      } else {
        void fetchMessages({ silent: true });
      }
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

function normalizeMessageFromEvent(event) {
  if (!event || !event.messageId) return null;
  const createdAt = event.occurredAt ? new Date(event.occurredAt).toISOString() : new Date().toISOString();
  return {
    id: event.messageId,
    conversationId: event.conversationId,
    senderId: event.senderId,
    sender: event.senderName || "",
    senderInitial: (event.senderName || "?")[0]?.toUpperCase() || "?",
    senderAvatarPhoto: event.senderAvatar || "",
    content: event.content || "",
    type: event.messageType || "TEXT",
    status: "SENT",
    mine: false,
    edited: false,
    createdAt,
    time: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    attachment: null,
  };
}

function isMessageEventForConversation(event, conversationId) {
  if (!event?.type || !event?.conversationId) {
    return false;
  }

  if (event.type !== "MESSAGE_SENT" && event.type !== "MESSAGE_EDITED") {
    return false;
  }

  if (String(event.conversationId) === String(conversationId)) {
    return true;
  }

  return chatService.isConversationAlias(conversationId, event.conversationId);
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
      && message.edited === nextMessage.edited
      && message.senderAvatarPhoto === nextMessage.senderAvatarPhoto;
  });
}

function upsertMessages(currentMessages, nextMessages) {
  const currentById = new Map(currentMessages.map((m) => [m.id, m]));
  const messagesById = new Map();

  [...currentMessages, ...nextMessages].forEach((message) => {
    if (messagesById.has(message.id)) return;
    const existing = currentById.get(message.id);
    if (existing && message.mine === false && existing.mine === true) {
      messagesById.set(message.id, { ...message, mine: true });
    } else {
      messagesById.set(message.id, message);
    }
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
