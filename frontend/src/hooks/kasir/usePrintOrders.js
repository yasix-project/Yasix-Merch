import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { printService } from "../../api/printService";

export const printKeys = {
  all: ["printOrders"],
  list: () => ["printOrders"],
};

export function usePrintOrders() {
  return useQuery({
    queryKey: printKeys.list(),
    queryFn: async () => {
      const response = await printService.getAllOrders();
      return Array.isArray(response.data?.data)
        ? response.data.data
        : response.data || [];
    },
    // Polling setiap 10 detik agar kasir selalu melihat pesanan dokumen terbaru
    refetchInterval: 10000,
  });
}

export function usePrintMutations() {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => printService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: printKeys.all });
    },
  });

  return { updateStatus };
}
