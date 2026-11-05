// src/hooks/useTransactions.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "../../api/transactionService";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export const transactionKeys = {
  all: ["transactions"],
  list: (params) => ["transactions", params],
  detail: (id) => ["transactions", id],
};

// Hook untuk Fetching Data Transaksi
export function useTransactions(
  params = {},
  { enabled = true, refetchInterval } = {},
) {
  const isLegacyOption =
    params &&
    (params.enabled !== undefined || params.refetchInterval !== undefined);
  const actualParams = isLegacyOption ? {} : params;
  const options = isLegacyOption ? params : { enabled, refetchInterval };

  return useQuery({
    queryKey: transactionKeys.list(actualParams),
    queryFn: async () => {
      const response = await transactionService.getAll(actualParams);
      return Array.isArray(response.data?.data)
        ? response.data.data
        : response.data || [];
    },
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval,
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
      showSuccessToast("Transaksi berhasil dibatalkan dan stok dikembalikan.");
    },
    onError: (err) => {
      showErrorToast(err.response?.data?.message || "Gagal membatalkan transaksi.");
    },
  });

  // 3. UPDATE STATUS JASA CETAK / ORDER: SIAP DIAMBIL (READY)
  const markReady = useMutation({
    mutationFn: (id) => transactionService.markReady(id),
    onSuccess: () => {
      invalidateTransactionsAndProducts();
      showSuccessToast("Status pesanan diubah: Siap Diambil di Konter.");
    },
    onError: (err) => {
      showErrorToast(err.response?.data?.message || "Gagal mengubah status pesanan.");
    },
  });

  // 4. PENYELESAIAN TRANSAKSI ORDER (PICK-UP & BAYAR)
  const complete = useMutation({
    mutationFn: ({ id, data }) => transactionService.complete(id, data),
    onSuccess: () => {
      invalidateTransactionsAndProducts();
      showSuccessToast("Pesanan pre-order berhasil diselesaikan.");
    },
    onError: (err) => {
      showErrorToast(err.response?.data?.message || "Gagal menyelesaikan pesanan.");
    },
  });

  // 5. UPDATE STATUS BEBAS (FLEXIBLE STATUS)
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => transactionService.updateStatus(id, status),
    onSuccess: () => {
      invalidateTransactionsAndProducts();
      showSuccessToast("Status transaksi berhasil diperbarui.");
    },
    onError: (err) => {
      showErrorToast(err.response?.data?.message || "Gagal memperbarui status transaksi.");
    },
  });

  return {
    create,
    cancel,
    markReady,
    complete,
    updateStatus,
  };
}
