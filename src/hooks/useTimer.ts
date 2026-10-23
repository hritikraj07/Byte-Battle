'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTimerProps {
  initialSeconds: number;
  onTimeout?: () => void;
  onTick?: (remaining: number) => void;
  autoStart?: boolean;
}

export function useTimer({ initialSeconds, onTimeout, onTick, autoStart = true }: UseTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [elapsed, setElapsed] = useState(0);

  const onTimeoutRef = useRef(onTimeout);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
    onTickRef.current = onTick;
  }, [onTimeout, onTick]);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setElapsed(0);
    setIsRunning(autoStart);
  }, [initialSeconds, autoStart]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          if (onTimeoutRef.current) onTimeoutRef.current();
          return 0;
        }
        const next = prev - 1;
        if (onTickRef.current) onTickRef.current(next);
        return next;
      });

      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => {
    if (secondsLeft > 0) setIsRunning(true);
  }, [secondsLeft]);

  const reset = useCallback((newSeconds?: number) => {
    const s = newSeconds ?? initialSeconds;
    setSecondsLeft(s);
    setElapsed(0);
    setIsRunning(false);
  }, [initialSeconds]);

  const addPenalty = useCallback((penaltySeconds: number) => {
    setSecondsLeft((prev) => Math.max(0, prev - penaltySeconds));
  }, []);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    secondsLeft,
    elapsed,
    isRunning,
    pause,
    resume,
    reset,
    addPenalty,
    formattedTime: formatTime(secondsLeft),
    formattedElapsed: formatTime(elapsed),
  };
}
