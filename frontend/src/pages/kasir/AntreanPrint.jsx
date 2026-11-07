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
import PrintQueueStatsCards from "../../components/kasir/PrintQueueStatsCards";
import PrintStatusModal from "../../components/kasir/PrintStatusModal";
import {
  usePrintOrders,
  usePrintMutations,
} from "../../hooks/kasir/usePrintOrders";
import { formatRupiah, formatDate } from "../../utils/formatters";
import { resolveFileUrl } from "../../utils/imageUrl";



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
        const fileUrl = resolveFileUrl(o.fileUrl);
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
            Daftar pesanan print mandiri dari siswa YasixMerch.
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

      {/* Baris Ringkasan Kartu Metrik (Modular Component) */}
      <PrintQueueStatsCards
        totalOrders={totalOrders}
        pendingOrders={pendingOrders}
        readyOrders={readyOrders}
        completedOrders={completedOrders}
      />

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

      {/* Modal Ubah Status Antrean Print (Modular Component) */}
      <PrintStatusModal
        selectedOrder={selectedOrderForStatus}
        onClose={() => setSelectedOrderForStatus(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
