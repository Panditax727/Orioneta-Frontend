import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  dispatchRealtimeEvent,
  parseRealtimePayload,
  resolveRealtimeUrl,
  subscribeOutgoingRealtimeEvents,
} from "../services/realtimeService";
import {
  getSession,
  getSessionIdentity,
  subscribeToSessionChanges,
} from "../../auth/session";
import { ensureCurrentUserProfile } from "../../../services/userService";

const STATUS_LABELS = {
  idle: "Tiempo real inactivo",
  connecting: "Conectando realtime",
  connected: "Tiempo real conectado",
  reconnecting: "Reconectando realtime",
  disconnected: "Tiempo real desconectado",
  error: "Realtime no disponible",
};

export function useRealtimeConnection() {
  const socketRef = useRef(null);
  const connectRef = useRef(null);
  const retryTimerRef = useRef(null);
  const retryCountRef = useRef(0);
  const manualCloseRef = useRef(false);
  const pendingOutgoingEventsRef = useRef([]);
  const [status, setStatus] = useState("idle");
  const [lastEventAt, setLastEventAt] = useState(null);
  const [sessionIdentity, setSessionIdentity] = useState(() => getSessionIdentity());

  const disconnect = useCallback(() => {
    manualCloseRef.current = true;
    window.clearTimeout(retryTimerRef.current);

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setStatus("disconnected");
  }, []);

  const scheduleReconnect = useCallback((delay) => {
    window.clearTimeout(retryTimerRef.current);
    retryTimerRef.current = window.setTimeout(() => {
      void connectRef.current?.({ reconnect: true });
    }, delay);
  }, []);

  const connect = useCallback(async ({ reconnect = false } = {}) => {
    window.clearTimeout(retryTimerRef.current);
    manualCloseRef.current = false;

    const session = getSession();

    if (!session) {
      setStatus("idle");
      return;
    }

    try {
      setStatus(reconnect ? "reconnecting" : "connecting");

      const activeSocket = socketRef.current;

      if (
        activeSocket?.readyState === WebSocket.OPEN
        || activeSocket?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      const profile = session.profile?.userID
        ? session.profile
        : await ensureCurrentUserProfile();
      const socket = new WebSocket(resolveRealtimeUrl(profile.userID));

      socketRef.current = socket;

      socket.addEventListener("open", () => {
        retryCountRef.current = 0;
        setStatus("connected");
        flushPendingOutgoingEvents(socket, pendingOutgoingEventsRef);
      });

      socket.addEventListener("message", (event) => {
        const payload = parseRealtimePayload(event.data);
        setLastEventAt(new Date());
        dispatchRealtimeEvent(payload);
      });

      socket.addEventListener("close", () => {
        if (socketRef.current !== socket) {
          return;
        }

        socketRef.current = null;

        if (manualCloseRef.current) {
          return;
        }

        setStatus("reconnecting");
        const retryDelay = Math.min(10000, 900 * 2 ** retryCountRef.current);
        retryCountRef.current += 1;
        scheduleReconnect(retryDelay);
      });

      socket.addEventListener("error", () => {
        setStatus("error");
      });
    } catch {
      setStatus("error");
      scheduleReconnect(2500);
    }
  }, [scheduleReconnect]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      manualCloseRef.current = true;
      socketRef.current.close();
      socketRef.current = null;
    }

    retryCountRef.current = 0;
    void connect({ reconnect: true });
  }, [connect]);

  useEffect(() => {
    queueMicrotask(() => {
      void connect();
    });

    return () => {
      manualCloseRef.current = true;
      window.clearTimeout(retryTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [connect, sessionIdentity]);

  useEffect(() => subscribeToSessionChanges((nextSession) => {
    const nextIdentity = getSessionIdentity(nextSession);

    if (nextIdentity !== sessionIdentity) {
      setSessionIdentity(nextIdentity);
    }
  }), [sessionIdentity]);

  useEffect(() => subscribeOutgoingRealtimeEvents((event) => {
    const socket = socketRef.current;

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(event));
      return;
    }

    pendingOutgoingEventsRef.current = [
      ...pendingOutgoingEventsRef.current.slice(-24),
      event,
    ];

    if (!socket || socket.readyState === WebSocket.CLOSED) {
      void connectRef.current?.({ reconnect: true });
    }
  }), []);

  return useMemo(() => ({
    status,
    label: STATUS_LABELS[status] || STATUS_LABELS.idle,
    connected: status === "connected",
    lastEventAt,
    reconnect,
    disconnect,
  }), [disconnect, lastEventAt, reconnect, status]);
}

function flushPendingOutgoingEvents(socket, pendingOutgoingEventsRef) {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  const pendingEvents = pendingOutgoingEventsRef.current;
  pendingOutgoingEventsRef.current = [];

  pendingEvents.forEach((event) => {
    socket.send(JSON.stringify(event));
  });
}
