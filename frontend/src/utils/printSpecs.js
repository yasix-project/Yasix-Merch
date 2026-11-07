/**
 * Utility untuk normalisasi dan parsing spesifikasi cetak PDF
 * Menangani berbagai variasi struktur payload (order, estimate, specs, config)
 */
export function parsePrintSpecs(data) {
  if (!data) {
    return {
      specs: null,
      totalPages: 0,
      effectivePageCount: 0,
      selectedPages: [],
      skippedPages: [],
      pageRangeText: "-",
      skippedRangeText: "",
      isColor: false,
      colorLabel: "Hitam Putih",
      paperSize: "A4",
      copies: 1,
      pricePerPage: 500,
      printCost: 0,
      finishing: null,
      finishingCost: 0,
      totalPrice: 0,
    };
  }

  const specs =
    (typeof data.specs === "object" && data.specs) ||
    (typeof data.options === "object" && data.options) ||
    (typeof data.config === "object" && data.config) ||
    (typeof data.details === "object" && data.details) ||
    (typeof data.totalPages === "object" && data.totalPages) ||
    (typeof data.pageCount === "object" && data.pageCount) ||
    null;

  const rawTotalPages =
    specs?.totalPages ??
    (typeof data.totalPages === "number" || typeof data.totalPages === "string"
      ? data.totalPages
      : typeof data.pageCount === "number" || typeof data.pageCount === "string"
        ? data.pageCount
        : data.pages ?? 0);

  const totalPages =
    typeof rawTotalPages === "object" && rawTotalPages !== null
      ? Number(rawTotalPages.totalPages) || 1
      : Number(rawTotalPages) || 0;

  const rawEffectivePages =
    specs?.effectivePageCount ??
    data.effectivePageCount ??
    (typeof data.pageCount === "number" ? data.pageCount : totalPages);

  const effectivePageCount = Math.max(0, Number(rawEffectivePages) || totalPages);

  const isColor = Boolean(
    specs?.isColor ??
    data.isColor ??
    (data.colorType === "COLOR"),
  );

  const paperSize = specs?.paperSize || data.paperSize || "A4";
  const copies = Number(specs?.copies || data.copies || 1);
  const finishing = specs?.finishing || data.finishing || null;
  const finishingCost = Number(specs?.finishingCost ?? data.finishingCost ?? 0);

  const selectedPages = specs?.selectedPages || data.selectedPages || [];
  const skippedPages = specs?.skippedPages || data.skippedPages || [];
  const pageRangeText =
    specs?.pageRangeText ||
    data.pageRangeText ||
    (totalPages > 0 ? `1-${totalPages}` : "-");
  const skippedRangeText = specs?.skippedRangeText || data.skippedRangeText || "";

  const pricePerPage =
    data.pricePerPage ?? (isColor ? 1000 : 500);

  const printCost =
    Number(data.printCost ?? specs?.printCost ?? (effectivePageCount * pricePerPage * copies));

  const totalPrice =
    Number(data.totalPrice || 0) || (printCost + finishingCost);

  return {
    specs,
    totalPages: Math.max(0, totalPages),
    effectivePageCount,
    selectedPages,
    skippedPages,
    pageRangeText,
    skippedRangeText,
    isColor,
    colorLabel: isColor ? "Warna" : "Hitam Putih",
    paperSize,
    copies,
    pricePerPage,
    printCost,
    finishing,
    finishingCost,
    totalPrice,
  };
}

/**
 * Helper untuk parsing format catatan instruksi halaman cetak
 * Contoh: "Cetak Hal: [1-2, 4-5] (4 dari 5 hal) | LEWATI: [3]"
 */
export function parseOrderPageNotes(notes) {
  if (!notes) {
    return {
      isCustom: false,
      printPages: "",
      skipPages: "",
      raw: "",
      label: "Semua Halaman",
    };
  }

  const str = String(notes).trim();

  if (str.includes("Cetak Hal:") || str.includes("LEWATI:")) {
    const matchPrint = str.match(/Cetak Hal:\s*\[?([^\]\)]+)\]?/i);
    const matchSkip = str.match(/LEWATI:\s*\[?([^\]]+)\]?/i);
    return {
      isCustom: true,
      printPages: matchPrint ? matchPrint[1].trim() : "",
      skipPages: matchSkip ? matchSkip[1].trim() : "",
      raw: str,
      label: matchPrint ? `Hal: ${matchPrint[1].trim()}` : str,
    };
  }

  if (str.startsWith("Semua Halaman")) {
    return {
      isCustom: false,
      printPages: "",
      skipPages: "",
      raw: str,
      label: str,
    };
  }

  return {
    isCustom: false,
    printPages: "",
    skipPages: "",
    raw: str,
    label: str,
  };
}
