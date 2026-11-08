// src/api/analyticsService.js
import axiosClient from "./axiosClient";

export const analyticsService = {
  getDashboardMetrics: (filter = "7days") =>
    axiosClient.post("/analytics/dashboard", { filter }, { params: { filter } }),
  getSalesReport: (filter = "7days") =>
    axiosClient.post("/analytics/sales", { filter }, { params: { filter } }),
};
