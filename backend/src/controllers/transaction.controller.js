const transactionService = require("../services/transaction.service");

const createTransaction = async (req, res) => {
  try {
    const cashierId = req.user.id;
    const transaction = await transactionService.createTransactionService(
      cashierId,
      req.body,
    );

    return res.status(201).json({
      status: "success",
      message: "Transaksi berhasil diproses.",
      data: transaction,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransactionsService(req.user, req.query);
    return res.status(200).json({
      status: "success",
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionByIdService(
      req.params.id,
      req.user,
    );
    return res.status(200).json({
      status: "success",
      data: transaction,
    });
  } catch (error) {
    return res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

const studentPreOrder = async (req, res) => {
  try {
    const studentId = req.user.id;
    const preOrder = await transactionService.studentPreOrderService(
      studentId,
      req.body,
    );

    return res.status(201).json({
      status: "success",
      message:
        "Pre-order berhasil dibuat. Silakan ambil barang di Business Center dalam 1 jam.",
      data: preOrder,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const completePreOrder = async (req, res) => {
  try {
    const cashierId = req.user.id;
    const { id } = req.params;
    const completedOrder = await transactionService.completePreOrderService(
      id,
      cashierId,
      req.body,
    );

    return res.status(200).json({
      status: "success",
      message: "Pesanan pre-order berhasil dilunasi dan diambil.",
      data: completedOrder,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const cancelTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const user = req.user; // Data kasir/admin yang sedang login

    const result = await transactionService.cancelTransactionService(
      transactionId,
      user,
    );

    return res.status(200).json({
      status: "success",
      message:
        "Transaksi berhasil dibatalkan dan stok produk telah dikembalikan.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message || "Gagal membatalkan transaksi.",
    });
  }
};

const markOrderReady = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const cashierId = req.user.id;
    const result = await transactionService.markOrderReadyService(
      transactionId,
      cashierId,
    );

    return res.status(200).json({
      status: "success",
      message: "Status transaksi berhasil diubah menjadi Siap Diambil (READY).",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message:
        error.message ||
        "Gagal mengubah status transaksi menjadi Siap Diambil.",
    });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const cashierId = req.user.id;
    const { status } = req.body;

    const result = await transactionService.updateTransactionStatusService(
      transactionId,
      status,
      cashierId,
    );

    return res.status(200).json({
      status: "success",
      message: `Status transaksi berhasil diubah menjadi ${status}.`,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message || "Gagal memperbarui status transaksi.",
    });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  completePreOrder,
  studentPreOrder,
  cancelTransaction,
  markOrderReady,
  updateTransactionStatus,
};
