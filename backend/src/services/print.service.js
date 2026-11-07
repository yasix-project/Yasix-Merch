const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const prisma = require("../config/prisma");

// Konstanta & Biaya Jilid Standar Yasix
const FINISHING_PRICES = {
  NONE: { id: "NONE", label: "Tanpa Jilid (Stapler)", price: 0 },
  KLIP: { id: "KLIP", label: "Klip Penjepit (Paper Clip)", price: 500 },
  LAKBAN: { id: "LAKBAN", label: "Jilid Lakban Hitam + Mika", price: 3000 },
  SPIRAL: { id: "SPIRAL", label: "Jilid Spiral Kawat + Cover Mika", price: 5000 },
};

// Resolver pilihan jilid (menerima ID atau Label)
const resolveFinishing = (finishingInput) => {
  if (!finishingInput) return FINISHING_PRICES.NONE;
  const str = String(finishingInput).trim().toUpperCase();
  if (str === "KLIP" || str.includes("KLIP") || str.includes("PENJEPIT")) {
    return FINISHING_PRICES.KLIP;
  }
  if (str === "LAKBAN" || str.includes("LAKBAN")) {
    return FINISHING_PRICES.LAKBAN;
  }
  if (str === "SPIRAL" || str.includes("SPIRAL")) {
    return FINISHING_PRICES.SPIRAL;
  }
  return FINISHING_PRICES.NONE;
};

// Format daftar angka menjadi rentang ringkas (contoh: [1, 2, 3, 5] -> "1-3, 5")
const formatPageRanges = (pages) => {
  if (!pages || pages.length === 0) return "-";
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === prev + 1) {
      prev = sorted[i];
    } else {
      if (start === prev) {
        ranges.push(`${start}`);
      } else {
        ranges.push(`${start}-${prev}`);
      }
      if (i < sorted.length) {
        start = sorted[i];
        prev = sorted[i];
      }
    }
  }
  return ranges.join(", ");
};

// Parsing & validasi halaman yang dipilih siswa
const parseSelectedPages = (selectedPagesInput, totalPages) => {
  const maxPage = Math.max(1, totalPages || 1);
  const allPages = Array.from({ length: maxPage }, (_, i) => i + 1);

  if (!selectedPagesInput) {
    return {
      selectedPages: allPages,
      skippedPages: [],
      effectivePageCount: maxPage,
      pageRangeText: formatPageRanges(allPages),
      skippedRangeText: "",
    };
  }

  let rawList = [];
  if (Array.isArray(selectedPagesInput)) {
    rawList = selectedPagesInput;
  } else if (typeof selectedPagesInput === "string") {
    try {
      const parsed = JSON.parse(selectedPagesInput);
      if (Array.isArray(parsed)) {
        rawList = parsed;
      }
    } catch {
      rawList = selectedPagesInput.split(",").map((s) => s.trim());
    }
  }

  const validPages = [
    ...new Set(
      rawList
        .map(Number)
        .filter((n) => !isNaN(n) && Number.isInteger(n) && n >= 1 && n <= maxPage)
    ),
  ].sort((a, b) => a - b);

  // Jika input kosong atau tidak ada yang valid, default ke seluruh halaman
  const activePages = validPages.length > 0 ? validPages : allPages;
  const activeSet = new Set(activePages);
  const skippedPages = allPages.filter((p) => !activeSet.has(p));

  return {
    selectedPages: activePages,
    skippedPages,
    effectivePageCount: activePages.length,
    pageRangeText: formatPageRanges(activePages),
    skippedRangeText: skippedPages.length > 0 ? formatPageRanges(skippedPages) : "",
  };
};

// Menghitung Jumlah Halaman PDF
const countPdfPagesService = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(dataBuffer);
  return pdfDoc.getPageCount();
};

// Menghitung Biaya Cetak Akurat
const calculatePrintCostService = (totalPagesOrObj, colorType, paperSize = "A4") => {
  let totalDocPages = 1;
  let selectedPagesInput = null;
  let isColor = false;
  let selectedPaper = paperSize;
  let copies = 1;
  let finishingInput = "";

  if (typeof totalPagesOrObj === "object" && totalPagesOrObj !== null) {
    totalDocPages = totalPagesOrObj.totalPages || 1;
    selectedPagesInput = totalPagesOrObj.selectedPages;
    isColor =
      totalPagesOrObj.isColor ??
      (totalPagesOrObj.colorType === "COLOR");
    selectedPaper = totalPagesOrObj.paperSize || paperSize || "A4";
    copies = parseInt(totalPagesOrObj.copies) || 1;
    finishingInput = totalPagesOrObj.finishing || "";
  } else {
    totalDocPages = totalPagesOrObj || 1;
    isColor = colorType === "COLOR" || colorType === true;
  }

  const pageSelection = parseSelectedPages(selectedPagesInput, totalDocPages);
  const finishingInfo = resolveFinishing(finishingInput);

  const validColorType = isColor ? "COLOR" : "BW";
  const pricePerPage = isColor ? 1000 : 500;
  const printCost = pageSelection.effectivePageCount * pricePerPage * copies;
  const finishingCost = finishingInfo.price;
  const totalPrice = printCost + finishingCost;

  return {
    totalPages: totalDocPages,
    effectivePageCount: pageSelection.effectivePageCount,
    selectedPages: pageSelection.selectedPages,
    skippedPages: pageSelection.skippedPages,
    pageRangeText: pageSelection.pageRangeText,
    skippedRangeText: pageSelection.skippedRangeText,
    colorType: validColorType,
    isColor,
    paperSize: selectedPaper,
    copies,
    pricePerPage,
    printCost,
    finishing: finishingInfo.label,
    finishingCost,
    totalPrice,
    specs: {
      totalPages: totalDocPages,
      effectivePageCount: pageSelection.effectivePageCount,
      selectedPages: pageSelection.selectedPages,
      skippedPages: pageSelection.skippedPages,
      pageRangeText: pageSelection.pageRangeText,
      skippedRangeText: pageSelection.skippedRangeText,
      isColor,
      copies,
      paperSize: selectedPaper,
      finishing: finishingInfo.label,
      finishingCost,
    },
  };
};

// Membuat Order Cetak Baru
const createPrintOrderService = async (fileData, bodyData, studentId) => {
  if (!fileData) {
    throw new Error("File PDF wajib diunggah.");
  }

  const { colorType, paperSize, finishing, selectedPages, copies } = bodyData;
  const docTotalPages = await countPdfPagesService(fileData.path);

  // Buat nomor order unik (PO-YYYYMMDD-XXXX)
  const orderNumber = `PO-${Date.now()}`;

  const validColorType = colorType === "COLOR" ? "COLOR" : "BW";
  const calculation = calculatePrintCostService({
    totalPages: docTotalPages,
    selectedPages,
    colorType: validColorType,
    paperSize,
    finishing,
    copies: parseInt(copies) || 1,
  });

  // Susun instruksi halaman yang rapi dan tegas untuk kasir
  let generatedNotes = "";
  if (calculation.skippedPages && calculation.skippedPages.length > 0) {
    generatedNotes = `Cetak Hal: [${calculation.pageRangeText}] (${calculation.effectivePageCount} dari ${docTotalPages} hal) | LEWATI: [${calculation.skippedRangeText}]`;
  } else {
    generatedNotes = `Semua Halaman (Hal 1 - ${docTotalPages})`;
  }

  const printOrder = await prisma.printOrder.create({
    data: {
      orderNumber,
      studentId,
      fileUrl: fileData.path,
      fileName: fileData.originalname,
      pageCount: calculation.effectivePageCount,
      colorType: validColorType,
      paperSize: paperSize || "A4",
      finishing: calculation.finishing,
      totalPrice: calculation.totalPrice,
      notes: generatedNotes,
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
  FINISHING_PRICES,
  resolveFinishing,
  formatPageRanges,
  parseSelectedPages,
  countPdfPagesService,
  calculatePrintCostService,
  createPrintOrderService,
  getAllPrintOrdersService,
  updatePrintOrderStatusService,
};
