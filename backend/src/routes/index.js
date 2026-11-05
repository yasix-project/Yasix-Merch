const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");

const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const categoryRoutes = require("./category.routes");
const printRoutes = require("./print.routes");
const transactionRoutes = require("./transaction.routes");
const shiftRoutes = require("./shift.routes");
const voucherRoutes = require("./voucher.routes");
const analyticsRoutes = require("./analytics.routes");
const studentRoutes = require("./student.routes");

// Health Check
router.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const totalUsers = await prisma.user.count();

    return res.status(200).json({
      status: "success",
      message:
        "YasixMerch API & Database MySQL Docker terhubung dengan lancar!",
      database: {
        status: "CONNECTED",
        totalUsers,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Gagal terhubung ke Database MySQL!",
      database: {
        status: "DISCONNECTED",
        error: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// Sub-Routers

router.use("/shifts", shiftRoutes);
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/print", printRoutes);
router.use("/transactions", transactionRoutes);
router.use("/vouchers", voucherRoutes);
router.use("/students", studentRoutes);
router.use("/analytics", analyticsRoutes);

module.exports = router;
