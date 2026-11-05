import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Printer,
  FileText,
  Clock,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { formatRupiah } from "../../utils/formatters";
import Button from "../../components/ui/Button";

export default function AntreanPrint() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState(null);

  // Fetch antrean pesanan milik siswa sendiri dari backend dengan auto-refresh setiap 5 detik
  const {
    data: orders = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["myPrintOrders"],
    queryFn: async () => {
      const res = await axiosClient.get("/print/orders?mine=true");
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const handleCopyOrderNumber = (orderNumber, id) => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper untuk merender spesifikasi cetak secara aman
  const renderPrintSpecs = (order) => {
    const specs =
      (typeof order.specs === "object" && order.specs) ||
      (typeof order.options === "object" && order.options) ||
      (typeof order.config === "object" && order.config) ||
      (typeof order.details === "object" && order.details) ||
      (typeof order.totalPages === "object" && order.totalPages) ||
      (typeof order.pageCount === "object" && order.pageCount) ||
      null;

    const rawPages =
      specs?.totalPages ??
      (typeof order.pageCount === "number" || typeof order.pageCount === "string"
        ? order.pageCount
        : typeof order.totalPages === "number" || typeof order.totalPages === "string"
          ? order.totalPages
          : 1);

    const pages =
      typeof rawPages === "object" && rawPages !== null
        ? rawPages.totalPages || 1
        : Number(rawPages) || 1;

    const isColor =
      specs?.isColor ??
      (order.colorType === "COLOR" || order.isColor === true);

    const paper = specs?.paperSize || order.paperSize || "A4";
    const copies = specs?.copies || order.copies || 1;

    return (
      <div className="text-xs space-y-0.5">
        <span className="font-bold text-slate-800 block">
          {pages} Halaman ({paper})
        </span>
        <span className="text-slate-500 block text-[11px]">
          {isColor ? "Warna" : "Hitam Putih"} • {copies} Rangkap
          {order.finishing ? ` • ${order.finishing}` : ""}
        </span>
      </div>
    );
  };

  // Filter Data lokal (pencarian & status)
  const filteredOrders = orders.filter((order) => {
    const orderNo = order.orderNumber || "";
    const fileName = order.fileName || "";

    const matchesSearch =
      orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fileName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="space-y-4 pb-12">
      {/* Header Halaman */}
      <div className="flex items-center justify-between gap-2.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Printer className="text-primary" size={20} />
            Pesanan Cetak Saya
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau status proses dokumen PDF yang Anda kirim ke konter kasir.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs self-start gap-1.5 h-8 px-2.5"
        >
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          Segarkan
        </Button>
      </div>

      {/* Ringkasan Ringkas */}
      {orders.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-accent/15 border border-accent/30 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              <span className="text-amber-900 font-medium">Menunggu Cetak</span>
            </div>
            <span className="font-extrabold text-amber-900 bg-accent/25 px-2 py-0.5 rounded-lg">
              {pendingCount}
            </span>
          </div>

          <div className="bg-success/10 border border-success/30 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              <span className="text-emerald-900 font-medium">Selesai</span>
            </div>
            <span className="font-extrabold text-success bg-success/20 px-2 py-0.5 rounded-lg">
              {orders.length - pendingCount}
            </span>
          </div>
        </div>
      )}

      {/* Filter & Pencarian */}
      <div className="flex flex-col gap-2.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nomor order atau nama file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter size={13} className="text-slate-400 shrink-0 mr-1" />
          {["ALL", "PENDING", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "ALL"
                ? "Semua"
                : st === "PENDING"
                  ? "Menunggu"
                  : "Selesai"}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Pesanan Mandiri */}
      {isLoading ? (
        <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
          <RefreshCw size={20} className="animate-spin text-primary" />
          <span>Memuat pesanan cetak Anda...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-12 px-4 bg-white rounded-2xl border border-slate-200 text-center text-xs space-y-3">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">
              Belum Ada Pesanan Cetak
            </p>
            <p className="text-slate-400 mt-1 max-w-xs mx-auto">
              Unggah dokumen PDF Anda di menu Print untuk mulai mencetak mandiri
              di Business Center.
            </p>
          </div>
          <Link
            to="/siswa/print"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus size={14} />
            Buat Pesanan Print Baru
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const fileUrl = order.fileUrl
              ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${order.fileUrl.replace(/\\/g, "/")}`
              : null;
            const isCompleted = order.status === "COMPLETED";

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3"
              >
                {/* Header Kartu: No. Order + Tag Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-xs text-slate-800">
                      {order.orderNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyOrderNumber(order.orderNumber, order.id)
                      }
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                      title="Salin Nomor Order"
                    >
                      {copiedId === order.id ? (
                        <Check size={12} className="text-success" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      isCompleted
                        ? "bg-success/10 text-success border border-success/30"
                        : "bg-accent/15 text-amber-800 border border-accent/30"
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 size={11} />
                        Selesai
                      </>
                    ) : (
                      <>
                        <Clock size={11} className="animate-spin" />
                        Menunggu Kasir
                      </>
                    )}
                  </span>
                </div>

                {/* Info File & Tanggal */}
                <div className="space-y-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-700 flex items-center gap-1.5 font-medium truncate max-w-[210px]">
                      <FileText size={14} className="shrink-0 text-primary" />
                      {order.fileName || "Dokumen Cetak"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" },
                          )
                        : "-"}
                    </span>
                  </div>

                  {/* Spesifikasi Dokumen */}
                  <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <div>{renderPrintSpecs(order)}</div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Total Tagihan
                      </span>
                      <span className="font-extrabold text-sm text-primary">
                        {formatRupiah(order.totalPrice || 0)}
                      </span>
                    </div>
                  </div>

                  {order.notes && (
                    <p className="text-[10px] italic text-amber-900 bg-accent/10 rounded px-2 py-0.5 mt-1 border border-accent/30">
                      Catatan: "{order.notes}"
                    </p>
                  )}
                </div>

                {/* Footer Kartu: Instruksi & File Link */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-[10px] text-slate-400">
                    Tunjukkan No. Order ini ke kasir
                  </span>

                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover hover:underline"
                      title="Lihat File PDF"
                    >
                      <ExternalLink size={12} />
                      Lihat File
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
