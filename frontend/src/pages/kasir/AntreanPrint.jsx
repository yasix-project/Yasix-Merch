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
  Copy,
  Check,
  Scissors,
  BookOpen,
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
import { parsePrintSpecs, parseOrderPageNotes } from "../../utils/printSpecs";

export default function AntreanPrint() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedPagesId, setCopiedPagesId] = useState(null);

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePrintOrders();

  const handleCopyPages = (pagesStr, orderId) => {
    if (!pagesStr) return;
    navigator.clipboard.writeText(pagesStr);
    setCopiedPagesId(orderId);
    setTimeout(() => setCopiedPagesId(null), 2000);
  };

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
        const specs = parsePrintSpecs(o);
        const pageNotes = parseOrderPageNotes(o.notes);

        return (
          <div className="space-y-1.5 max-w-xs">
            {/* Nama File */}
            <div className="flex items-center gap-1.5 font-medium text-xs text-slate-800">
              <FileText size={14} className="text-blue-500 shrink-0" />
              <span className="truncate max-w-[200px]" title={o.fileName}>
                {o.fileName || "Dokumen Cetak"}
              </span>
            </div>

            {/* Total Halaman Cetak & Kertas */}
            <div className="text-xs space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900">
                  {specs.effectivePageCount || specs.totalPages} Hal ({specs.paperSize})
                </span>
                <span className="text-slate-500 text-[11px]">
                  • {specs.isColor ? "Warna" : "Hitam Putih"} • {specs.copies} Rangkap
                </span>
              </div>
            </div>

            {/* Opsi Jilid / Finishing */}
            {specs.finishing && specs.finishing !== "Tanpa Jilid (Stapler)" && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                <BookOpen size={11} className="shrink-0" />
                <span>{specs.finishing}</span>
              </div>
            )}

            {/* Instruksi Halaman yang Dicetak vs Dilewati */}
            {pageNotes.isCustom ? (
              <div className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px]">
                {/* Halaman yang dicetak */}
                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <Printer size={12} className="text-emerald-600" />
                    Cetak Hal:
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-300">
                      {pageNotes.printPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPages(pageNotes.printPages, o.id)}
                      className="p-1 rounded bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 transition-colors"
                      title="Salin nomor halaman ke clipboard untuk paste di printer dialog"
                    >
                      {copiedPagesId === o.id ? (
                        <Check size={11} className="text-emerald-600" />
                      ) : (
                        <Copy size={11} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Halaman yang dilewati */}
                {pageNotes.skipPages && (
                  <div className="flex items-center justify-between text-[10px] text-rose-600 pt-0.5 border-t border-slate-200/60">
                    <span className="flex items-center gap-1 font-medium">
                      <Scissors size={10} className="text-rose-500" />
                      Lewati:
                    </span>
                    <span className="font-mono font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      Hal {pageNotes.skipPages}
                    </span>
                  </div>
                )}
              </div>
            ) : o.notes ? (
              <p className="text-[10px] italic text-slate-600 bg-slate-100/80 border border-slate-200 rounded px-2 py-0.5">
                {o.notes}
              </p>
            ) : null}
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
          <p className="text-xs text-slate-500 mt-1">
            Kelola dan cetak dokumen PDF yang dikirim mandiri oleh siswa secara teratur.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5"
          >
            <RefreshCw
              size={13}
              className={isFetching ? "animate-spin" : ""}
            />
            <span>Segarkan</span>
          </Button>
        </div>
      </div>

      {/* Kartu Metrik Ringkasan Antrean */}
      <PrintQueueStatsCards
        totalOrders={totalOrders}
        pendingOrders={pendingOrders}
        readyOrders={readyOrders}
        completedOrders={completedOrders}
      />

      {/* Toolbar Filter dan Pencarian */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cari nomor order, nama siswa, NIS, atau nama file..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { label: "Semua Status", value: "ALL" },
          { label: "Menunggu", value: "PENDING" },
          { label: "Diproses", value: "PROCESSING" },
          { label: "Siap Diambil", value: "READY" },
          { label: "Selesai", value: "COMPLETED" },
          { label: "Dibatalkan", value: "CANCELLED" },
        ]}
      />

      {/* Tabel Antrean Dokumen */}
      <Table
        columns={columns}
        data={filteredOrders}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        emptyMessage={
          searchQuery || statusFilter !== "ALL"
            ? "Tidak ada dokumen cetak yang cocok dengan filter pencarian."
            : "Belum ada antrean cetak dokumen yang masuk saat ini."
        }
      />

      {/* Modal Ubah Status Detail */}
      <PrintStatusModal
        selectedOrder={selectedOrderForStatus}
        onClose={() => setSelectedOrderForStatus(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
