import { useRealtimeConnection } from "../../features/realtime/hooks/useRealtimeConnection";

export function useWebSocket() {
  return useRealtimeConnection();
}
