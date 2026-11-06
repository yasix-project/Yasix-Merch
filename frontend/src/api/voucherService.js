// src/api/voucherService.js
import axiosClient from "./axiosClient";

export const voucherService = {
  getAll: () => axiosClient.get("/vouchers"),
  getById: (id) => axiosClient.get(`/vouchers/${id}`),
  create: (data) => axiosClient.post("/vouchers", data),
  validate: (code, subtotal) =>
    axiosClient.post("/vouchers/validate", { code, subtotal }),
  update: (id, data) => axiosClient.put(`/vouchers/${id}`, data),
  delete: (id) => axiosClient.delete(`/vouchers/${id}`),
  toggleActive: (id, currentStatus) =>
    axiosClient.put(`/vouchers/${id}`, { isActive: !currentStatus }),
};
