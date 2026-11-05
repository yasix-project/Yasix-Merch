const express = require("express");
const router = express.Router();
const printController = require("../controllers/print.controller");
const { uploadDocument } = require("../middlewares/upload.middleware");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

// Hitung estimasi biaya cetak (Unggah PDF sementara)
router.post(
  "/estimate",
  verifyToken,
  uploadDocument.single("document"),
  printController.estimatePrintCost,
);

// Buat order cetak dokumen
router.post(
  "/order",
  verifyToken,
  uploadDocument.single("document"),
  printController.createPrintOrder,
);

// Lihat semua order cetak (Bisa diakses Admin, Kasir, dan Siswa)
router.get(
  "/orders",
  verifyToken,
  checkRole("ADMIN", "KASIR", "SISWA"),
  printController.getAllPrintOrders,
);

// Update status order cetak (Khusus Admin & Kasir)
router.patch(
  "/orders/:id/status",
  verifyToken,
  checkRole("ADMIN", "KASIR"),
  printController.updatePrintOrderStatus,
);

module.exports = router;
