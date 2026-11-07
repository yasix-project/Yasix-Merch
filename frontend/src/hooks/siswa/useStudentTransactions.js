import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentTransactionService } from "../../api/studentTransactionService";

export const studentQueryKeys = {
  products: (params) => ["katalogProducts", params],
  categories: ["katalogCategories"],
  orders: (params) => ["myProductOrders", params],
  orderDetail: (id) => ["myProductOrderDetail", id],
};

// 1. Hook Mengambil Produk Katalog
export function useKatalogProducts(params = {}) {
  return useQuery({
    queryKey: studentQueryKeys.products(params),
    queryFn: async () => {
      const res = await studentTransactionService.getKatalogProducts(params);
      return Array.isArray(res.data?.data)
        ? res.data.data
        : res.data || [];
    },
    staleTime: 60 * 1000,
  });
}

// 2. Hook Mengambil Kategori Produk
export function useKatalogCategories() {
  return useQuery({
    queryKey: studentQueryKeys.categories,
    queryFn: async () => {
      const res = await studentTransactionService.getCategories();
      return Array.isArray(res.data?.data)
        ? res.data.data
        : res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// 3. Hook Mengambil Riwayat Pre-Order Siswa
export function useStudentOrders(params = {}) {
  return useQuery({
    queryKey: studentQueryKeys.orders(params),
    queryFn: async () => {
      const res = await studentTransactionService.getMyOrders(params);
      return Array.isArray(res.data?.data)
        ? res.data.data
        : res.data || [];
    },
    refetchInterval: 5000, // Sinkronisasi otomatis setiap 5 detik
  });
}

// 4. Hook Mutasi Pre-Order Siswa
export function useCreatePreOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => studentTransactionService.createPreOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProductOrders"] });
      queryClient.invalidateQueries({ queryKey: ["katalogProducts"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

// 5. Hook Validasi Voucher
export function useValidateVoucher() {
  return useMutation({
    mutationFn: ({ code, subtotal }) =>
      studentTransactionService.validateVoucher(code, subtotal),
  });
}

// 6. Hook Tukar Poin Siswa Menjadi Voucher Diskon
export function useRedeemPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => studentTransactionService.redeemPoints(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
