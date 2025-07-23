// useRateLimiter.ts
import { useRef } from 'react';

// Utility to check localStorage availability
function isLocalStorageAvailable() {
  try {
    const testKey = '__test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

type RateLimitConfig = {
  maxRequests: number;
  timeWindow: number; // ms
  storageKey?: string;
};

type RateLimitEntry = {
  timestamp: number;
};

export function useRateLimiter({
  maxRequests = 20,
  timeWindow = 60 * 1000,
  storageKey = 'region_search_rate_limit',
}: RateLimitConfig) {
  const trackerRef = useRef<Map<string, RateLimitEntry[]>>(new Map());

  // Load from localStorage on first use
  if (trackerRef.current.size === 0 && isLocalStorageAvailable()) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (pair: unknown) =>
              Array.isArray(pair) &&
              typeof pair[0] === 'string' &&
              Array.isArray(pair[1]) &&
              pair[1].every(
                (entry: unknown) =>
                  typeof entry === 'object' &&
                  entry !== null &&
                  typeof (entry as { timestamp?: unknown }).timestamp === 'number'
              )
          )
        ) {
          trackerRef.current = new Map(parsed as [string, RateLimitEntry[]][]);
        } else {
          // Invalid structure, reset
          trackerRef.current = new Map();
        }
      }
    } catch (e) {
      console.warn('Failed to parse rate limit tracker:', e);
      trackerRef.current = new Map();
    }
  }

  const persist = () => {
    if (!isLocalStorageAvailable()) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(trackerRef.current.entries()))
      );
    } catch (error) {
      // Quota exceeded or other error
      console.error('Failed to persist rate limit tracker:', error);
    }
  };

  const isRateLimited = (identifier: string): boolean => {
    const now = Date.now();
    const requests = trackerRef.current.get(identifier) ?? [];
    const validRequests = requests.filter(
      entry => now - entry.timestamp < timeWindow
    );
    trackerRef.current.set(identifier, validRequests);

    // Clean up old identifiers to avoid memory growth
    for (const [key, reqs] of trackerRef.current.entries()) {
      if (
        reqs.length === 0 ||
        reqs.every(entry => now - entry.timestamp >= timeWindow)
      ) {
        trackerRef.current.delete(key);
      }
    }

    persist();
    return validRequests.length >= maxRequests;
  };

  const addRequest = (identifier: string) => {
    const now = Date.now();
    const requests = trackerRef.current.get(identifier) ?? [];
    requests.push({ timestamp: now });
    trackerRef.current.set(identifier, requests);
    persist();
  };

  const clear = () => {
    trackerRef.current.clear();
    persist();
  };

  return {
    isRateLimited,
    addRequest,
    clear,
    tracker: trackerRef.current,
  };
}
