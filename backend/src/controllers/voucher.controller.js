const voucherService = require("../services/voucher.service");

const validateVoucher = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const result = await voucherService.validateVoucherService(code, subtotal);
    return res.status(200).json({ status: "success", data: result });
  } catch (error) {
    return res.status(400).json({ status: "error", message: error.message });
  }
};

const createVoucher = async (req, res) => {
  try {
    const result = await voucherService.createVoucherService(req.body);
    return res.status(201).json({
      status: "success",
      message: "Voucher berhasil dibuat.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ status: "error", message: error.message });
  }
};

const redeemPoints = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { discountPct, maxDiscount, minPurchase } = req.body || {};

    const result = await voucherService.redeemPointsToVoucherService(
      studentId,
      {
        discountPct: discountPct !== undefined ? Number(discountPct) : 10,
        maxDiscount,
        minPurchase,
      },
    );

    return res.status(200).json({
      status: "success",
      message: `Berhasil menukar 100 poin dengan voucher diskon ${result.voucher?.discountPct || 10}% (maks. Rp10.000).`,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// --- ENDPOINT BARU: GET ALL & GET BY ID ---
const getAllVouchers = async (req, res) => {
  try {
    const vouchers = await voucherService.getAllVouchers();
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil data voucher",
      data: vouchers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan pada server",
    });
  }
};

const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await voucherService.getVoucherById(id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan pada server",
    });
  }
};

const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await voucherService.getVoucherById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Voucher tidak ditemukan.",
      });
    }

    const updatedVoucher = await voucherService.updateVoucher(id, req.body);

    res.status(200).json({
      success: true,
      message: "Voucher berhasil diperbarui.",
      data: updatedVoucher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Gagal memperbarui voucher.",
    });
  }
};

const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await voucherService.getVoucherById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Voucher tidak ditemukan.",
      });
    }

    await voucherService.deleteVoucher(id);

    res.status(200).json({
      success: true,
      message: "Voucher berhasil dihapus.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Gagal menghapus voucher.",
    });
  }
};

module.exports = {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  validateVoucher,
  redeemPoints,
  updateVoucher,
  deleteVoucher,
};
