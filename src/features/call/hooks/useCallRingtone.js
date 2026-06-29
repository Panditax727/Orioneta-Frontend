import { useCallback, useEffect, useRef } from "react";
import { playFeedbackSound } from "../../chat/components/chat-area/chatUtils";

export function useCallRingtone() {
  const intervalRef = useRef(null);
  const runningRef = useRef(false);

  const start = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    await playFeedbackSound("call");
    intervalRef.current = window.setInterval(async () => {
      if (runningRef.current) await playFeedbackSound("call");
    }, 1500);
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return { startRingtone: start, stopRingtone: stop };
}
