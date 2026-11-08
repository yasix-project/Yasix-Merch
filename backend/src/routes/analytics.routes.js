const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

// Mendukung GET dan POST dengan body payload untuk filtering metrik
router
  .route("/dashboard")
  .get(verifyToken, checkRole("ADMIN"), analyticsController.getDashboardMetrics)
  .post(verifyToken, checkRole("ADMIN"), analyticsController.getDashboardMetrics);

router
  .route("/sales")
  .get(verifyToken, checkRole("ADMIN"), analyticsController.getSalesReport)
  .post(verifyToken, checkRole("ADMIN"), analyticsController.getSalesReport);

module.exports = router;
