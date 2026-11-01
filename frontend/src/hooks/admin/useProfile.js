import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authService } from "../../api/authService";

export const profileKeys = {
  current: ["currentUser"],
};

export function useProfile({ enabled = true } = {}) {
  return useQuery({
    queryKey: profileKeys.current,
    queryFn: async () => {
      const response = await authService.getMe();
      return response.data?.data || response.data;
    },
    enabled,
  });
}

export function useProfileMutations() {
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: (data) => {
      const payload = { ...data };
      if (!payload.password) delete payload.password;
      return authService.updateProfile(payload);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: profileKeys.current }),
  });

  return { update };
}
