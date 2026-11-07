import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom";
import {
  LogOut,
  Maximize,
  Minimize,
  Wallet,
  Lock,
  CheckCircle2,
  Monitor,
  Receipt,
  Printer,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

import YasixLogo from "../components/ui/YasixLogo";

import { useAuthStore } from "../store/authStore";
import { useShiftStore } from "../store/shiftStore";
import { formatRupiah } from "../utils/formatters";
import { useConfirm } from "../hooks/useConfirm";
import { showSuccessToast, showErrorToast, showWarningToast } from "../utils/toast";
import { useTransactions } from "../hooks/admin/useTransactions";
import { playNotificationSound } from "../utils/sound";
import Button from "../components/ui/Button";
import { shiftService } from "../api/shiftService";

const NAV_ITEMS = [
  { to: "/kasir/pos", label: "POS Terminal", shortLabel: "POS", icon: Monitor },
  { to: "/kasir/pre-order", label: "Pre-Order Siswa", shortLabel: "Pre-Order", icon: Package, badgeKey: "preOrder" },
  { to: "/kasir/riwayat", label: "Riwayat Kasir", shortLabel: "Riwayat", icon: Receipt },
  { to: "/kasir/print", label: "Antrean Cetak", shortLabel: "Cetak", icon: Printer },
];

const formatClock = (date) =>
  date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const iconBtn =
  "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600";

function CashField({ label, icon: Icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </span>
      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          {...props}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 placeholder:font-normal focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
        />
      </div>
    </label>
  );
}

function Modal({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md overflow-y-auto">
      <div className="animate-in zoom-in-95 my-auto w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80 relative">
        {children}
      </div>
    </div>
  );
}

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

  // Polling data transaksi pre-order di level kasir layout
  const { data: allTransactions = [] } = useTransactions(
    {},
    {
      enabled: Boolean(activeShift),
      refetchInterval: 5000,
    },
  );

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

  // Sinkronkan ikon dengan status layar penuh (termasuk saat menekan Esc)
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

    const isConfirmed = await confirm({
      title: "Tutup Shift Kasir",
      message: `Apakah Anda yakin ingin mengakhiri sesi shift ini? Total uang fisik tercatat: ${formatRupiah(
        Number(actualCash),
      )}.`,
      confirmText: "Ya, Tutup Shift",
      cancelText: "Batal",
      variant: "warning",
    });

    if (isConfirmed) {
      setIsSubmittingShift(true);
      try {
        await shiftService.endShift({
          actualCash: Number(actualCash),
          shiftId: activeShift?.id,
        });
        showSuccessToast(
          `Shift berhasil ditutup. Total uang fisik tercatat: ${formatRupiah(
            Number(actualCash),
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

  const userName = user?.name || "Kasir";
  const userRole = user?.role?.toLowerCase() || "Staff POS";
  const initial = userName.trim().charAt(0).toUpperCase();

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Utama Kasir */}
      <header className="relative z-40 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/90 bg-white px-3 sm:px-4 lg:px-8 shadow-2xs">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <YasixLogo variant="icon" size={32} />
            <div>
              <h1 className="text-sm sm:text-[15px] font-bold leading-tight tracking-tight text-slate-900">
                Yasix POS
              </h1>
              <p className="text-[10px] sm:text-[11px] leading-tight text-slate-400 font-medium">
                Terminal kasir
              </p>
            </div>
          </div>

          {/* Navigasi Desktop & Tablet (md+) */}
          {activeShift && (
            <nav
              aria-label="Menu kasir desktop"
              className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 md:flex"
            >
              {NAV_ITEMS.map(({ to, label, icon: Icon, badgeKey }) => {
                const badgeNum = badgeKey === "preOrder" ? bookedCount : 0;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isActive
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon size={15} strokeWidth={2} />
                    <span>{label}</span>
                    {badgeNum > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white shadow-2xs animate-pulse">
                        {badgeNum}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          )}
        </div>

        {/* Action Bar Kanan */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Status Shift Desktop (Waktu & Jam Buka) */}
          {activeShift && (
            <div className="mr-1 hidden items-center gap-3 border-r border-slate-200 pr-4 xl:flex">
              <div className="text-right">
                <p className="font-mono text-sm font-bold leading-none tracking-wider text-slate-900 tabular-nums">
                  {formattedTime}
                </p>
                <p className="mt-1 flex items-center justify-end gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Mulai {formatClock(new Date(activeShift.startTime))} WIB
                </p>
              </div>
            </div>
          )}

          {/* Badge Shift Ringkas di Mobile/Tablet */}
          {activeShift && (
            <button
              type="button"
              onClick={() => setIsClosing(true)}
              className="flex xl:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition active:scale-95"
              title="Klik untuk info atau tutup shift kasir"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shift Aktif</span>
            </button>
          )}

          {/* Tombol Tutup Shift (Desktop/Tablet) */}
          {activeShift && (
            <button
              type="button"
              onClick={() => setIsClosing(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50/80 hover:bg-amber-100 ring-1 ring-amber-200/80 outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Wallet size={14} strokeWidth={2} />
              <span>Tutup Shift</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullScreen}
            className={`${iconBtn} hidden sm:flex`}
            title={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
            aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
          >
            {isFullscreen ? (
              <Minimize size={17} strokeWidth={2} />
            ) : (
              <Maximize size={17} strokeWidth={2} />
            )}
          </button>

          {/* Cloud API Indicator */}
          <div
            title="Backend REST API: Railway Cloud Engine (Live & Connected)"
            className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 select-none shadow-2xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10.5px] font-mono font-bold text-emerald-700">
              API Live
            </span>
          </div>

          {/* Identitas Kasir */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
            <div className="hidden text-right lg:block">
              <p className="text-xs font-bold leading-tight text-slate-900 truncate max-w-[130px]">
                {userName}
              </p>
              <p className="text-[10px] capitalize leading-tight text-slate-400 font-medium">
                {userRole}
              </p>
            </div>
            <div
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-900 text-xs sm:text-sm font-bold text-white shadow-xs"
              title={userName}
              aria-hidden="true"
            >
              {initial}
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
            title="Keluar sistem"
            aria-label="Keluar sistem"
          >
            <LogOut size={17} strokeWidth={2} />
          </button>
        </div>
      </header>

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

        {/* Modal Buka Shift */}
        {!activeShift && (
          <Modal>
            {/* Tombol Logout di Pojok Kanan Atas Modal */}
            <button
              type="button"
              onClick={handleLogout}
              className="absolute right-4 top-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
              title="Keluar / Ganti Akun Kasir"
              aria-label="Keluar sistem"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Keluar</span>
            </button>

            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <Lock size={24} strokeWidth={2} />
            </div>

            <h2 className="mb-1 text-center text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Buka Shift Kasir
            </h2>

            {/* Status Akun yang Sedang Login */}
            <div className="flex items-center justify-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-slate-100/90 text-slate-600 text-xs font-medium w-fit mx-auto border border-slate-200/60">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Login sebagai: <strong className="text-slate-900 font-bold">{userName}</strong>
              </span>
            </div>

            <p className="mx-auto mb-5 max-w-[320px] text-center text-xs leading-relaxed text-slate-500">
              Masukkan modal awal berupa uang kecil di laci kasir sebelum memulai sesi transaksi.
            </p>

            <form onSubmit={handleOpenShift} className="space-y-4">
              <CashField
                autoFocus
                type="number"
                inputMode="numeric"
                label="Modal Awal Kasir (Rp)"
                placeholder="Contoh: 150000"
                icon={Wallet}
                value={startCash}
                onChange={(e) => setStartCash(e.target.value)}
                required
              />

              <Button
                type="submit"
                isLoading={isSubmittingShift}
                className="mt-2 h-12 w-full rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30"
              >
                Buka Shift Sekarang
              </Button>

              {/* Tombol Logout di Bawah Form */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition border border-slate-200/80 hover:border-red-200 active:scale-[0.98]"
                >
                  <LogOut size={15} />
                  <span>Keluar / Ganti Akun Kasir</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal Tutup Shift */}
        {isClosing && activeShift && (
          <Modal>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Wallet size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Tutup Shift Kasir
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Rekonsiliasi akhir sesi kasir
                  </p>
                </div>
              </div>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-slate-500">
              Hitung dan masukkan seluruh total fisik uang tunai di laci kasir.
            </p>

            <dl className="mb-4 space-y-2 rounded-2xl bg-slate-50 p-3.5 text-xs ring-1 ring-slate-200/80">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Modal Awal Kasir</dt>
                <dd className="font-bold tabular-nums text-slate-900">
                  {formatRupiah(activeShift.startCash)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Waktu Sesi Dimulai</dt>
                <dd className="font-semibold tabular-nums text-slate-800">
                  {formatClock(new Date(activeShift.startTime))} WIB
                </dd>
              </div>
            </dl>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <CashField
                autoFocus
                type="number"
                inputMode="numeric"
                label="Total Uang Fisik Aktual di Laci (Rp)"
                placeholder="Nominal hasil hitungan fisik laci"
                icon={CheckCircle2}
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                required
              />

              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsClosing(false)}
                  className="h-11 flex-1 rounded-xl text-xs font-semibold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  isLoading={isSubmittingShift}
                  className="h-11 flex-1 rounded-xl text-xs font-bold"
                >
                  Akhiri Shift
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </main>

      {/* Navigasi Mobile Bawah (Bottom Bar untuk Layar < md) */}
      {activeShift && (
        <nav
          aria-label="Navigasi Kasir Mobile"
          className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/90 bg-white/95 px-1 backdrop-blur-md md:hidden shadow-[0_-4px_20px_rgba(15,23,42,0.08)]"
        >
          {NAV_ITEMS.map(({ to, shortLabel, icon: Icon, badgeKey }) => {
            const badgeNum = badgeKey === "preOrder" ? bookedCount : 0;
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative flex flex-1 flex-col items-center justify-center py-1 transition-all ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-slate-500 hover:text-slate-800 font-medium"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon size={19} strokeWidth={isActive ? 2.5 : 1.75} />
                      {badgeNum > 0 && (
                        <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white shadow-2xs animate-pulse">
                          {badgeNum}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] leading-tight mt-0.5">{shortLabel}</span>
                    {isActive && (
                      <span className="h-1 w-3 rounded-full bg-blue-600 mt-0.5" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Tombol Shift di Mobile Nav */}
          <button
            type="button"
            onClick={() => setIsClosing(true)}
            className="relative flex flex-1 flex-col items-center justify-center py-1 text-amber-700 hover:text-amber-800 font-medium transition-all"
            title="Tutup Shift Kasir"
          >
            <Wallet size={19} strokeWidth={1.75} />
            <span className="text-[10px] leading-tight mt-0.5">Shift</span>
          </button>
        </nav>
      )}
    </div>
  );
}
