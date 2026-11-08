// src/controllers/analytics.controller.js
const analyticsService = require("../services/analytics.service");

const getDashboardMetrics = async (req, res) => {
  try {
    const filter = req.body?.filter || req.query?.filter || "7days";
    const data = await analyticsService.getDashboardMetricsService(filter);
    return res.status(200).json({
      success: true,
      message: "Berhasil memuat metrik dashboard",
      data: data, // Berisi { metrics, categoryData }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Gagal memuat metrik",
    });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const filter = req.body?.filter || req.query?.filter || "7days";
    const reportData = await analyticsService.getSalesReportService(filter);

    return res.status(200).json({
      success: true,
      message: "Berhasil memuat laporan grafik",
      data: reportData, // Berisi array of { date, pendapatan, keuntungan }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Gagal memuat laporan grafik",
    });
  }
};

module.exports = { getDashboardMetrics, getSalesReport };
