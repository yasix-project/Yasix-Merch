import { useState } from "react";
import {
  Printer,
  FileText,
  Download,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
} from "lucide-react";

import Table from "../../components/ui/Table";
import FilterBar from "../../components/ui/FilterBar";
import Button from "../../components/ui/Button";
import { usePrintOrders } from "../../hooks/kasir/usePrintOrders";
import { formatRupiah, formatDate } from "../../utils/formatters";

const BACKEND_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") ||
  "http://localhost:5000";

const resolveDocumentUrl = (filePath) => {
  if (!filePath) return "#";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  // Menghapus prefix path backend jika berbentuk absolute path
  const normalizedPath = filePath
    .replace(/\\/g, "/")
    .replace(/^.*uploads\//, "uploads/");
  return `${BACKEND_BASE_URL}/${normalizedPath}`;
};

export default function AntreanPrint() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePrintOrders();

  // Filter Dokumen
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.student?.nis?.includes(searchQuery) ||
      order.fileName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Metrik Ringkasan
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;

  const columns = [
    {
      header: "No. Order",
      cellClassName: "font-mono font-bold text-xs text-slate-800",
      render: (o) => (
        <div>
          <span>{o.orderNumber}</span>
          <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
            {formatDate(o.createdAt, true)}
          </span>
        </div>
      ),
    },
    {
      header: "Siswa Pemesan",
      render: (o) => (
        <div>
          <span className="font-bold text-slate-800 text-xs block">
            {o.student?.name || "Siswa Umum"}
          </span>
          {o.student?.nis && (
            <span className="text-[10px] font-mono text-slate-400 block">
              NIS: {o.student.nis}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Spesifikasi Dokumen",
      render: (o) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-xs text-slate-800">
            <FileText size={14} className="text-blue-500 shrink-0" />
            <span className="truncate max-w-[180px]" title={o.fileName}>
              {o.fileName}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 text-[10px]">
            <span className="px-1.5 py-0.5 bg-slate-100 rounded font-semibold text-slate-600">
              {o.pageCount} Hal
            </span>
            <span
              className={`px-1.5 py-0.5 rounded font-bold ${
                o.colorType === "COLOR"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {o.colorType === "COLOR" ? "Warna" : "B/W"}
            </span>
            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
              {o.paperSize || "A4"}
            </span>
            {o.finishing && (
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
                {o.finishing}
              </span>
            )}
          </div>
          {o.notes && (
            <p className="text-[10px] italic text-slate-500 bg-amber-50/70 border border-amber-200/60 rounded px-1.5 py-0.5 mt-1">
              "{o.notes}"
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Total Biaya",
      cellClassName: "font-black text-blue-600 text-xs",
      render: (o) => formatRupiah(o.totalPrice),
    },
    {
      header: "Status",
      render: (o) => {
        const isPending = o.status === "PENDING";
        const isCompleted = o.status === "COMPLETED";

        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isPending
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : isCompleted
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {isPending ? (
              <Clock size={11} className="animate-spin" />
            ) : isCompleted ? (
              <CheckCircle2 size={11} />
            ) : (
              <AlertCircle size={11} />
            )}
            {o.status}
          </span>
        );
      },
    },
    {
      header: "Aksi Cetak",
      className: "text-right",
      render: (o) => {
        const fileUrl = resolveDocumentUrl(o.fileUrl);

        return (
          <div className="flex items-center justify-end gap-1.5">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors border border-blue-200 shadow-2xs"
              title="Buka dokumen untuk dicetak"
            >
              <ExternalLink size={13} />
              Buka File
            </a>
            <a
              href={fileUrl}
              download={o.fileName}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              title="Download File PDF"
            >
              <Download size={14} />
            </a>
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-20">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Printer className="text-blue-600" size={22} />
            Antrean Cetak Dokumen
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar pesanan print mandiri dari siswa Business Center Yasix[cite:
            2].
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs border border-slate-200 bg-white hover:bg-slate-50"
          >
            <RefreshCw
              size={13}
              className={`mr-1.5 text-slate-600 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh Antrean
          </Button>
        </div>
      </div>

      {/* Baris Ringkasan Kartu Metrik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Masuk
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {totalOrders}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menunggu Cetak
            </p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">
              {pendingOrders}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Selesai Dicetak
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">
              {completedOrders}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileCheck size={20} />
          </div>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <FilterBar
            searchPlaceholder="Cari No. Order (PO-...), Nama Siswa, NIS, atau Nama File..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "PENDING", "COMPLETED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {status === "ALL"
                ? "Semua Status"
                : status === "PENDING"
                  ? "Menunggu"
                  : "Selesai"}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Data */}
      <Table
        columns={columns}
        data={filteredOrders}
        keyField="id"
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        emptyMessage="Tidak ada antrean cetak dokumen yang ditemukan."
      />
    </div>
  );
}
