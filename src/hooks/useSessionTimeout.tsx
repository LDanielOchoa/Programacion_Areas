import { useState, useEffect, useCallback } from 'react';

const TIMEOUT_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds
const WARNING_DURATION = 60 * 1000; // 1 minute warning before timeout

export const useSessionTimeout = () => {
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60); // 60 seconds for warning
  const [lastActivity, setLastActivity] = useState(Date.now());

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    setShowTimeoutWarning(false);
    setRemainingTime(60);
  }, []);

  const handleUserActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [handleUserActivity]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= TIMEOUT_DURATION - WARNING_DURATION && !showTimeoutWarning) {
        setShowTimeoutWarning(true);
      }

      if (showTimeoutWarning) {
        const remainingTimeInSeconds = Math.max(
          0,
          Math.ceil((TIMEOUT_DURATION - timeSinceLastActivity) / 1000)
        );
        setRemainingTime(remainingTimeInSeconds);

        if (remainingTimeInSeconds === 0) {
          // Session expired
          window.location.href = '/';
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity, showTimeoutWarning]);

  return {
    showTimeoutWarning,
    remainingTime,
    resetTimer
  };
};