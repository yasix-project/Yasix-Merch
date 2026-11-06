import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authService } from "../../api/authService";
import { useAuthStore } from "../../store/authStore";

export const profileKeys = {
  current: ["currentUser"],
};

export function useProfile({ enabled = true } = {}) {
  const storeUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  return useQuery({
    queryKey: profileKeys.current,
    queryFn: async () => {
      try {
        const response = await authService.getMe();
        const user = response?.data?.data || response?.data || response;
        if (user && typeof user === "object" && user.email) {
          updateUser(user);
          return user;
        }
      } catch (err) {
        console.warn("Gagal sinkronisasi profil terbaru dari backend, menggunakan sesi aktif:", err);
      }

      if (storeUser && storeUser.email) {
        return storeUser;
      }

      return null;
    },
    initialData: storeUser || undefined,
    enabled,
    staleTime: 1000 * 60 * 2, // 2 menit
  });
}

export function useProfileMutations() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  const update = useMutation({
    mutationFn: (data) => {
      const payload = { ...data };
      if (!payload.password) delete payload.password;
      return authService.updateProfile(payload);
    },
    onSuccess: (res) => {
      const updatedUser = res?.data?.data || res?.data;
      if (updatedUser) {
        updateUser(updatedUser);
        queryClient.setQueryData(profileKeys.current, updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: profileKeys.current });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  return { update };
}
