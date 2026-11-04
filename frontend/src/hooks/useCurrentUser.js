import { useQuery } from "@tanstack/react-query";
import { authService } from "../api/authService";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.getMe,
    enabled: !!token, // Hanya panggil jika token login tersedia
    staleTime: 1000 * 60 * 2, // Data dianggap segar selama 2 menit
    retry: 1,
  });

  // Sinkronkan data terbaru dari database ke Zustand store
  useEffect(() => {
    if (query.data) {
      updateUser(query.data);
    }
  }, [query.data, updateUser]);

  // Logout otomatis jika token kedaluwarsa atau invalid (401)
  useEffect(() => {
    if (query.isError && query.error?.response?.status === 401) {
      logout();
    }
  }, [query.isError, query.error, logout]);

  return {
    user: query.data || null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    isError: query.isError,
  };
}
