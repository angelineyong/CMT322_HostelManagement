import { useEffect, useRef, useCallback } from "react";

// const INACTIVITY_TIMEOUT_MS = 10 * 1000; // 10 seconds for TESTING
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export function useInactivity(onTimeout: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(onTimeout, INACTIVITY_TIMEOUT_MS);
  }, [onTimeout]);

  useEffect(() => {
    // Only set up listeners if we have a session (handled by caller effectively,
    // but good to check if onTimeout is provided)

    // Check initial session status asynchronously if needed, but this hook
    // is primarily for when the user IS logged in.

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Initialize timer
    resetTimer();

    // Add listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer]);

  return resetTimer;
}
