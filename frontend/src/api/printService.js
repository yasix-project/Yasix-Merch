import axiosClient from "./axiosClient";

export const printService = {
  // Mengambil seluruh daftar order cetak (Khusus Admin & Kasir)
  getAllOrders: () => axiosClient.get("/print/orders"),

  // Endpoint mutasi status order jika backend mengimplementasikan update status
  updateStatus: (id, status) =>
    axiosClient.patch(`/print/orders/${id}/status`, { status }),
};
