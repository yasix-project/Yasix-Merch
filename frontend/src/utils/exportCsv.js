/**
 * Utility untuk mengekspor data array objek / matriks ke format CSV
 * Dilengkapi UTF-8 BOM (\uFEFF) agar simbol dan karakter angka terbaca sempurna di Microsoft Excel.
 */
export function downloadCsv(filename, headers, rows) {
  if (!rows || rows.length === 0) {
    throw new Error("Tidak ada data untuk diekspor");
  }

  // BOM UTF-8 untuk kompatibilitas otomatis Microsoft Excel di Windows / Mac
  const BOM = "\uFEFF";

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(",");
  const dataLines = rows.map((row) => row.map(escapeCell).join(","));

  const csvContent = BOM + [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    filename.endsWith(".csv") ? filename : `${filename}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
