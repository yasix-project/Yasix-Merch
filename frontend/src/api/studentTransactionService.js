import axiosClient from "./axiosClient";

export const studentTransactionService = {
  // Ambil produk aktif untuk katalog
  getKatalogProducts: (params) =>
    axiosClient.get("/products", {
      params: { ...params, isActive: true },
    }),

  // Ambil daftar kategori produk
  getCategories: () => axiosClient.get("/categories"),

  // Validasi kode voucher untuk subtotal saat ini
  validateVoucher: (code, subtotal) =>
    axiosClient.post("/vouchers/validate", { code, subtotal }),

  // Tukar 100 poin dengan voucher diskon Rp 10.000
  redeemPoints: () => axiosClient.post("/vouchers/redeem"),

  // Buat pre-order mandiri siswa (Pay on Pickup)
  createPreOrder: (payload) =>
    axiosClient.post("/transactions/pre-order", payload),

  // Ambil riwayat order siswa
  getMyOrders: (params) =>
    axiosClient.get("/transactions", {
      params: { ...params, mine: true },
    }),

  // Detail satu order
  getOrderDetail: (id) => axiosClient.get(`/transactions/${id}`),
};
