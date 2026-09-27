'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      sentinelRef.current = await navigator.wakeLock.request('screen');
      setIsLocked(true);

      sentinelRef.current.addEventListener('release', () => {
        setIsLocked(false);
        sentinelRef.current = null;
      });
    } catch {
      setIsLocked(false);
    }
  }, []);

  const releaseLock = useCallback(() => {
    if (sentinelRef.current) {
      sentinelRef.current.release().catch(() => {});
      sentinelRef.current = null;
      setIsLocked(false);
    }
  }, []);

  const toggleWakeLock = useCallback(() => {
    if (isLocked) {
      releaseLock();
    } else {
      requestLock();
    }
  }, [isLocked, releaseLock, requestLock]);

  // Re-acquire lock if tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLocked && !sentinelRef.current) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseLock();
    };
  }, [isLocked, requestLock, releaseLock]);

  return {
    isLocked,
    isSupported,
    toggleWakeLock,
    requestLock,
    releaseLock,
  };
}
