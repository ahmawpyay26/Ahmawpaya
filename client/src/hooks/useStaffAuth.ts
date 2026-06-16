import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface StaffUser {
  id: number;
  username: string;
  fullName: string;
  phone?: string | null;
  role: "staff";
}

export function useStaffAuth() {
  const [staff, setStaff] = useState<StaffUser | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("staff_session");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [, setLocation] = useLocation();

  // Verify staff session from server cookie
  const { data: serverStaff, isLoading } = trpc.auth.staffMe.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (serverStaff) {
      setStaff(serverStaff);
      localStorage.setItem("staff_session", JSON.stringify(serverStaff));
    } else if (serverStaff === null && !isLoading) {
      // Server says no valid session - clear local state
      const saved = localStorage.getItem("staff_session");
      if (saved) {
        // Keep local state for now - it will be cleared on next login attempt
      }
    }
  }, [serverStaff, isLoading]);

  const login = useCallback((staffData: StaffUser) => {
    setStaff(staffData);
    localStorage.setItem("staff_session", JSON.stringify(staffData));
  }, []);

  const staffLogout = trpc.auth.staffLogout.useMutation();

  const logout = useCallback(() => {
    staffLogout.mutate(undefined, {
      onSettled: () => {
        setStaff(null);
        localStorage.removeItem("staff_session");
        setLocation("/staff-login");
      },
    });
  }, [setLocation, staffLogout]);

  return { staff, isAuthenticated: !!staff, loading: isLoading, login, logout };
}
