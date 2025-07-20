// useSearchCache.ts
import { useRef } from 'react';

import type { CachedSearchResult } from '@/core/types/common.types';

type UseSearchCacheOptions = {
  maxCacheSize?: number;
  cacheTTL?: number;
  storageKey?: string;
};

export function useSearchCache({
  maxCacheSize = 100,
  cacheTTL = 5 * 60 * 1000,
  storageKey = 'region_search_cache',
}: UseSearchCacheOptions = {}) {
  const cacheRef = useRef<Map<string, CachedSearchResult>>(new Map());

  // Load cache from localStorage on first use
  if (cacheRef.current.size === 0) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as [string, CachedSearchResult][];
        cacheRef.current = new Map(parsed);
      }
    } catch {
      cacheRef.current = new Map();
    }
  }

  const persist = () => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(cacheRef.current.entries()))
      );
    } catch (error) {
      console.error('Failed to persist cache:', error);
    }
  };

  const evictLRU = () => {
    if (cacheRef.current.size <= maxCacheSize) return;
    let oldestKey = '';
    let oldestTime = Date.now();
    for (const [key, result] of cacheRef.current.entries()) {
      if (result.lastAccessed < oldestTime) {
        oldestTime = result.lastAccessed;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      cacheRef.current.delete(oldestKey);
      persist();
    }
  };

  const setCache = (key: string, data: CachedSearchResult) => {
    evictLRU();
    cacheRef.current.set(key, { ...data, lastAccessed: Date.now() });
    persist();
  };

  const getCache = (key: string): CachedSearchResult | null => {
    const data = cacheRef.current.get(key);
    if (!data) return null;
    const now = Date.now();
    if (now - data.timestamp > cacheTTL) {
      cacheRef.current.delete(key);
      persist();
      return null;
    }
    data.lastAccessed = now;
    data.accessCount += 1;
    cacheRef.current.set(key, data);
    persist();
    return data;
  };

  const clearCache = () => {
    cacheRef.current.clear();
    persist();
  };

  return {
    setCache,
    getCache,
    clearCache,
    cache: cacheRef.current,
  };
}
