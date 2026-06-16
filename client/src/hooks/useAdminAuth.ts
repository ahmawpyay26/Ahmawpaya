import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function useAdminAuth() {
  const { data: admin, isLoading, error } = trpc.adminAuth.me.useQuery(undefined, {
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  const [, navigate] = useLocation();

  const logoutMutation = trpc.adminAuth.logout.useMutation({
    onSuccess: () => {
      navigate("/admin-login");
      // Force refetch
      window.location.reload();
    },
  });

  return {
    admin,
    isAuthenticated: !!admin,
    isLoading,
    error,
    logout: () => logoutMutation.mutate(),
    logoutLoading: logoutMutation.isPending,
  };
}
