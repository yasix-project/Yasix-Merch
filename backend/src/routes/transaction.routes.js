const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

// Hanya Kasir & Admin yang bisa melakukan Checkout POS Langsung
router.post(
  "/checkout",
  verifyToken,
  checkRole("ADMIN", "KASIR"),
  transactionController.createTransaction,
);

// GET Riwayat Transaksi (Admin & Kasir melihat semua; Siswa melihat transaksinya sendiri)
router.get(
  "/",
  verifyToken,
  checkRole("ADMIN", "KASIR", "SISWA"),
  transactionController.getAllTransactions,
);

// GET Detail 1 Transaksi Berdasarkan ID (Admin/Kasir, atau Siswa pemilik transaksi)
router.get(
  "/:id",
  verifyToken,
  checkRole("ADMIN", "KASIR", "SISWA"),
  transactionController.getTransactionById,
);

// Pre-order Mandiri Siswa
router.post(
  "/pre-order",
  verifyToken,
  checkRole("SISWA"),
  transactionController.studentPreOrder,
);

// Pelunasan & Pick-up di Konter oleh Kasir/Admin
router.patch(
  "/:id/complete",
  verifyToken,
  checkRole("ADMIN", "KASIR"),
  transactionController.completePreOrder,
);

// Tandai pesanan siap diambil di konter (READY)
router.patch(
  "/:id/ready",
  verifyToken,
  checkRole("ADMIN", "KASIR"),
  transactionController.markOrderReady,
);

// Update status transaksi secara dinamis
router.patch(
  "/:id/status",
  verifyToken,
  checkRole("ADMIN", "KASIR"),
  transactionController.updateTransactionStatus,
);

router.patch(
  "/:id/cancel",
  verifyToken,
  checkRole("ADMIN", "KASIR"),
  transactionController.cancelTransaction,
);

module.exports = router;
