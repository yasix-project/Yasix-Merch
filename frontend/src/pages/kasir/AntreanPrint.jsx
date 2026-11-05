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
  PackageCheck,
  XCircle,
  MoreHorizontal,
} from "lucide-react";

import Table from "../../components/ui/Table";
import FilterBar from "../../components/ui/FilterBar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import {
  usePrintOrders,
  usePrintMutations,
} from "../../hooks/kasir/usePrintOrders";
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
  const readyOrders = orders.filter((o) => o.status === "READY").length;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;

  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const { updateStatus } = usePrintMutations();

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch (err) {
      // Error handled by mutation
    }
  };

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
      render: (o) => {
        const specs =
          (typeof o.specs === "object" && o.specs) ||
          (typeof o.config === "object" && o.config) ||
          (typeof o.options === "object" && o.options) ||
          (typeof o.details === "object" && o.details) ||
          (typeof o.totalPages === "object" && o.totalPages) ||
          (typeof o.pageCount === "object" && o.pageCount) ||
          null;

        const rawPages =
          specs?.totalPages ??
          (typeof o.pageCount === "number" || typeof o.pageCount === "string"
            ? o.pageCount
            : typeof o.totalPages === "number" || typeof o.totalPages === "string"
              ? o.totalPages
              : 1);

        const pages =
          typeof rawPages === "object" && rawPages !== null
            ? rawPages.totalPages || 1
            : Number(rawPages) || 1;

        const isColor =
          specs?.isColor ??
          (o.colorType === "COLOR" || o.isColor === true);

        const paperSize = specs?.paperSize || o.paperSize || "A4";
        const copies = specs?.copies || o.copies || 1;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-xs text-slate-800">
              <FileText size={14} className="text-blue-500 shrink-0" />
              <span className="truncate max-w-[180px]" title={o.fileName}>
                {o.fileName || "Dokumen Cetak"}
              </span>
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-slate-800 block">
                {pages} Halaman ({paperSize})
              </span>
              <span className="text-slate-500 block text-[11px]">
                {isColor ? "Warna" : "Hitam Putih"} • {copies} Rangkap
                {o.finishing ? ` • ${o.finishing}` : ""}
              </span>
            </div>
            {o.notes && (
              <p className="text-[10px] italic text-slate-500 bg-amber-50/70 border border-amber-200/60 rounded px-1.5 py-0.5 mt-1">
                "{o.notes}"
              </p>
            )}
          </div>
        );
      },
    },
    {
      header: "Total Biaya",
      cellClassName: "font-black text-blue-600 text-xs",
      render: (o) => formatRupiah(o.totalPrice),
    },
    {
      header: "Status",
      render: (o) => {
        if (o.status === "READY") {
          return (
            <Badge variant="success">
              <PackageCheck size={11} className="mr-1" />
              Siap Diambil
            </Badge>
          );
        }

        if (o.status === "PROCESSING") {
          return (
            <Badge variant="primary">
              <RefreshCw size={11} className="mr-1 animate-spin" />
              Diproses
            </Badge>
          );
        }

        if (o.status === "COMPLETED") {
          return (
            <Badge variant="primary">
              <CheckCircle2 size={11} className="mr-1" />
              Selesai
            </Badge>
          );
        }

        if (o.status === "CANCELLED") {
          return (
            <Badge variant="danger">
              <XCircle size={11} className="mr-1" />
              Dibatalkan
            </Badge>
          );
        }

        return (
          <Badge variant="warning">
            <Clock size={11} className="mr-1 animate-spin" />
            Menunggu
          </Badge>
        );
      },
    },
    {
      header: "Aksi Cetak",
      className: "text-right",
      render: (o) => {
        const fileUrl = resolveDocumentUrl(o.fileUrl);
        const isPending = o.status === "PENDING";
        const isReady = o.status === "READY";

        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* Quick 1-Click Status Update */}
            {isPending && (
              <Button
                size="xs"
                variant="primary"
                onClick={() => handleUpdateStatus(o.id, "READY")}
                isLoading={
                  updateStatus.isPending &&
                  updateStatus.variables?.id === o.id
                }
                title="Tandai dokumen sudah dicetak dan siap diambil"
              >
                <PackageCheck size={13} />
                <span>Siap</span>
              </Button>
            )}

            {isReady && (
              <Button
                size="xs"
                variant="primary"
                onClick={() => handleUpdateStatus(o.id, "COMPLETED")}
                isLoading={
                  updateStatus.isPending &&
                  updateStatus.variables?.id === o.id
                }
                title="Selesaikan pesanan cetak (sudah diambil siswa)"
              >
                <CheckCircle2 size={13} />
                <span>Selesai</span>
              </Button>
            )}

            {/* Buka Dokumen */}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
              title="Buka dokumen untuk dicetak"
            >
              <ExternalLink size={13} />
            </a>

            {/* Download Dokumen */}
            <a
              href={fileUrl}
              download={o.fileName}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200"
              title="Download File PDF"
            >
              <Download size={13} />
            </a>

            {/* Opsi Ubah Status Lengkap */}
            <Button
              size="xs"
              variant="outline"
              onClick={() => setSelectedOrderForStatus(o)}
              title="Ubah status antrean print"
            >
              <MoreHorizontal size={13} />
            </Button>
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
            Daftar pesanan print mandiri dari siswa Business Center Yasix.
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Masuk
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {totalOrders}
            </p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <FileText size={18} />
          </div>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
              Menunggu Cetak
            </p>
            <p className="text-2xl font-black text-amber-900 mt-0.5">
              {pendingOrders}
            </p>
          </div>
          <div className="p-2.5 bg-amber-100/80 text-amber-700 rounded-xl">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
              Siap Diambil
            </p>
            <p className="text-2xl font-black text-emerald-900 mt-0.5">
              {readyOrders}
            </p>
          </div>
          <div className="p-2.5 bg-emerald-100/80 text-emerald-700 rounded-xl">
            <PackageCheck size={18} />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Selesai Dicetak
            </p>
            <p className="text-2xl font-black text-slate-700 mt-0.5">
              {completedOrders}
            </p>
          </div>
          <div className="p-2.5 bg-slate-200/60 text-slate-600 rounded-xl">
            <FileCheck size={18} />
          </div>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <FilterBar
        searchPlaceholder="Cari No. Order (PO-...), Nama Siswa, NIS, atau Nama File..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filterTabs={[
          { label: `Semua (${totalOrders})`, value: "ALL" },
          { label: `Menunggu (${pendingOrders})`, value: "PENDING" },
          { label: `Siap (${readyOrders})`, value: "READY" },
          { label: `Selesai (${completedOrders})`, value: "COMPLETED" },
          { label: "Dibatalkan", value: "CANCELLED" },
        ]}
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
      />

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

      {/* Modal Ubah Status Antrean Print */}
      {selectedOrderForStatus && (
        <Modal
          isOpen={Boolean(selectedOrderForStatus)}
          onClose={() => setSelectedOrderForStatus(null)}
          title="Ubah Status Order Cetak"
        >
          <div className="space-y-4 text-xs">
            {/* Rincian Order */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Nomor Order</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedOrderForStatus.orderNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Nama File</span>
                <span
                  className="font-medium text-slate-800 truncate max-w-[200px]"
                  title={selectedOrderForStatus.fileName}
                >
                  {selectedOrderForStatus.fileName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pemesan</span>
                <span className="font-bold text-slate-900">
                  {selectedOrderForStatus.student?.name || "Siswa Umum"} (NIS:{" "}
                  {selectedOrderForStatus.student?.nis || "-"})
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Status Saat Ini</span>
                <Badge
                  variant={
                    selectedOrderForStatus.status === "READY"
                      ? "success"
                      : selectedOrderForStatus.status === "PENDING"
                        ? "warning"
                        : selectedOrderForStatus.status === "COMPLETED"
                          ? "primary"
                          : "danger"
                  }
                >
                  {selectedOrderForStatus.status}
                </Badge>
              </div>
            </div>

            {/* Tombol Pilihan Status */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block text-xs">
                Pilih Status Baru:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant={
                    selectedOrderForStatus.status === "PENDING"
                      ? "amber"
                      : "outline"
                  }
                  onClick={() => {
                    handleUpdateStatus(selectedOrderForStatus.id, "PENDING");
                    setSelectedOrderForStatus(null);
                  }}
                  className="justify-start gap-1.5"
                >
                  <Clock size={13} className="text-amber-600" />
                  <span>Menunggu</span>
                </Button>

                <Button
                  size="sm"
                  variant={
                    selectedOrderForStatus.status === "PROCESSING"
                      ? "primary"
                      : "outline"
                  }
                  onClick={() => {
                    handleUpdateStatus(selectedOrderForStatus.id, "PROCESSING");
                    setSelectedOrderForStatus(null);
                  }}
                  className="justify-start gap-1.5"
                >
                  <RefreshCw size={13} className="text-blue-500" />
                  <span>Sedang Dicetak</span>
                </Button>

                <Button
                  size="sm"
                  variant={
                    selectedOrderForStatus.status === "READY"
                      ? "primary"
                      : "outline"
                  }
                  onClick={() => {
                    handleUpdateStatus(selectedOrderForStatus.id, "READY");
                    setSelectedOrderForStatus(null);
                  }}
                  className="justify-start gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <PackageCheck size={13} />
                  <span>Siap Diambil</span>
                </Button>

                <Button
                  size="sm"
                  variant={
                    selectedOrderForStatus.status === "COMPLETED"
                      ? "primary"
                      : "outline"
                  }
                  onClick={() => {
                    handleUpdateStatus(selectedOrderForStatus.id, "COMPLETED");
                    setSelectedOrderForStatus(null);
                  }}
                  className="justify-start gap-1.5"
                >
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Selesai</span>
                </Button>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    handleUpdateStatus(selectedOrderForStatus.id, "CANCELLED");
                    setSelectedOrderForStatus(null);
                  }}
                  className="w-full gap-1.5"
                >
                  <XCircle size={13} />
                  <span>Batalkan Order Cetak</span>
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrderForStatus(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
