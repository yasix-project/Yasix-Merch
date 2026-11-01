// src/hooks/useTransactions.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "../../api/transactionService";

export const transactionKeys = {
  all: ["transactions"],
  list: () => ["transactions"],
  detail: (id) => ["transactions", id],
};

// Hook untuk Fetching Data Transaksi
export function useTransactions({ enabled = true } = {}) {
  return useQuery({
    queryKey: transactionKeys.list(),
    queryFn: async () => {
      const response = await transactionService.getAll();
      return Array.isArray(response.data?.data)
        ? response.data.data
        : response.data || [];
    },
    enabled,
  });
}

// Hook untuk Mengelola Mutasi Transaksi
export function useTransactionMutations() {
  const queryClient = useQueryClient();

  // Fungsi invalidasi agar tabel otomatis refresh setelah mutasi
  const invalidateTransactions = () =>
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });

  const cancel = useMutation({
    mutationFn: (id) => transactionService.cancel(id),
    onSuccess: () => {
      invalidateTransactions();
      alert("Transaksi berhasil dibatalkan dan stok dikembalikan.");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Gagal membatalkan transaksi.");
    },
  });

  const markReady = useMutation({
    mutationFn: (id) => transactionService.markReady(id),
    onSuccess: invalidateTransactions,
  });

  const complete = useMutation({
    mutationFn: ({ id, data }) => transactionService.complete(id, data),
    onSuccess: invalidateTransactions,
  });

  return {
    cancel,
    markReady,
    complete,
  };
}
