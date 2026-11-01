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

  // Invalidasi transaksi dan stok produk sekaligus
  const invalidateTransactionsAndProducts = () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  // 1. MUTASI UNTUK POS KASIR (CHECKOUT BARU)
  const create = useMutation({
    mutationFn: (data) => transactionService.create(data),
    onSuccess: (response) => {
      invalidateTransactionsAndProducts();
      return response.data?.data || response.data;
    },
  });

  // 2. PEMBATALAN TRANSAKSI (VOID / CANCEL)
  const cancel = useMutation({
    mutationFn: (id) => transactionService.cancel(id),
    onSuccess: () => {
      invalidateTransactionsAndProducts();
      alert("Transaksi berhasil dibatalkan dan stok dikembalikan.");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Gagal membatalkan transaksi.");
    },
  });

  // 3. UPDATE STATUS JASA CETAK / ORDER
  const markReady = useMutation({
    mutationFn: (id) => transactionService.markReady(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });

  // 4. PENYELESAIAN TRANSAKSI ORDER
  const complete = useMutation({
    mutationFn: ({ id, data }) => transactionService.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });

  return {
    create,
    cancel,
    markReady,
    complete,
  };
}
