// src/controllers/analytics.controller.js
const analyticsService = require("../services/analytics.service");

const getDashboardMetrics = async (req, res) => {
  try {
    const filterParams = {
      filter: req.body?.filter || req.query?.filter || "7days",
      month: req.body?.month || req.query?.month,
      date: req.body?.date || req.query?.date,
      startDate: req.body?.startDate || req.query?.startDate,
      endDate: req.body?.endDate || req.query?.endDate,
    };

    const data = await analyticsService.getDashboardMetricsService(filterParams);
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
    const filterParams = {
      filter: req.body?.filter || req.query?.filter || "7days",
      month: req.body?.month || req.query?.month,
      date: req.body?.date || req.query?.date,
      startDate: req.body?.startDate || req.query?.startDate,
      endDate: req.body?.endDate || req.query?.endDate,
    };

    const reportData = await analyticsService.getSalesReportService(filterParams);

    return res.status(200).json({
      success: true,
      message: "Berhasil memuat laporan grafik",
      data: reportData, // Berisi { chartData, transactions, summary }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Gagal memuat laporan grafik",
    });
  }
};

module.exports = { getDashboardMetrics, getSalesReport };
