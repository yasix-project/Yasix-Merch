import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { formatRupiah } from "../../utils/formatters";
import Button from "../../components/ui/Button";

export default function AntreanPrint() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch antrean print dari backend
  const {
    data: orders = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["printOrders"],
    queryFn: async () => {
      const res = await axiosClient.get("/print/orders");
      return res.data?.data || res.data || [];
    },
  });

  // Mutasi update status (PENDING -> COMPLETED)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      return await axiosClient.patch(`/print/orders/${orderId}/status`, {
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["printOrders"] });
    },
  });

  // Helper untuk merender spesifikasi cetak secara aman (Mencegah Error React Child)
  const renderPrintSpecs = (order) => {
    // Cek jika spesifikasi dikirim sebagai objek di specs / options / config / details / totalPages / pageCount
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

  // Filter Data
  const filteredOrders = orders.filter((order) => {
    const studentName = order.student?.name || order.studentName || "";
    const orderNo = order.orderNumber || "";
    const fileName = order.fileName || "";

    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fileName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Printer className="text-blue-600" size={24} />
            Antrean Cetak Mandiri Dokumen
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau file dokumen PDF yang dikirim siswa dan ubah status setelah
            dicetak.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs self-start sm:self-auto gap-2"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Segarkan Data
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nomor order, siswa, file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-slate-400" />
          <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
            {["ALL", "PENDING", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? "bg-blue-600 text-white shadow-xs"
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
      </div>

      {/* Tabel Antrean */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw size={20} className="animate-spin text-blue-600" />
            <span>Memuat antrean dokumen...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <AlertCircle size={22} className="text-slate-300" />
            <span>Tidak ada antrean cetak yang sesuai.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Order & Waktu</th>
                  <th className="py-3 px-4">Siswa Pemesan</th>
                  <th className="py-3 px-4">Dokumen PDF</th>
                  <th className="py-3 px-4">Spesifikasi</th>
                  <th className="py-3 px-4">Total Biaya</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.map((order) => {
                  const studentName =
                    order.student?.name || order.studentName || "Siswa Yasix";
                  const studentNis = order.student?.nis || order.nis || "-";
                  const fileUrl = order.fileUrl
                    ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${order.fileUrl.replace(/\\/g, "/")}`
                    : null;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Order No */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={11} />
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleTimeString(
                                "id-ID",
                                { hour: "2-digit", minute: "2-digit" },
                              )
                            : "-"}
                        </span>
                      </td>

                      {/* Siswa */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {studentName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 block truncate max-w-[130px]">
                              {studentName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              NIS: {studentNis}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* File */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 max-w-[180px]">
                          <FileText
                            size={16}
                            className="text-red-500 shrink-0"
                          />
                          <span
                            className="font-medium text-slate-700 truncate"
                            title={order.fileName}
                          >
                            {order.fileName}
                          </span>
                        </div>
                        {order.notes && (
                          <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 truncate max-w-[180px]">
                            Ket: {order.notes}
                          </p>
                        )}
                      </td>

                      {/* Spesifikasi (Aman dari error object rendering) */}
                      <td className="py-3.5 px-4">{renderPrintSpecs(order)}</td>

                      {/* Biaya */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {formatRupiah(order.totalPrice || 0)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {order.status === "COMPLETED" ? (
                            <>
                              <CheckCircle2 size={12} />
                              Selesai
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              Menunggu
                            </>
                          )}
                        </span>
                      </td>

                      {/* Aksi Kasir */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Buka / Unduh File PDF"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}

                          {order.status === "PENDING" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  orderId: order.id,
                                  status: "COMPLETED",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                              className="text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                            >
                              Selesai Cetak
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
