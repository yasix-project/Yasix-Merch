/**
 * Utility untuk normalisasi dan parsing spesifikasi cetak PDF
 * Menangani berbagai variasi struktur payload (order, estimate, specs, config)
 */
export function parsePrintSpecs(data) {
  if (!data) {
    return {
      specs: null,
      totalPages: 0,
      isColor: false,
      colorLabel: "Hitam Putih",
      paperSize: "A4",
      copies: 1,
      pricePerPage: 500,
      totalPrice: 0,
      finishing: null,
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

  const rawPages =
    specs?.totalPages ??
    (typeof data.pageCount === "number" || typeof data.pageCount === "string"
      ? data.pageCount
      : typeof data.totalPages === "number" || typeof data.totalPages === "string"
        ? data.totalPages
        : data.pages ?? 0);

  const totalPages =
    typeof rawPages === "object" && rawPages !== null
      ? Number(rawPages.totalPages) || 1
      : Number(rawPages) || 0;

  const isColor = Boolean(
    specs?.isColor ??
    data.isColor ??
    (data.colorType === "COLOR"),
  );

  const paperSize = specs?.paperSize || data.paperSize || "A4";
  const copies = Number(specs?.copies || data.copies || 1);
  const finishing = specs?.finishing || data.finishing || null;

  const pricePerPage =
    data.pricePerPage ?? (isColor ? 1000 : 500);

  const totalPrice =
    Number(data.totalPrice || 0) || totalPages * pricePerPage * copies;

  return {
    specs,
    totalPages: Math.max(0, totalPages),
    isColor,
    colorLabel: isColor ? "Warna" : "Hitam Putih",
    paperSize,
    copies: Math.max(1, copies),
    pricePerPage,
    totalPrice,
    finishing,
  };
}
