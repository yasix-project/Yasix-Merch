const printService = require("../services/print.service");

const estimatePrintCost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "File PDF wajib diunggah untuk kalkulasi.",
      });
    }

    const totalPages = await printService.countPdfPagesService(req.file.path);
    const { isColor, copies, paperSize } = req.body;

    const estimate = await printService.calculatePrintCostService({
      totalPages,
      isColor: isColor === "true" || isColor === true,
      copies: parseInt(copies) || 1,
      paperSize: paperSize || "A4",
    });

    return res.status(200).json({
      status: "success",
      message: "Estimasi biaya cetak berhasil dihitung.",
      data: {
        fileName: req.file.originalname,
        ...estimate,
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const createPrintOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const printOrder = await printService.createPrintOrderService(
      req.file,
      req.body,
      userId,
    );

    return res.status(201).json({
      status: "success",
      message: "Pesanan cetak berhasil dibuat.",
      data: printOrder,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const getAllPrintOrders = async (req, res) => {
  try {
    const { mine, status } = req.query;
    const filter = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    // Siswa hanya boleh melihat pesanannya sendiri demi privasi & keamanan data
    if (req.user.role === "SISWA" || mine === "true") {
      filter.studentId = req.user.id;
    }

    const orders = await printService.getAllPrintOrdersService(filter);
    return res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const updatePrintOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await printService.updatePrintOrderStatusService(
      id,
      status,
    );

    return res.status(200).json({
      status: "success",
      message: "Status pesanan cetak berhasil diperbarui.",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  estimatePrintCost,
  createPrintOrder,
  getAllPrintOrders,
  updatePrintOrderStatus,
};
