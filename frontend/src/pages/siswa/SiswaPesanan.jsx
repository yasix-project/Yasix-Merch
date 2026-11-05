import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag,
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
  QrCode,
  PackageCheck,
  XCircle,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useStudentOrders } from "../../hooks/siswa/useStudentTransactions";
import { formatRupiah } from "../../utils/formatters";
import OrderQrModal from "../../components/siswa/OrderQrModal";
import Button from "../../components/ui/Button";

export default function SiswaPesanan() {
  const [activeTab, setActiveTab] = useState("PRODUK"); // "PRODUK" | "PRINT"
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState(null);
  const [selectedQrOrder, setSelectedQrOrder] = useState(null);

  // 1. Fetch Pesanan Produk (Katalog)
  const {
    data: productOrders = [],
    isLoading: loadingProductOrders,
    isFetching: fetchingProductOrders,
    refetch: refetchProductOrders,
  } = useStudentOrders();

  // 2. Fetch Pesanan Cetak PDF
  const {
    data: printOrders = [],
    isLoading: loadingPrintOrders,
    isFetching: fetchingPrintOrders,
    refetch: refetchPrintOrders,
  } = useQuery({
    queryKey: ["myPrintOrders"],
    queryFn: async () => {
      const res = await axiosClient.get("/print/orders?mine=true");
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper untuk merender spesifikasi cetak PDF
  const renderPrintSpecs = (order) => {
    const specs =
      (typeof order.specs === "object" && order.specs) ||
      (typeof order.options === "object" && order.options) ||
      (typeof order.config === "object" && order.config) ||
      (typeof order.details === "object" && order.details) ||
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

  // Filter Data Produk
  const filteredProductOrders = productOrders.filter((order) => {
    const invoice = order.invoiceNumber || "";
    const items = order.items || [];
    const itemNames = items.map((i) => i.itemName || i.product?.name || "").join(" ");

    const matchesSearch =
      invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemNames.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter Data Print
  const filteredPrintOrders = printOrders.filter((order) => {
    const orderNo = order.orderNumber || "";
    const fileName = order.fileName || "";

    const matchesSearch =
      orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fileName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const bookedProductCount = productOrders.filter(
    (o) => o.status === "BOOKED",
  ).length;
  const pendingPrintCount = printOrders.filter(
    (o) => o.status === "PENDING",
  ).length;

  const currentFetching =
    activeTab === "PRODUK" ? fetchingProductOrders : fetchingPrintOrders;
  const handleRefetch = () => {
    if (activeTab === "PRODUK") refetchProductOrders();
    else refetchPrintOrders();
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header Halaman */}
      <div className="flex items-start justify-between gap-2.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {activeTab === "PRODUK" ? (
              <ShoppingBag className="text-primary" size={20} />
            ) : (
              <Printer className="text-primary" size={20} />
            )}
            Pesanan Saya
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau status belanja produk dan antrean cetak PDF Anda di Business
            Center.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefetch}
          disabled={currentFetching}
          className="text-xs self-start gap-1.5 h-8 px-2.5 rounded-xl font-bold"
        >
          <RefreshCw
            size={13}
            className={currentFetching ? "animate-spin" : ""}
          />
          Segarkan
        </Button>
      </div>

      {/* Navigasi Tab Terpadu (Produk vs Print) */}
      <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-2xl gap-1 text-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab("PRODUK");
            setStatusFilter("ALL");
          }}
          className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === "PRODUK"
              ? "bg-white text-primary shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShoppingBag size={15} />
          <span>Belanja Produk</span>
          {bookedProductCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-accent text-dark text-[10px] font-black flex items-center justify-center shadow-2xs">
              {bookedProductCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("PRINT");
            setStatusFilter("ALL");
          }}
          className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === "PRINT"
              ? "bg-white text-primary shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Printer size={15} />
          <span>Print Dokumen</span>
          {pendingPrintCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-accent text-dark text-[10px] font-black flex items-center justify-center shadow-2xs">
              {pendingPrintCount}
            </span>
          )}
        </button>
      </div>

      {/* Ringkasan Status Tab Aktif */}
      {activeTab === "PRODUK" && productOrders.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-accent/15 border border-accent/30 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              <span className="text-amber-900 font-medium">Menunggu Kasir</span>
            </div>
            <span className="font-extrabold text-amber-900 bg-accent/25 px-2 py-0.5 rounded-lg">
              {bookedProductCount}
            </span>
          </div>

          <div className="bg-success/10 border border-success/30 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              <span className="text-emerald-950 font-medium">Selesai</span>
            </div>
            <span className="font-extrabold text-success bg-success/20 px-2 py-0.5 rounded-lg">
              {productOrders.filter((o) => o.status === "COMPLETED").length}
            </span>
          </div>
        </div>
      )}

      {activeTab === "PRINT" && printOrders.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-accent/15 border border-accent/30 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              <span className="text-amber-900 font-medium">Menunggu Cetak</span>
            </div>
            <span className="font-extrabold text-amber-900 bg-accent/25 px-2 py-0.5 rounded-lg">
              {pendingPrintCount}
            </span>
          </div>

          <div className="bg-success/10 border border-success/30 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              <span className="text-emerald-950 font-medium">Selesai</span>
            </div>
            <span className="font-extrabold text-success bg-success/20 px-2 py-0.5 rounded-lg">
              {printOrders.length - pendingPrintCount}
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
            placeholder={
              activeTab === "PRODUK"
                ? "Cari nomor invoice (ORD-...) atau nama barang..."
                : "Cari nomor order cetak atau nama file..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <Filter size={13} className="text-slate-400 shrink-0 mr-1" />
          {(activeTab === "PRODUK"
            ? [
                { key: "ALL", label: "Semua" },
                { key: "BOOKED", label: "Menunggu Kasir" },
                { key: "COMPLETED", label: "Selesai" },
                { key: "CANCELLED", label: "Dibatalkan" },
              ]
            : [
                { key: "ALL", label: "Semua" },
                { key: "PENDING", label: "Menunggu" },
                { key: "COMPLETED", label: "Selesai" },
              ]
          ).map((st) => (
            <button
              key={st.key}
              type="button"
              onClick={() => setStatusFilter(st.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                statusFilter === st.key
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* === KONTEN TAB PRODUK === */}
      {activeTab === "PRODUK" && (
        <>
          {loadingProductOrders ? (
            <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw size={20} className="animate-spin text-primary" />
              <span>Memuat pesanan produk Anda...</span>
            </div>
          ) : filteredProductOrders.length === 0 ? (
            <div className="py-12 px-4 bg-white rounded-2xl border border-slate-200 text-center text-xs space-y-3">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Belum Ada Pesanan Produk
                </p>
                <p className="text-slate-400 mt-1 max-w-xs mx-auto">
                  Pilih barang di menu Katalog untuk membuat pre-order dan ambil
                  di kasir Business Center.
                </p>
              </div>
              <Link
                to="/siswa/katalog"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Plus size={14} />
                Buka Katalog Produk
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProductOrders.map((order) => {
                const isBooked = order.status === "BOOKED";
                const isCompleted = order.status === "COMPLETED";
                const isCancelled = order.status === "CANCELLED";
                const items = order.items || [];

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3"
                  >
                    {/* Header Kartu: No. Invoice + Badge Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs text-slate-800">
                          {order.invoiceNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(order.invoiceNumber, order.id)
                          }
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                          title="Salin Nomor Invoice"
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
                            : isBooked
                              ? "bg-accent/15 text-amber-800 border border-accent/30"
                              : "bg-danger/10 text-danger border border-danger/30"
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 size={11} />
                            Selesai
                          </>
                        ) : isBooked ? (
                          <>
                            <Clock size={11} className="animate-spin" />
                            Menunggu Kasir
                          </>
                        ) : (
                          <>
                            <XCircle size={11} />
                            Dibatalkan
                          </>
                        )}
                      </span>
                    </div>

                    {/* Informasi Tanggal & Catatan 1 Jam jika BOOKED */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "-"}
                      </span>
                      {isBooked && (
                        <span className="text-[10px] text-amber-800 font-semibold bg-accent/15 px-2 py-0.5 rounded-md">
                          Batas: 1 Jam di Kasir
                        </span>
                      )}
                    </div>

                    {/* Rincian Barang yang Dipesan */}
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 text-slate-700"
                        >
                          <span className="truncate max-w-[210px] font-medium">
                            {item.quantity}x {item.itemName || item.product?.name}
                          </span>
                          <span className="font-semibold text-slate-900 shrink-0">
                            {formatRupiah(item.subtotal || item.price * item.quantity)}
                          </span>
                        </div>
                      ))}

                      {/* Baris Total Tagihan */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          Total Tagihan Kasir:
                        </span>
                        <span className="font-black text-sm text-primary">
                          {formatRupiah(order.totalAmount || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Footer Kartu: Tombol Tampilkan QR */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        {isBooked
                          ? "Tunjukkan kode ini ke kasir saat pengambilan"
                          : "Pesanan telah selesai diproses"}
                      </span>

                      {isBooked && (
                        <button
                          type="button"
                          onClick={() => setSelectedQrOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors"
                        >
                          <QrCode size={13} />
                          <span>Kode QR</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* === KONTEN TAB PRINT === */}
      {activeTab === "PRINT" && (
        <>
          {loadingPrintOrders ? (
            <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw size={20} className="animate-spin text-primary" />
              <span>Memuat antrean cetak Anda...</span>
            </div>
          ) : filteredPrintOrders.length === 0 ? (
            <div className="py-12 px-4 bg-white rounded-2xl border border-slate-200 text-center text-xs space-y-3">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Belum Ada Pesanan Cetak
                </p>
                <p className="text-slate-400 mt-1 max-w-xs mx-auto">
                  Unggah dokumen PDF Anda di menu Print untuk mulai mencetak
                  mandiri di Business Center.
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
              {filteredPrintOrders.map((order) => {
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
                            handleCopy(order.orderNumber, order.id)
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
                          <FileText
                            size={14}
                            className="shrink-0 text-primary"
                          />
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
        </>
      )}

      {/* Modal QR Code Pesanan */}
      <OrderQrModal
        isOpen={Boolean(selectedQrOrder)}
        order={selectedQrOrder}
        onClose={() => setSelectedQrOrder(null)}
      />
    </div>
  );
}
