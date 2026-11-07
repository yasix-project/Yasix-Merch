import { useState, useEffect, useRef, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Monitor, Receipt, Printer, Package } from "lucide-react";
import toast from "react-hot-toast";

import { useAuthStore } from "../store/authStore";
import { useShiftStore } from "../store/shiftStore";
import { formatRupiah } from "../utils/formatters";
import { useConfirm } from "../hooks/useConfirm";
import { showSuccessToast, showErrorToast, showWarningToast } from "../utils/toast";
import { useTransactions } from "../hooks/admin/useTransactions";
import { playNotificationSound } from "../utils/sound";
import Button from "../components/ui/Button";
import { shiftService } from "../api/shiftService";

import KasirHeader from "../components/kasir/KasirHeader";
import KasirBottomNav from "../components/kasir/KasirBottomNav";
import ShiftOpenModal from "../components/kasir/ShiftOpenModal";
import ShiftCloseModal from "../components/kasir/ShiftCloseModal";

const NAV_ITEMS = [
  { to: "/kasir/pos", label: "POS Terminal", shortLabel: "POS", icon: Monitor },
  { to: "/kasir/pre-order", label: "Pre-Order Siswa", shortLabel: "Pre-Order", icon: Package, badgeKey: "preOrder" },
  { to: "/kasir/riwayat", label: "Riwayat Kasir", shortLabel: "Riwayat", icon: Receipt },
  { to: "/kasir/print", label: "Antrean Cetak", shortLabel: "Cetak", icon: Printer },
];

export default function KasirLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const confirm = useConfirm();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const activeShift = useShiftStore((state) => state.activeShift);
  const openShift = useShiftStore((state) => state.openShift);
  const closeShift = useShiftStore((state) => state.closeShift);

  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startCash, setStartCash] = useState("");
  const [actualCash, setActualCash] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmittingShift, setIsSubmittingShift] = useState(false);

  const [shiftSummary, setShiftSummary] = useState({
    cashSales: 0,
    expectedEndCash: 0,
    isLoading: false,
  });

  const isPosRoute = location.pathname === "/kasir/pos";

  // Sinkronisasi status shift kasir dari database backend
  useEffect(() => {
    let isMounted = true;
    const syncActiveShift = async () => {
      try {
        const res = await shiftService.getActiveShift();
        const serverShift = res.data?.data;
        if (!isMounted) return;
        if (serverShift) {
          openShift({
            ...serverShift,
            cashierId: user?.id,
            cashierName: user?.name,
          });
        } else if (activeShift) {
          closeShift();
        }
      } catch (err) {
        console.error("Gagal sinkronisasi shift kasir:", err);
      }
    };

    if (user) {
      syncActiveShift();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Ambil rincian rekap terkini shift aktif saat modal tutup shift dibuka atau shift sinkron
  useEffect(() => {
    if (!activeShift) return;
    let isMounted = true;
    const fetchShiftSummary = async () => {
      try {
        setShiftSummary((prev) => ({ ...prev, isLoading: true }));
        const res = await shiftService.getActiveShift();
        const serverData = res.data?.data;
        if (!isMounted) return;
        if (serverData) {
          setShiftSummary({
            cashSales: Number(serverData.cashSales || 0),
            expectedEndCash: Number(
              serverData.expectedEndCash ||
                Number(activeShift.startCash || 0) + Number(serverData.cashSales || 0),
            ),
            isLoading: false,
          });
        } else {
          setShiftSummary((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data kas shift:", err);
        if (isMounted) {
          setShiftSummary((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    fetchShiftSummary();
    return () => {
      isMounted = false;
    };
  }, [isClosing, activeShift]);

  // Polling data transaksi pre-order di level kasir layout
  const { data: allTransactions = [] } = useTransactions(
    {},
    {
      enabled: Boolean(activeShift),
      refetchInterval: 5000,
    },
  );

  // Fallback akumulasi transaksi tunai langsung dari data transaksi polling
  const calculatedClientCashSales = useMemo(() => {
    if (!activeShift?.startTime || !allTransactions.length) return 0;
    const shiftStartTime = new Date(activeShift.startTime).getTime();
    return allTransactions
      .filter((tx) => {
        const isCompleted = tx.status === "COMPLETED";
        const isCash = tx.paymentMethod === "CASH";
        const txTime = new Date(tx.createdAt).getTime();
        const isAfterShiftStart = txTime >= shiftStartTime;
        const isMyCashier = !user?.id || !tx.cashierId || tx.cashierId === user.id;
        return isCompleted && isCash && isAfterShiftStart && isMyCashier;
      })
      .reduce((sum, tx) => sum + Number(tx.totalAmount || 0), 0);
  }, [allTransactions, activeShift, user]);

  const effectiveCashSales = Math.max(
    shiftSummary.cashSales,
    calculatedClientCashSales,
  );
  const effectiveExpectedEndCash =
    Number(activeShift?.startCash || 0) + effectiveCashSales;

  const actualCashNum = Number(actualCash);
  const hasEnteredCash =
    actualCash.trim() !== "" && !isNaN(actualCashNum) && actualCashNum >= 0;
  const cashDifference = hasEnteredCash
    ? actualCashNum - effectiveExpectedEndCash
    : null;

  const bookedPreOrders = allTransactions.filter(
    (tx) =>
      tx.status === "BOOKED" &&
      ((tx.invoiceNumber && tx.invoiceNumber.startsWith("ORD-")) ||
        Boolean(tx.studentId && tx.status !== "COMPLETED")),
  );
  const bookedCount = bookedPreOrders.length;

  const prevBookedIds = useRef(new Set());
  const initialCheckRef = useRef(true);

  // Notifikasi pop-up & suara saat ada order baru masuk dari siswa
  useEffect(() => {
    if (!activeShift) return;

    const currentIds = new Set(bookedPreOrders.map((t) => t.id));

    if (!initialCheckRef.current) {
      const newOrders = bookedPreOrders.filter(
        (t) => !prevBookedIds.current.has(t.id),
      );
      if (newOrders.length > 0) {
        playNotificationSound("chime");
        const latest = newOrders[0];
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-in fade-in" : "animate-out fade-out"
              } max-w-sm w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex p-3.5 border border-blue-200 ring-1 ring-slate-200/50`}
            >
              <div className="flex-1 w-0">
                <div className="flex items-start">
                  <div className="shrink-0 pt-0.5">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Package size={18} />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-xs font-bold text-slate-900">
                      Pesanan Pre-Order Baru!
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">
                        {latest.student?.name || "Siswa"}
                      </span>{" "}
                      ({latest.invoiceNumber})
                    </p>
                    <Button
                      type="button"
                      size="xs"
                      variant="primary"
                      onClick={() => {
                        toast.dismiss(t.id);
                        navigate("/kasir/pre-order");
                      }}
                      className="mt-2 text-xs font-bold"
                    >
                      Buka & Siapkan Pesanan &rarr;
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-slate-100 pl-2">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg text-xs"
                >
                  &times;
                </button>
              </div>
            </div>
          ),
          { duration: 7000 },
        );
      }
    } else {
      initialCheckRef.current = false;
    }

    prevBookedIds.current = currentIds;
  }, [bookedPreOrders, activeShift, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sinkronkan ikon dengan status layar penuh
  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleLogout = async () => {
    if (activeShift) {
      showWarningToast("Harap tutup shift terlebih dahulu sebelum keluar dari sistem.");
      return;
    }
    const isConfirmed = await confirm({
      title: "Keluar dari Sistem",
      message: "Apakah Anda yakin ingin keluar dari sistem POS kasir?",
      confirmText: "Ya, Keluar",
      cancelText: "Batal",
      variant: "warning",
    });
    if (isConfirmed) {
      logout();
      showSuccessToast("Berhasil keluar dari sistem.");
      navigate("/login");
    }
  };

  const handleOpenShift = async (e) => {
    e.preventDefault();
    if (!startCash || Number(startCash) < 0) {
      showErrorToast("Harap masukkan modal awal yang valid.");
      return;
    }

    setIsSubmittingShift(true);
    try {
      const res = await shiftService.startShift({
        startCash: Number(startCash),
      });
      const shiftData = res.data?.data || res.data;
      openShift({
        ...shiftData,
        cashierId: user?.id,
        cashierName: user?.name,
      });
      showSuccessToast("Shift kasir berhasil dibuka.");
      setStartCash("");
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Gagal membuka shift kasir.",
      );
    } finally {
      setIsSubmittingShift(false);
    }
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    if (!actualCash || Number(actualCash) < 0) {
      showErrorToast("Harap masukkan total uang fisik yang valid.");
      return;
    }

    const actualNum = Number(actualCash);
    const diff = actualNum - effectiveExpectedEndCash;
    let diffStatusText = "Uang fisik laci PAS dengan kas sistem (tidak ada selisih).";
    if (diff < 0) {
      diffStatusText = `⚠️ SELISIH KURANG: -${formatRupiah(
        Math.abs(diff),
      )} (Uang fisik lebih sedikit dari kas sistem).`;
    } else if (diff > 0) {
      diffStatusText = `ℹ️ SELISIH LEBIH: +${formatRupiah(
        diff,
      )} (Uang fisik melebihi catatan kas sistem).`;
    }

    const isConfirmed = await confirm({
      title: "Tutup Shift Kasir",
      message: `Pastikan hitungan fisik laci kasir sudah sesuai sebelum menutup sesi:\n\n• Modal Awal Kasir: ${formatRupiah(
        activeShift.startCash,
      )}\n• Kas Bertambah (Tunai): +${formatRupiah(
        effectiveCashSales,
      )}\n• Total Kas Sistem: ${formatRupiah(
        effectiveExpectedEndCash,
      )}\n• Uang Fisik Aktual: ${formatRupiah(
        actualNum,
      )}\n• Rekonsiliasi: ${diffStatusText}`,
      confirmText: "Ya, Tutup Shift",
      cancelText: "Batal",
      variant: diff === 0 ? "warning" : "danger",
    });

    if (isConfirmed) {
      setIsSubmittingShift(true);
      try {
        await shiftService.endShift({
          actualCash: actualNum,
          shiftId: activeShift?.id,
        });
        showSuccessToast(
          `Shift berhasil ditutup. Total uang fisik tercatat: ${formatRupiah(
            actualNum,
          )}`,
        );

        closeShift();
        setIsClosing(false);
        setStartCash("");
        setActualCash("");
      } catch (err) {
        showErrorToast(
          err.response?.data?.message || "Gagal menutup shift kasir.",
        );
      } finally {
        setIsSubmittingShift(false);
      }
    }
  };

  const formattedTime = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Utama Kasir (Modular Component) */}
      <KasirHeader
        user={user}
        activeShift={activeShift}
        navItems={NAV_ITEMS}
        bookedCount={bookedCount}
        formattedTime={formattedTime}
        isFullscreen={isFullscreen}
        toggleFullScreen={toggleFullScreen}
        onOpenCloseShift={() => setIsClosing(true)}
        onLogout={handleLogout}
      />

      {/* Konten Halaman */}
      <main
        className={`relative flex-1 min-h-0 ${
          isPosRoute
            ? "overflow-hidden p-0"
            : "overflow-y-auto p-3 sm:p-5 lg:p-8 pb-24 md:pb-8"
        }`}
      >
        <div
          className={`h-full transition-all duration-300 ${
            !activeShift
              ? "pointer-events-none select-none opacity-30 blur-xs"
              : ""
          }`}
        >
          <Outlet />
        </div>

        {/* Modal Buka Shift (Modular Component) */}
        <ShiftOpenModal
          isOpen={!activeShift}
          userName={user?.name || "Kasir"}
          startCash={startCash}
          setStartCash={setStartCash}
          isSubmitting={isSubmittingShift}
          onSubmit={handleOpenShift}
          onLogout={handleLogout}
        />

        {/* Modal Tutup Shift (Modular Component) */}
        <ShiftCloseModal
          isOpen={Boolean(isClosing && activeShift)}
          activeShift={activeShift}
          effectiveCashSales={effectiveCashSales}
          effectiveExpectedEndCash={effectiveExpectedEndCash}
          shiftSummaryLoading={shiftSummary.isLoading}
          actualCash={actualCash}
          setActualCash={setActualCash}
          hasEnteredCash={hasEnteredCash}
          cashDifference={cashDifference}
          isSubmitting={isSubmittingShift}
          onClose={() => setIsClosing(false)}
          onSubmit={handleCloseShift}
        />
      </main>

      {/* Navigasi Mobile Bawah (Modular Component) */}
      <KasirBottomNav
        activeShift={activeShift}
        navItems={NAV_ITEMS}
        bookedCount={bookedCount}
        onOpenCloseShift={() => setIsClosing(true)}
      />
    </div>
  );
}
