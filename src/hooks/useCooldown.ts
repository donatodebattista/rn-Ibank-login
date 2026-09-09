import { useState, useEffect, useRef, useCallback } from 'react';

export function useCooldown(initialSeconds: number = 60) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCooldown = useCallback(
    (seconds: number = initialSeconds) => {
      clearTimer();
      setSecondsLeft(seconds);

      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [initialSeconds, clearTimer]
  );

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    isCoolingDown: secondsLeft > 0,
    secondsLeft,
    startCooldown,
    resetCooldown: () => {
      clearTimer();
      setSecondsLeft(0);
    },
  };
}
