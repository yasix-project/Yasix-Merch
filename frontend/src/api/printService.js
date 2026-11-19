import axiosClient from "./axiosClient";

export const printService = {
  // Lacak status tiket pesanan cetak (Publik)
  trackOrder: (orderNumber) =>
    axiosClient.get(`/print/track/${encodeURIComponent(orderNumber)}`),

  // Mengambil seluruh daftar order cetak (Khusus Admin & Kasir)
  getAllOrders: () => axiosClient.get("/print/orders"),

  // Endpoint mutasi status order jika backend mengimplementasikan update status
  updateStatus: (id, status) =>
    axiosClient.patch(`/print/orders/${id}/status`, { status }),
};
