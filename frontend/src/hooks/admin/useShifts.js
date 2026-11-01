import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { shiftService } from "../../api/shiftService";

export const shiftKeys = {
  all: ["shifts"],
  list: () => ["shifts"],
};

export function useShifts({ enabled = true } = {}) {
  return useQuery({
    queryKey: shiftKeys.list(),
    queryFn: async () => {
      const response = await shiftService.getAllShifts();
      return Array.isArray(response.data?.data)
        ? response.data.data
        : response.data || [];
    },
    enabled,
  });
}

export function useShiftMutations() {
  const queryClient = useQueryClient();

  const endShift = useMutation({
    mutationFn: (data) => shiftService.endShift(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shiftKeys.all }),
  });

  return { endShift };
}
