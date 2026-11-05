const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const prisma = require("../config/prisma");

// Menghitung Jumlah Halaman PDF
const countPdfPagesService = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(dataBuffer);
  return pdfDoc.getPageCount();
};

// Menghitung Biaya Cetak
const calculatePrintCostService = (totalPagesOrObj, colorType, paperSize = "A4") => {
  let totalPages = totalPagesOrObj;
  let isColor = false;
  let selectedPaper = paperSize;
  let copies = 1;

  if (typeof totalPagesOrObj === "object" && totalPagesOrObj !== null) {
    totalPages = totalPagesOrObj.totalPages || 1;
    isColor =
      totalPagesOrObj.isColor ??
      (totalPagesOrObj.colorType === "COLOR");
    selectedPaper = totalPagesOrObj.paperSize || paperSize || "A4";
    copies = parseInt(totalPagesOrObj.copies) || 1;
  } else {
    isColor = colorType === "COLOR" || colorType === true;
  }

  const validColorType = isColor ? "COLOR" : "BW";
  const pricePerPage = isColor ? 1000 : 500;
  const totalPrice = totalPages * pricePerPage * copies;

  return {
    totalPages,
    colorType: validColorType,
    isColor,
    paperSize: selectedPaper,
    copies,
    pricePerPage,
    totalPrice,
    specs: {
      totalPages,
      isColor,
      copies,
      paperSize: selectedPaper,
    },
  };
};

// Membuat Order Cetak Baru
const createPrintOrderService = async (fileData, bodyData, studentId) => {
  if (!fileData) {
    throw new Error("File PDF wajib diunggah.");
  }

  const { colorType, paperSize, finishing, notes } = bodyData;
  const pageCount = await countPdfPagesService(fileData.path);

  // Buat nomor order unik (PO-YYYYMMDD-XXXX)
  const orderNumber = `PO-${Date.now()}`;

  const validColorType = colorType === "COLOR" ? "COLOR" : "BW";
  const calculation = calculatePrintCostService(
    pageCount,
    validColorType,
    paperSize,
  );

  const printOrder = await prisma.printOrder.create({
    data: {
      orderNumber,
      studentId,
      fileUrl: fileData.path,
      fileName: fileData.originalname,
      pageCount,
      colorType: validColorType,
      paperSize: paperSize || "A4",
      finishing: finishing || null,
      totalPrice: calculation.totalPrice,
      notes: notes || null,
      status: "PENDING",
    },
  });

  return printOrder;
};

// Mendapatkan Semua Order Cetak (Mendukung Filter)
const getAllPrintOrdersService = async (filter = {}) => {
  return await prisma.printOrder.findMany({
    where: filter,
    include: {
      student: {
        select: { id: true, name: true, email: true, nis: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// Update Status Order Cetak
const updatePrintOrderStatusService = async (id, status) => {
  const allowedStatuses = [
    "PENDING",
    "PROCESSING",
    "READY",
    "COMPLETED",
    "CANCELLED",
  ];
  if (!allowedStatuses.includes(status)) {
    throw new Error(`Status tidak valid: ${status}`);
  }

  const existingOrder = await prisma.printOrder.findUnique({
    where: { id },
  });

  if (!existingOrder) {
    throw new Error("Order cetak tidak ditemukan.");
  }

  return await prisma.printOrder.update({
    where: { id },
    data: { status },
    include: {
      student: {
        select: { id: true, name: true, email: true, nis: true },
      },
    },
  });
};

module.exports = {
  countPdfPagesService,
  calculatePrintCostService,
  createPrintOrderService,
  getAllPrintOrdersService,
  updatePrintOrderStatusService,
};
