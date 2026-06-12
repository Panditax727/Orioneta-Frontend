import { API_BASE_URL } from "../../../services/apiClient";

export const REALTIME_INCOMING_EVENT = "orioneta.realtime.incoming";
export const REALTIME_OUTGOING_EVENT = "orioneta.realtime.outgoing";

const REALTIME_BASE_URL =
  import.meta.env.VITE_REALTIME_BASE_URL || API_BASE_URL || "";

export function resolveRealtimeUrl(userId) {
  const url = new URL(
    REALTIME_BASE_URL || window.location.origin,
    window.location.origin,
  );

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/chat";
  url.search = "";

  if (userId) {
    url.searchParams.set("userId", userId);
  }

  return url.toString();
}

export function publishRealtimeEvent(event) {
  window.dispatchEvent(new CustomEvent(REALTIME_OUTGOING_EVENT, {
    detail: {
      clientEventId: createClientEventId(),
      occurredAt: new Date().toISOString(),
      ...event,
    },
  }));
}

export function dispatchRealtimeEvent(event) {
  window.dispatchEvent(new CustomEvent(REALTIME_INCOMING_EVENT, {
    detail: event,
  }));
}

export function subscribeRealtimeEvents(callback) {
  const handleEvent = (event) => callback(event.detail);

  window.addEventListener(REALTIME_INCOMING_EVENT, handleEvent);
  return () => window.removeEventListener(REALTIME_INCOMING_EVENT, handleEvent);
}

export function subscribeOutgoingRealtimeEvents(callback) {
  const handleEvent = (event) => callback(event.detail);

  window.addEventListener(REALTIME_OUTGOING_EVENT, handleEvent);
  return () => window.removeEventListener(REALTIME_OUTGOING_EVENT, handleEvent);
}

export function parseRealtimePayload(payload) {
  try {
    return typeof payload === "string" ? JSON.parse(payload) : payload;
  } catch {
    return {
      type: "RAW",
      payload,
      occurredAt: new Date().toISOString(),
    };
  }
}

function createClientEventId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
