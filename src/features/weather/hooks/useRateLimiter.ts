// useRateLimiter.ts
import { useRef } from 'react';

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
  if (trackerRef.current.size === 0) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as [string, RateLimitEntry[]][];
        trackerRef.current = new Map(parsed);
      }
    } catch {
      trackerRef.current = new Map();
    }
  }

  const persist = () => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(trackerRef.current.entries()))
      );
    } catch (error) {
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
