import axiosClient from "./axiosClient";

export const studentPrintService = {
  // Hitung estimasi halaman & biaya (PDF sementara)
  estimateCost: async (formData) => {
    const res = await axiosClient.post("/print/estimate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data || res.data;
  },

  // Buat order cetak dokumen baru
  createOrder: async (formData) => {
    const res = await axiosClient.post("/print/order", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data || res.data;
  },

  // Ambil daftar antrean & riwayat order cetak milik siswa
  getMyOrders: async (params = {}) => {
    const res = await axiosClient.get("/print/orders", {
      params: { ...params, mine: true },
    });
    return res.data?.data || res.data || [];
  },
};
