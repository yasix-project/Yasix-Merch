// src/api/analyticsService.js
import axiosClient from "./axiosClient";

export const analyticsService = {
  getDashboardMetrics: () => axiosClient.get("/analytics/dashboard"),
  getSalesReport: (filter = "7days") =>
    axiosClient.get(`/analytics/sales?filter=${filter}`),
};
