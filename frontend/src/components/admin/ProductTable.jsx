// src/components/admin/ProductTable.jsx
import {
  Edit3,
  Trash2,
  PackageCheck,
  AlertTriangle,
  Image as ImageIcon,
  Power,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Badge from "../ui/Badge";
import Table from "../ui/Table";
import { formatRupiah, formatDate } from "../../utils/formatters";
import { resolveFileUrl } from "../../utils/imageUrl";

export default function ProductTable({
  products = [],
  isLoading,
  isError,
  error,
  selectedIds = [],
  onSelectAll,
  onSelectRow,
  onToggleActive,
  onEdit,
  onDelete,
}) {
  const columns = [
    {
      header: "Informasi Produk",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center text-slate-400">
            {p.imageUrl ? (
              <img
                src={resolveFileUrl(p.imageUrl)}
                alt={p.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <ImageIcon size={18} />
            )}
          </div>
          <div>
            <p className="font-bold text-dark text-xs">{p.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">
              Barcode: {p.barcode}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Kategori & Dibuat",
      render: (p) => (
        <div>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-semibold border border-slate-200/60">
            {p.category?.name || p.category || "-"}
          </span>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            {formatDate(p.createdAt)}
          </p>
        </div>
      ),
    },
    {
      header: "HPP (Modal)",
      cellClassName: "font-mono text-slate-500 font-medium",
      render: (p) => formatRupiah(p.hpp),
    },
    {
      header: "Margin",
      className: "text-center",
      cellClassName: "text-center",
      render: (p) => (
        <span className="font-mono font-semibold text-[11px] text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded">
          {p.margin}%
        </span>
      ),
    },
    {
      header: "Harga Jual",
      cellClassName: "font-mono font-bold text-dark",
      render: (p) => formatRupiah(p.sellingPrice),
    },
    {
      header: "Stok",
      cellClassName: "font-mono font-bold text-slate-700",
      render: (p) => p.stock,
    },
    {
      header: "Status Sistem",
      render: (p) =>
        p.isActive === false ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
            <XCircle size={11} className="text-slate-500" /> Nonaktif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={11} className="text-emerald-600" /> Aktif
          </span>
        ),
    },
    {
      header: "Status Stok",
      render: (p) =>
        p.stock <= (p.minStock ?? 10) ? (
          <Badge variant="danger" className="gap-1 rounded text-[10px]">
            <AlertTriangle size={11} /> Menipis
          </Badge>
        ) : (
          <Badge variant="success" className="gap-1 rounded text-[10px]">
            <PackageCheck size={11} /> Aman
          </Badge>
        ),
    },
    {
      header: "Aksi",
      className: "text-center",
      render: (p) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onToggleActive(p)}
            className={`p-1.5 rounded transition-colors ${
              p.isActive === false
                ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
            }`}
            title={
              p.isActive === false ? "Aktifkan Produk" : "Nonaktifkan Produk"
            }
          >
            <Power size={15} />
          </button>
          <button
            onClick={() => onEdit(p)}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
            title="Edit Produk"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => onDelete(p.id)}
            className="p-1.5 text-slate-400 hover:text-danger hover:bg-danger/10 rounded transition-colors"
            title="Hapus Produk"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={products}
      keyField="id"
      isLoading={isLoading}
      isError={isError}
      errorMessage={
        error?.response?.data?.message ||
        error?.message ||
        "Gagal mengambil data produk."
      }
      emptyMessage="Tidak ada produk yang sesuai dengan kriteria pencarian."
      selectedIds={selectedIds}
      onSelectAll={onSelectAll}
      onSelectRow={onSelectRow}
      rowClassName={(p) =>
        p.isActive === false ? "bg-slate-50/80 opacity-70" : ""
      }
    />
  );
}
