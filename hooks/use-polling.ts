"use client";

import { useCallback, useEffect, useRef } from "react";

interface UsePollingOptions {
  intervalMs?: number;
  enabled?: boolean;
  onError?: (err: unknown) => void;
}

export function usePolling(
  fn: () => Promise<void>,
  { intervalMs = 10_000, enabled = true, onError }: UsePollingOptions = {},
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlightRef = useRef(false);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const start = useCallback(() => {
    stop();
    timerRef.current = setInterval(async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        await fnRef.current();
      } catch (err) {
        onErrorRef.current?.(err);
      } finally {
        inFlightRef.current = false;
      }
    }, intervalMs);
  }, [intervalMs, stop]);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return stop;
  }, [enabled, start, stop]);

  return { start, stop };
}
