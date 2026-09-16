import { useEffect, useRef, useState } from "react";

export function useCountdown(seconds: number) {
  const [left, setLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => setLeft(seconds);
  const stop = () => setLeft(0);

  useEffect(() => {
    if (left <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setLeft((v) => Math.max(0, v - 1));
      }, 1000);
    }

    return () => {
      // keep interval running across renders; cleared when left hits 0
    };
  }, [left]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { left, start, stop, isRunning: left > 0 };
}