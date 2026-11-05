// src/utils/formatters.js

// src/utils/formatters.js

export const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString); // Otomatis mengubah UTC (Z) ke Local Time (WIB)

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(date)
    .replace(/\./g, ":"); // Mengganti pemisah jam dari titik ke titik dua
};

export const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export const exportProductsToCSV = (products, selectedIds = []) => {
  const dataToExport = products.filter(
    (p) => selectedIds.length === 0 || selectedIds.includes(p.id),
  );
  const headers = [
    "ID,Barcode,Nama,Kategori,HPP,Margin,HargaJual,Stok,StatusProduk\n",
  ];
  const rows = dataToExport.map(
    (p) =>
      `"${p.id}","${p.barcode}","${p.name}","${p.category?.name || p.category || ""}","${p.hpp}","${p.margin}","${p.sellingPrice}","${p.stock}","${p.isActive !== false ? "Aktif" : "Nonaktif"}"\n`,
  );
  const blob = new Blob([...headers, ...rows], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `yasixmerch-products-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
};
