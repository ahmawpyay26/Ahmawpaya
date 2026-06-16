import { useEffect, useState } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

const CACHE_PREFIX = "amaw_cache_";

export function useOfflineCache<T>(
  key: string,
  ttl: number = 24 * 60 * 60 * 1000 // 24 hours default
) {
  const cacheKey = `${CACHE_PREFIX}${key}`;

  const getCachedData = (): T | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();
      const age = now - entry.timestamp;

      // Check if cache has expired
      if (entry.ttl && age > entry.ttl) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return entry.data;
    } catch (e) {
      console.error(`Failed to get cached data for ${key}:`, e);
      return null;
    }
  };

  const setCachedData = (data: T) => {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (e) {
      console.error(`Failed to cache data for ${key}:`, e);
    }
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(cacheKey);
    } catch (e) {
      console.error(`Failed to clear cache for ${key}:`, e);
    }
  };

  return {
    getCachedData,
    setCachedData,
    clearCache,
  };
}

// Utility to clear all offline caches
export function clearAllOfflineCaches() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error("Failed to clear all offline caches:", e);
  }
}
