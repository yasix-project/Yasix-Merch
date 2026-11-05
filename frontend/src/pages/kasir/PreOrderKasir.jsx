import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  AlertCircle,
  Printer,
  RefreshCw,
  Eye,
  Check,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Bell,
  Coins,
} from "lucide-react";

import Table from "../../components/ui/Table";
import FilterBar from "../../components/ui/FilterBar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import StrukPrinter from "../../components/shared/StrukPrinter";
import { useConfirm } from "../../hooks/useConfirm";
import {
  useTransactions,
  useTransactionMutations,
} from "../../hooks/admin/useTransactions";
import { formatDate, formatRupiah } from "../../utils/formatters";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toast";
import { playNotificationSound } from "../../utils/sound";
import { useAuthStore } from "../../store/authStore";

export default function PreOrderKasir() {
  const confirm = useConfirm();
  const currentUser = useAuthStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);
  const [orderToComplete, setOrderToComplete] = useState(null);
  const [payAmountInput, setPayAmountInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [autoPrintAfterComplete, setAutoPrintAfterComplete] = useState(true);

  const [printData, setPrintData] = useState([]);
  const strukRef = useRef();

  // Polling data transaksi secara berkala (setiap 5 detik)
  const {
    data: allTransactions = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTransactions(
    {},
    {
      refetchInterval: 5000,
    },
  );

  const { markReady, complete, cancel, updateStatus } =
    useTransactionMutations();

  // Print Thermal Struk
  const handlePrint = useReactToPrint({
    content: () => strukRef.current,
    documentTitle: "Struk_PreOrder_Yasix",
    onAfterPrint: () => setPrintData([]),
  });

  useEffect(() => {
    if (printData.length > 0) {
      handlePrint();
    }
  }, [printData, handlePrint]);

  // Audio & visual alert saat ada order BOOKED baru
  const prevBookedIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  // Filter hanya transaksi yang merupakan pesanan / pre-order siswa
  const preOrders = allTransactions.filter((tx) => {
    // Siswa order: invoice diawali "ORD-" atau memiliki studentId & status pre-order
    return (
      (tx.invoiceNumber && tx.invoiceNumber.startsWith("ORD-")) ||
      Boolean(tx.studentId && tx.status !== "COMPLETED") ||
      (tx.studentId && tx.paymentMethod === "PAY_ON_PICKUP")
    );
  });

  // Deteksi order pre-order baru yang berstatus BOOKED
  useEffect(() => {
    const currentBooked = preOrders.filter((tx) => tx.status === "BOOKED");
    const currentBookedIds = new Set(currentBooked.map((tx) => tx.id));

    if (!isInitialLoadRef.current) {
      const newOrders = currentBooked.filter(
        (tx) => !prevBookedIdsRef.current.has(tx.id),
      );

      if (newOrders.length > 0) {
        playNotificationSound("chime");
        const latest = newOrders[0];
        showSuccessToast(
          `Pesanan baru dari ${latest.student?.name || "Siswa"} (${latest.invoiceNumber})`,
          {
            icon: "🔔",
            duration: 5000,
          },
        );
      }
    } else {
      isInitialLoadRef.current = false;
    }

    prevBookedIdsRef.current = currentBookedIds;
  }, [preOrders]);

  // Filter pencarian dan tab status
  const filteredOrders = preOrders.filter((order) => {
    const matchesSearch =
      order.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.student?.nis?.includes(searchQuery) ||
      (order.items || []).some((i) =>
        (i.itemName || i.product?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Metrik ringkasan
  const totalCount = preOrders.length;
  const bookedCount = preOrders.filter((o) => o.status === "BOOKED").length;
  const readyCount = preOrders.filter((o) => o.status === "READY").length;
  const completedCount = preOrders.filter(
    (o) => o.status === "COMPLETED",
  ).length;

  // Aksi: Tandai Siap Diambil (READY)
  const handleMarkReady = async (order) => {
    try {
      await markReady.mutateAsync(order.id);
    } catch (err) {
      // Error handled by mutation
    }
  };

  // Aksi: Batalkan Pesanan (Void & Restore Stock)
  const handleCancelOrder = async (order) => {
    const isConfirmed = await confirm({
      title: "Batalkan Pesanan Pre-Order?",
      message: `Pesanan ${order.invoiceNumber} milik ${
        order.student?.name || "siswa"
      } akan dibatalkan dan seluruh stok produk fisik akan dikembalikan ke inventaris.`,
      confirmText: "Ya, Batalkan Pesanan",
      cancelText: "Kembali",
      variant: "danger",
    });

    if (isConfirmed) {
      cancel.mutate(order.id);
    }
  };

  // Aksi: Kembalikan status ke BOOKED
  const handleRevertToBooked = async (order) => {
    const isConfirmed = await confirm({
      title: "Kembalikan Status ke Menunggu?",
      message: `Status pesanan ${order.invoiceNumber} akan dikembalikan menjadi Menunggu Diproses.`,
      confirmText: "Ya, Kembalikan",
      cancelText: "Batal",
      variant: "warning",
    });

    if (isConfirmed) {
      updateStatus.mutate({ id: order.id, status: "BOOKED" });
    }
  };

  // Buka modal pelunasan
  const handleOpenCompleteModal = (order) => {
    setOrderToComplete(order);
    setPayAmountInput(String(order.totalAmount || ""));
    setPaymentMethod(order.paymentMethod === "QRIS" ? "QRIS" : "CASH");
  };

  // Eksekusi Pelunasan & Ambil di Kasir
  const handleConfirmComplete = async (e) => {
    e.preventDefault();
    if (!orderToComplete) return;

    const total = Number(orderToComplete.totalAmount || 0);
    const payNum = Number(payAmountInput || 0);

    if (payNum < total) {
      showErrorToast(`Uang pembayaran kurang. Total: ${formatRupiah(total)}`);
      return;
    }

    try {
      const updated = await complete.mutateAsync({
        id: orderToComplete.id,
        data: {
          payAmount: payNum,
          paymentMethod,
        },
      });

      if (autoPrintAfterComplete) {
        setPrintData([
          {
            ...orderToComplete,
            payAmount: payNum,
            changeAmount: payNum - total,
            paymentMethod,
            status: "COMPLETED",
            cashier: currentUser,
          },
        ]);
      }

      setOrderToComplete(null);
    } catch (err) {
      // Error handled by mutation
    }
  };

  // Cetak ulang struk pesanan yang sudah selesai
  const handleReprintOrder = (order) => {
    setPrintData([order]);
  };

  const columns = [
    {
      header: "No. Invoice & Waktu",
      cellClassName: "font-mono text-xs",
      render: (o) => {
        const isBooked = o.status === "BOOKED";
        const isReady = o.status === "READY";
        const isExpired =
          o.expiresAt && new Date(o.expiresAt) < new Date() && isBooked;

        return (
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block">
              {o.invoiceNumber}
            </span>
            <span className="text-[11px] font-normal text-slate-400 block">
              {formatDate(o.createdAt, true)}
            </span>
            {isBooked && (
              <span
                className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  isExpired
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {isExpired ? "Kadaluwarsa (>1 jam)" : "Batas Ambil: 1 Jam"}
              </span>
            )}
            {isReady && (
              <span className="inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                Siap di Konter
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Siswa Pemesan",
      render: (o) => (
        <div>
          <span className="font-bold text-slate-800 text-xs block">
            {o.student?.name || "Siswa Yasix"}
          </span>
          {o.student?.nis ? (
            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
              NIS: {o.student.nis}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 italic block mt-0.5">
              Member Siswa
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Item Pesanan",
      render: (o) => {
        const items = o.items || [];
        const firstTwo = items.slice(0, 2);
        const remaining = items.length - 2;

        return (
          <div className="space-y-1 max-w-[220px]">
            {firstTwo.map((it, idx) => (
              <div
                key={idx}
                className="text-xs text-slate-700 flex items-center justify-between gap-1.5"
              >
                <span className="truncate">
                  {it.quantity}x {it.itemName || it.product?.name}
                </span>
                <span className="font-semibold text-slate-900 text-[11px] shrink-0">
                  {formatRupiah(it.subtotal || it.price * it.quantity)}
                </span>
              </div>
            ))}
            {remaining > 0 && (
              <span className="text-[10px] text-blue-600 font-semibold block">
                +{remaining} item lainnya...
              </span>
            )}
            {o.discountAmount > 0 && (
              <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Diskon {formatRupiah(o.discountAmount)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Total Tagihan",
      cellClassName: "font-black text-blue-600 text-xs",
      render: (o) => (
        <div>
          <span>{formatRupiah(o.totalAmount)}</span>
          <span className="block text-[10px] font-medium text-slate-400 uppercase mt-0.5">
            {o.paymentMethod === "PAY_ON_PICKUP"
              ? "Bayar di Kasir"
              : o.paymentMethod}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (o) => {
        const isBooked = o.status === "BOOKED";
        const isReady = o.status === "READY";
        const isCompleted = o.status === "COMPLETED";

        if (isReady) {
          return (
            <Badge variant="success">
              <PackageCheck size={12} className="mr-1" />
              Siap Diambil
            </Badge>
          );
        }

        if (isBooked) {
          return (
            <Badge variant="warning">
              <Clock size={12} className="mr-1 animate-spin" />
              Menunggu
            </Badge>
          );
        }

        if (isCompleted) {
          return (
            <Badge variant="primary">
              <CheckCircle2 size={12} className="mr-1" />
              Selesai
            </Badge>
          );
        }

        return (
          <Badge variant="danger">
            <XCircle size={12} className="mr-1" />
            Dibatalkan
          </Badge>
        );
      },
    },
    {
      header: "Aksi",
      className: "text-right",
      render: (o) => {
        const isBooked = o.status === "BOOKED";
        const isReady = o.status === "READY";
        const isCompleted = o.status === "COMPLETED";

        return (
          <div className="flex items-center justify-end gap-1.5">
            {isBooked && (
              <Button
                size="xs"
                variant="primary"
                onClick={() => handleMarkReady(o)}
                disabled={markReady.isPending}
                title="Tandai pesanan siap diambil siswa"
              >
                <PackageCheck size={13} />
                <span>Siap Ambil</span>
              </Button>
            )}

            {isReady && (
              <Button
                size="xs"
                variant="primary"
                onClick={() => handleOpenCompleteModal(o)}
                title="Pelunasan dan serahkan barang"
              >
                <Coins size={13} />
                <span>Bayar & Ambil</span>
              </Button>
            )}

            {isCompleted && (
              <Button
                size="xs"
                variant="secondary"
                onClick={() => handleReprintOrder(o)}
                title="Cetak ulang struk thermal"
              >
                <Printer size={13} />
                <span>Struk</span>
              </Button>
            )}

            <Button
              size="xs"
              variant="outline"
              onClick={() => setSelectedOrderForDetail(o)}
              title="Lihat detail transaksi"
            >
              <Eye size={13} />
            </Button>
          </div>
        );
      },
    },
  ];

  const filterTabs = [
    { label: `Semua (${totalCount})`, value: "ALL" },
    { label: `Menunggu (${bookedCount})`, value: "BOOKED" },
    { label: `Siap Diambil (${readyCount})`, value: "READY" },
    { label: `Selesai (${completedCount})`, value: "COMPLETED" },
    { label: "Dibatalkan", value: "CANCELLED" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Container Struk Tersembunyi untuk Printer Thermal */}
      <div className="hidden">
        <StrukPrinter ref={strukRef} transactions={printData} />
      </div>

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Pesanan Pre-Order Siswa
                {bookedCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white animate-pulse">
                    <Bell size={11} /> {bookedCount} Masuk
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola transaksi pre-order mandiri siswa, perbarui status siap
                ambil, dan proses pelunasan di konter kasir.
              </p>
            </div>
          </div>
        </div>

        {/* Tombol Sinkronisasi / Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sinkronisasi otomatis (5s)</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs font-bold gap-1.5 rounded-xl border-slate-200"
          >
            <RefreshCw
              size={13}
              className={isFetching ? "animate-spin text-blue-600" : ""}
            />
            <span>Segarkan</span>
          </Button>
        </div>
      </div>

      {/* Baris Ringkasan Kartu Metrik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">
            Total Pre-Order
          </span>
          <p className="text-2xl font-black text-slate-900">{totalCount}</p>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">
              Menunggu Diproses
            </span>
            <Clock size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900">{bookedCount}</p>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">
              Siap Diambil
            </span>
            <PackageCheck size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-900">{readyCount}</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Selesai Diambil
            </span>
            <CheckCircle2 size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-700">{completedCount}</p>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <FilterBar
        searchPlaceholder="Cari no. invoice, nama siswa, atau barang..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filterTabs={filterTabs}
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
      />

      {/* Tabel Data Pre-Order */}
      <Table
        columns={columns}
        data={filteredOrders}
        keyField="id"
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        emptyMessage={
          searchQuery
            ? "Tidak ditemukan pre-order dengan kata kunci tersebut."
            : "Belum ada pesanan pre-order siswa yang masuk."
        }
      />

      {/* MODAL 1: Pelunasan & Ambil di Kasir */}
      {orderToComplete && (
        <Modal
          isOpen={Boolean(orderToComplete)}
          onClose={() => setOrderToComplete(null)}
          title="Pelunasan & Pengambilan Pesanan"
        >
          <form onSubmit={handleConfirmComplete} className="space-y-4">
            {/* Rincian Invoice & Siswa */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">No. Invoice:</span>
                <span className="font-mono font-bold text-slate-900">
                  {orderToComplete.invoiceNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pemesan:</span>
                <span className="font-bold text-slate-900">
                  {orderToComplete.student?.name || "Siswa Umum"} (
                  {orderToComplete.student?.nis || "-"})
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-700">
                  Total Tagihan:
                </span>
                <span className="font-black text-base text-blue-600">
                  {formatRupiah(orderToComplete.totalAmount)}
                </span>
              </div>
            </div>

            {/* Pilihan Metode Pembayaran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Button
                  type="button"
                  size="sm"
                  variant={paymentMethod === "CASH" ? "primary" : "outline"}
                  onClick={() => setPaymentMethod("CASH")}
                >
                  Tunai (Cash)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={paymentMethod === "QRIS" ? "primary" : "outline"}
                  onClick={() => setPaymentMethod("QRIS")}
                >
                  QRIS Yasix
                </Button>
              </div>
            </div>

            {/* Input Nominal Uang Diterima */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nominal Uang Diterima (Rp)
              </label>
              <input
                type="number"
                min={Number(orderToComplete.totalAmount || 0)}
                value={payAmountInput}
                onChange={(e) => setPayAmountInput(e.target.value)}
                placeholder="Masukkan nominal uang fisik"
                required
                className="w-full h-11 px-3 text-sm font-mono font-bold bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
              />

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  {
                    label: "Uang Pas",
                    amount: Number(orderToComplete.totalAmount || 0),
                  },
                  { label: "10rb", amount: 10000 },
                  { label: "20rb", amount: 20000 },
                  { label: "50rb", amount: 50000 },
                  { label: "100rb", amount: 100000 },
                ]
                  .filter(
                    (btn) =>
                      btn.amount >= Number(orderToComplete.totalAmount || 0),
                  )
                  .map((btn, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      size="xs"
                      variant="secondary"
                      onClick={() => setPayAmountInput(String(btn.amount))}
                    >
                      {btn.label}
                    </Button>
                  ))}
              </div>
            </div>

            {/* Kalkulasi Kembalian */}
            {Number(payAmountInput || 0) >=
              Number(orderToComplete.totalAmount || 0) && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                <span className="font-semibold text-emerald-900">
                  Uang Kembalian:
                </span>
                <span className="font-mono font-black text-sm text-emerald-700">
                  {formatRupiah(
                    Number(payAmountInput || 0) -
                      Number(orderToComplete.totalAmount || 0),
                  )}
                </span>
              </div>
            )}

            {/* Pilihan Cetak Struk */}
            <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={autoPrintAfterComplete}
                onChange={(e) => setAutoPrintAfterComplete(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span>Cetak struk thermal otomatis setelah pelunasan</span>
            </label>

            {/* Tombol Konfirmasi */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOrderToComplete(null)}
                className="w-1/3 text-xs py-2.5 rounded-xl font-bold border-slate-200"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={complete.isPending}
                className="w-2/3 text-xs py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
              >
                {complete.isPending ? "Memproses..." : "Konfirmasi & Serahkan"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Rincian Lengkap Pesanan */}
      {selectedOrderForDetail && (
        <Modal
          isOpen={Boolean(selectedOrderForDetail)}
          onClose={() => setSelectedOrderForDetail(null)}
          title="Detail Transaksi Pre-Order"
        >
          <div className="space-y-4 text-xs">
            {/* Header Ringkas */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Nomor Invoice</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedOrderForDetail.invoiceNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Waktu Order</span>
                <span className="font-medium text-slate-700">
                  {formatDate(selectedOrderForDetail.createdAt, true)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <Badge
                  variant={
                    selectedOrderForDetail.status === "READY"
                      ? "success"
                      : selectedOrderForDetail.status === "BOOKED"
                        ? "warning"
                        : selectedOrderForDetail.status === "COMPLETED"
                          ? "primary"
                          : "danger"
                  }
                >
                  {selectedOrderForDetail.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pemesan</span>
                <span className="font-bold text-slate-900">
                  {selectedOrderForDetail.student?.name || "Siswa Umum"} (NIS:{" "}
                  {selectedOrderForDetail.student?.nis || "-"})
                </span>
              </div>
            </div>

            {/* Daftar Barang */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block text-xs">
                Daftar Barang yang Dipesan:
              </span>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {(selectedOrderForDetail.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {it.itemName || it.product?.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {it.quantity} x {formatRupiah(it.price)}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatRupiah(it.subtotal || it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rincian Finansial */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Barang:</span>
                <span className="font-medium text-slate-700">
                  {formatRupiah(selectedOrderForDetail.subtotal)}
                </span>
              </div>
              {selectedOrderForDetail.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Potongan Voucher:</span>
                  <span>
                    -{formatRupiah(selectedOrderForDetail.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-black text-sm pt-1.5 border-t border-slate-200">
                <span>Total Tagihan:</span>
                <span className="text-blue-600">
                  {formatRupiah(selectedOrderForDetail.totalAmount)}
                </span>
              </div>
            </div>

            {/* Tombol Aksi di Modal Detail */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrderForDetail(null)}
              >
                Tutup
              </Button>

              {selectedOrderForDetail.status === "BOOKED" && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      const o = selectedOrderForDetail;
                      setSelectedOrderForDetail(null);
                      handleCancelOrder(o);
                    }}
                  >
                    Batalkan Pesanan
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const o = selectedOrderForDetail;
                      setSelectedOrderForDetail(null);
                      handleMarkReady(o);
                    }}
                  >
                    Tandai Siap
                  </Button>
                </>
              )}

              {selectedOrderForDetail.status === "READY" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const o = selectedOrderForDetail;
                      setSelectedOrderForDetail(null);
                      handleRevertToBooked(o);
                    }}
                  >
                    Kembalikan ke Menunggu
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      const o = selectedOrderForDetail;
                      setSelectedOrderForDetail(null);
                      handleCancelOrder(o);
                    }}
                  >
                    Batalkan
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const o = selectedOrderForDetail;
                      setSelectedOrderForDetail(null);
                      handleOpenCompleteModal(o);
                    }}
                  >
                    Pelunasan & Bayar
                  </Button>
                </>
              )}

              {selectedOrderForDetail.status === "COMPLETED" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    handleReprintOrder(selectedOrderForDetail);
                  }}
                >
                  <Printer size={13} className="mr-1" />
                  Cetak Ulang Struk
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
