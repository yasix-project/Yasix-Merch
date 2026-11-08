// src/api/analyticsService.js
import axiosClient from "./axiosClient";

export const analyticsService = {
  getDashboardMetrics: (params = "7days") => {
    const payload =
      typeof params === "string" ? { filter: params } : params || { filter: "7days" };
    return axiosClient.post("/analytics/dashboard", payload, { params: payload });
  },
  getSalesReport: (params = "7days") => {
    const payload =
      typeof params === "string" ? { filter: params } : params || { filter: "7days" };
    return axiosClient.post("/analytics/sales", payload, { params: payload });
  },
};
