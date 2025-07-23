// useAnalytics.ts
import { useRef } from 'react';

import type { ErrorType } from '@/core/components/search/types/common';

type AnalyticsData = {
  totalSearches: number;
  errorsByType: Record<ErrorType, number>;
  responseTimes: number[];
  peakUsageHours: number[];
};

type UseAnalyticsOptions = {
  storageKey?: string;
  maxResponseTimes?: number;
};

export function useAnalytics({
  storageKey = 'region_search_analytics',
  maxResponseTimes = 100,
}: UseAnalyticsOptions = {}) {
  const analyticsRef = useRef<AnalyticsData>({
    totalSearches: 0,
    errorsByType: {} as Record<ErrorType, number>,
    responseTimes: [],
    peakUsageHours: new Array(24).fill(0) as number[],
  });

  // Load from localStorage on first use
  if (analyticsRef.current.totalSearches === 0) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        analyticsRef.current = JSON.parse(raw) as AnalyticsData;
      }
    } catch {
      analyticsRef.current = {
        totalSearches: 0,
        errorsByType: {} as Record<ErrorType, number>,
        responseTimes: [],
        peakUsageHours: new Array(24).fill(0) as number[],
      };
    }
  }

  const persist = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(analyticsRef.current));
    } catch (error) {
      console.error('Failed to persist analytics data:', error);
    }
  };

  const trackSearch = (responseTime?: number) => {
    analyticsRef.current.totalSearches += 1;
    if (responseTime !== undefined) {
      analyticsRef.current.responseTimes.push(responseTime);
      if (analyticsRef.current.responseTimes.length > maxResponseTimes) {
        analyticsRef.current.responseTimes.shift();
      }
    }
    const hour = new Date().getHours();
    analyticsRef.current.peakUsageHours[hour] += 1;
    persist();
  };

  const trackError = (type: ErrorType) => {
    analyticsRef.current.errorsByType[type] =
      (analyticsRef.current.errorsByType[type] || 0) + 1;
    persist();
  };

  const clear = () => {
    analyticsRef.current = {
      totalSearches: 0,
      errorsByType: {} as Record<ErrorType, number>,
      responseTimes: [],
      peakUsageHours: new Array(24).fill(0) as number[],
    };
    persist();
  };

  const getAnalytics = () => ({
    ...analyticsRef.current,
    averageResponseTime:
      analyticsRef.current.responseTimes.length > 0
        ? analyticsRef.current.responseTimes.reduce((a, b) => a + b, 0) /
          analyticsRef.current.responseTimes.length
        : 0,
  });

  return {
    trackSearch,
    trackError,
    clear,
    getAnalytics,
    analytics: analyticsRef.current,
  };
}
