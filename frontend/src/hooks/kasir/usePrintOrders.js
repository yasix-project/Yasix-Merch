import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { printService } from "../../api/printService";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

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
      showSuccessToast("Status order cetak berhasil diperbarui.");
    },
    onError: (err) => {
      showErrorToast(
        err.response?.data?.message || "Gagal memperbarui status order cetak.",
      );
    },
  });

  return { updateStatus };
}
