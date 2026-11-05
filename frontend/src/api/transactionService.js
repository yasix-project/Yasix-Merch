import axiosClient from "./axiosClient";

export const transactionService = {
  getAll: (params) => axiosClient.get("/transactions", { params }),
  getById: (id) => axiosClient.get(`/transactions/${id}`),

  // Endpoint untuk checkout kasir POS
  create: (data) => axiosClient.post("/transactions/checkout", data),

  cancel: (id) => axiosClient.patch(`/transactions/${id}/cancel`),
  markReady: (id) => axiosClient.patch(`/transactions/${id}/ready`),
  updateStatus: (id, status) =>
    axiosClient.patch(`/transactions/${id}/status`, { status }),
  complete: (id, data) =>
    axiosClient.patch(`/transactions/${id}/complete`, data),
};
