import { useEffect, useState } from "react";

export interface OfflineData {
  isOnline: boolean;
  lastSyncTime: number | null;
  pendingMutations: Array<{
    id: string;
    type: string;
    data: unknown;
    timestamp: number;
  }>;
}

const STORAGE_KEY = "amaw_offline_state";

export function useOfflineState() {
  const [offlineState, setOfflineState] = useState<OfflineData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load offline state:", e);
    }
    return {
      isOnline: navigator.onLine,
      lastSyncTime: null,
      pendingMutations: [],
    };
  });

  useEffect(() => {
    const handleOnline = () => {
      setOfflineState((prev) => ({
        ...prev,
        isOnline: true,
        lastSyncTime: Date.now(),
      }));
    };

    const handleOffline = () => {
      setOfflineState((prev) => ({
        ...prev,
        isOnline: false,
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offlineState));
    } catch (e) {
      console.error("Failed to save offline state:", e);
    }
  }, [offlineState]);

  const addPendingMutation = (type: string, data: unknown) => {
    const mutation = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
    };

    setOfflineState((prev) => ({
      ...prev,
      pendingMutations: [...prev.pendingMutations, mutation],
    }));

    return mutation.id;
  };

  const removePendingMutation = (id: string) => {
    setOfflineState((prev) => ({
      ...prev,
      pendingMutations: prev.pendingMutations.filter((m) => m.id !== id),
    }));
  };

  const clearPendingMutations = () => {
    setOfflineState((prev) => ({
      ...prev,
      pendingMutations: [],
    }));
  };

  return {
    isOnline: offlineState.isOnline,
    lastSyncTime: offlineState.lastSyncTime,
    pendingMutations: offlineState.pendingMutations,
    addPendingMutation,
    removePendingMutation,
    clearPendingMutations,
  };
}
