import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Printer,
  RefreshCw,
  Eye,
  Bell,
  Coins,
  Camera,
  QrCode,
} from "lucide-react";

import Table from "../../components/ui/Table";
import FilterBar from "../../components/ui/FilterBar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StrukPrinter from "../../components/shared/StrukPrinter";
import BarcodeScannerModal from "../../components/shared/BarcodeScannerModal";
import OrderConfirmModal from "../../components/kasir/OrderConfirmModal";
import PreOrderStatsCards from "../../components/kasir/PreOrderStatsCards";
import PreOrderHeaderActions from "../../components/kasir/PreOrderHeaderActions";
import { useConfirm } from "../../hooks/useConfirm";
import {
  useTransactions,
  useTransactionMutations,
} from "../../hooks/admin/useTransactions";
import { formatDate, formatRupiah } from "../../utils/formatters";
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toast";
import { playNotificationSound, playBarcodeBeep } from "../../utils/sound";
import { useAuthStore } from "../../store/authStore";

export default function PreOrderKasir() {
  const confirm = useConfirm();
  const currentUser = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState(null);

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

  // Fungsi Scan Barcode / QR Order Siswa
  const handleScanOrder = (scannedCode) => {
    if (!scannedCode) return;
    const cleanCode = scannedCode.trim();

    playBarcodeBeep();

    // 1. Cari berdasarkan No. Invoice (cth: ORD-...)
    let matched = preOrders.find(
      (o) =>
        o.invoiceNumber?.toLowerCase() === cleanCode.toLowerCase() ||
        (cleanCode.toUpperCase().includes(o.invoiceNumber?.toUpperCase()) && o.invoiceNumber) ||
        o.id === cleanCode
    );

    // 2. Jika belum ketemu, cari berdasarkan NIS Siswa (ambil order aktif siswa)
    if (!matched) {
      matched = preOrders.find(
        (o) =>
          (o.student?.nis && o.student.nis === cleanCode && o.status !== "CANCELLED") ||
          (cleanCode.includes(o.student?.nis) && o.student?.nis)
      );
    }

    // 3. Jika belum ketemu, cek di allTransactions
    if (!matched) {
      matched = allTransactions.find(
        (t) =>
          t.invoiceNumber?.toLowerCase() === cleanCode.toLowerCase() ||
          t.id === cleanCode
      );
    }

    if (matched) {
      playNotificationSound("chime");
      setIsBarcodeScannerOpen(false);
      setOrderToConfirm(matched);
      showSuccessToast(`Pesanan ${matched.invoiceNumber} berhasil dipindai!`);
    } else {
      showErrorToast(`Pesanan dengan barcode/QR "${cleanCode}" tidak ditemukan.`);
    }
  };

  // Auto-scan jika ada parameter URL ?scan=ORD-...
  useEffect(() => {
    const scanParam = searchParams.get("scan");
    if (scanParam && preOrders.length > 0) {
      const timer = setTimeout(() => {
        handleScanOrder(scanParam);
        setSearchParams({}, { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams, preOrders]);

  // Global Keyboard Shortcuts (F9 untuk scan, Esc untuk tutup)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F9" || (e.ctrlKey && e.key.toLowerCase() === "b")) {
        e.preventDefault();
        setIsBarcodeScannerOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        if (isBarcodeScannerOpen) setIsBarcodeScannerOpen(false);
        if (orderToConfirm) setOrderToConfirm(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBarcodeScannerOpen, orderToConfirm]);

  // Aksi: Tandai Siap Diambil (READY)
  const handleMarkReady = async (order) => {
    try {
      await markReady.mutateAsync(order.id);
      if (orderToConfirm?.id === order.id) {
        setOrderToConfirm((prev) => (prev ? { ...prev, status: "READY" } : null));
      }
    } catch {
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
      await cancel.mutateAsync(order.id);
      if (orderToConfirm?.id === order.id) {
        setOrderToConfirm(null);
      }
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
      await updateStatus.mutateAsync({ id: order.id, status: "BOOKED" });
      if (orderToConfirm?.id === order.id) {
        setOrderToConfirm((prev) => (prev ? { ...prev, status: "BOOKED" } : null));
      }
    }
  };

  // Aksi: Eksekusi Pelunasan & Ambil di Kasir
  const handleExecuteComplete = async ({ order, payAmount, paymentMethod, autoPrint }) => {
    const total = Number(order.totalAmount || 0);
    const payNum = Number(payAmount || 0);

    if (payNum < total) {
      showErrorToast(`Uang pembayaran kurang. Total: ${formatRupiah(total)}`);
      return;
    }

    try {
      await complete.mutateAsync({
        id: order.id,
        data: {
          payAmount: payNum,
          paymentMethod,
        },
      });

      if (autoPrint) {
        setPrintData([
          {
            ...order,
            payAmount: payNum,
            changeAmount: payNum - total,
            paymentMethod,
            status: "COMPLETED",
            cashier: currentUser,
          },
        ]);
      }

      setOrderToConfirm(null);
    } catch {
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
              Pembeli Umum
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Ringkasan Barang",
      render: (o) => {
        const items = o.items || [];
        const firstItem = items[0]?.itemName || items[0]?.product?.name || "-";
        const othersCount = items.length - 1;

        return (
          <div className="text-xs">
            <span className="font-medium text-slate-800 block truncate max-w-[200px]">
              {firstItem}
            </span>
            {othersCount > 0 && (
              <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                +{othersCount} barang lainnya
              </span>
            )}
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Total {items.reduce((acc, i) => acc + (i.quantity || 1), 0)} pcs
            </span>
          </div>
        );
      },
    },
    {
      header: "Total Tagihan",
      render: (o) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">
            {formatRupiah(o.totalAmount)}
          </span>
          {Number(o.discountAmount) > 0 && (
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
              Diskon: -{formatRupiah(o.discountAmount)}
            </span>
          )}
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5 uppercase">
            {o.paymentMethod || "PAY_ON_PICKUP"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (o) => {
        if (o.status === "BOOKED") {
          return (
            <Badge variant="warning">
              <Clock size={11} className="mr-1 animate-spin" />
              Menunggu
            </Badge>
          );
        }
        if (o.status === "READY") {
          return (
            <Badge variant="success">
              <PackageCheck size={12} className="mr-1" />
              Siap Ambil
            </Badge>
          );
        }
        if (o.status === "COMPLETED") {
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
                onClick={() => setOrderToConfirm(o)}
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
              onClick={() => setOrderToConfirm(o)}
              title="Lihat detail & konfirmasi pesanan"
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

        {/* Action Controls Kanan (Modular Component) */}
        <PreOrderHeaderActions
          onOpenScanner={() => setIsBarcodeScannerOpen(true)}
          onRefresh={() => refetch()}
          isFetching={isFetching}
        />
      </div>

      {/* Baris Ringkasan Kartu Metrik (Modular Component) */}
      <PreOrderStatsCards
        totalCount={totalCount}
        bookedCount={bookedCount}
        readyCount={readyCount}
        completedCount={completedCount}
      />

      {/* Filter Bar & Search */}
      <FilterBar
        searchPlaceholder="Cari no. invoice, nama siswa, atau scan barcode..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onKeyDown={(e) => {
          if (e.key === "Enter" && searchQuery.trim()) {
            handleScanOrder(searchQuery.trim());
          }
        }}
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

      {/* MODAL: Konfirmasi Pesanan & Modul Update Status Lengkap */}
      <OrderConfirmModal
        isOpen={Boolean(orderToConfirm)}
        order={orderToConfirm}
        onClose={() => setOrderToConfirm(null)}
        onMarkReady={handleMarkReady}
        onComplete={handleExecuteComplete}
        onCancel={handleCancelOrder}
        onRevertToBooked={handleRevertToBooked}
        onReprint={handleReprintOrder}
        onOpenScanner={() => {
          setOrderToConfirm(null);
          setIsBarcodeScannerOpen(true);
        }}
        isPending={
          markReady.isPending ||
          complete.isPending ||
          cancel.isPending ||
          updateStatus.isPending
        }
      />

      {/* MODAL SCANNER: Webcam Barcode & QR Code Scanner untuk Order */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onScan={handleScanOrder}
        title="Scan Barcode / QR Pesanan Siswa"
        description="Arahkan QR Code pengambilan pesanan di layar HP siswa atau Barcode Invoice ke depan webcam laptop."
        continuous={false}
      />
    </div>
  );
}
