import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
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
  { to: "/kasir/pos", label: "POS Terminal", icon: Monitor },
  { to: "/kasir/pre-order", label: "Pre-Order Siswa", icon: Package, badgeKey: "preOrder" },
  { to: "/kasir/riwayat", label: "Riwayat Kasir", icon: Receipt },
  { to: "/kasir/print", label: "Antrean Cetak", icon: Printer },
];

const formatClock = (date) =>
  date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const iconBtn =
  "flex h-10 w-10 items-center justify-center rounded-full text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600";

function CashField({ label, icon: Icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          {...props}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
        />
      </div>
    </label>
  );
}

function Modal({ children }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-md">
      <div className="animate-in zoom-in-95 w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/70">
        {children}
      </div>
    </div>
  );
}

export default function KasirLayout() {
  const navigate = useNavigate();
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
    <div className="relative flex min-h-screen flex-col bg-slate-50 font-sans">
      <header className="relative z-40 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <YasixLogo variant="icon" size={34} />
            <div className="hidden sm:block">
              <h1 className="text-[15px] font-semibold leading-tight tracking-tight text-slate-900">
                Yasix POS
              </h1>
              <p className="text-[11px] leading-tight text-slate-400">
                Terminal kasir
              </p>
            </div>
          </div>

          {activeShift && (
            <nav
              aria-label="Menu kasir"
              className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 md:flex"
            >
              {NAV_ITEMS.map(({ to, label, icon: Icon, badgeKey }) => {
                const badgeNum = badgeKey === "preOrder" ? bookedCount : 0;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `relative flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isActive
                          ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.12)]"
                          : "text-slate-500 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon size={15} strokeWidth={1.75} />
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

        <div className="flex items-center gap-2 sm:gap-3">
          {activeShift && (
            <div className="mr-2 hidden items-center gap-4 border-r border-slate-200 pr-5 xl:flex">
              <div className="text-right">
                <p className="font-mono text-base font-semibold leading-none tracking-wider text-slate-900 tabular-nums">
                  {formattedTime}
                </p>
                <p className="mt-1.5 flex items-center justify-end gap-1.5 text-[11px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Shift dibuka {formatClock(new Date(activeShift.startTime))}
                </p>
              </div>
            </div>
          )}

          {activeShift && (
            <button
              type="button"
              onClick={() => setIsClosing(true)}
              className="hidden items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-amber-700 ring-1 ring-amber-200 outline-none transition hover:bg-amber-50 focus-visible:ring-2 focus-visible:ring-amber-500 sm:flex"
            >
              <Wallet size={15} strokeWidth={1.75} />
              Tutup shift
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullScreen}
            className={`${iconBtn} hidden sm:flex`}
            title={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
            aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
          >
            {isFullscreen ? (
              <Minimize size={18} strokeWidth={1.75} />
            ) : (
              <Maximize size={18} strokeWidth={1.75} />
            )}
          </button>

          <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
            <div className="hidden text-right lg:block">
              <p className="text-[13px] font-semibold leading-tight text-slate-800">
                {userName}
              </p>
              <p className="text-[11px] capitalize leading-tight text-slate-400">
                {userRole}
              </p>
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white"
              title={userName}
              aria-hidden="true"
            >
              {initial}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className={`${iconBtn} hover:bg-red-50 hover:text-red-500`}
            title="Keluar sistem"
            aria-label="Keluar sistem"
          >
            <LogOut size={18} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden p-4 lg:p-8">
        <div
          className={`h-full transition-all duration-300 ${
            !activeShift
              ? "pointer-events-none select-none opacity-40 blur-sm"
              : ""
          }`}
        >
          <Outlet />
        </div>

        {/* Buka shift */}
        {!activeShift && (
          <Modal>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Lock size={24} strokeWidth={1.75} />
            </div>
            <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight text-slate-900">
              Buka shift kasir
            </h2>
            <p className="mx-auto mb-6 max-w-[320px] text-center text-[13px] leading-relaxed text-slate-500">
              Masukkan modal awal berupa uang kecil di laci kasir sebelum
              memulai transaksi.
            </p>

            <form onSubmit={handleOpenShift} className="space-y-4">
              <CashField
                autoFocus
                type="number"
                inputMode="numeric"
                label="Modal awal kasir"
                placeholder="Contoh: 150000"
                icon={Wallet}
                value={startCash}
                onChange={(e) => setStartCash(e.target.value)}
                required
              />

              <Button
                type="submit"
                isLoading={isSubmittingShift}
                className="mt-2 h-12 w-full rounded-xl"
              >
                Buka shift
              </Button>
            </form>
          </Modal>
        )}

        {/* Tutup shift */}
        {isClosing && activeShift && (
          <Modal>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">
              Tutup shift kasir
            </h2>
            <p className="mb-6 text-[13px] leading-relaxed text-slate-500">
              Hitung seluruh uang fisik di laci kasir untuk rekonsiliasi akhir
              sesi.
            </p>

            <dl className="mb-5 space-y-2.5 rounded-2xl bg-slate-50 p-4 text-[13px] ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Modal awal</dt>
                <dd className="font-semibold tabular-nums text-slate-900">
                  {formatRupiah(activeShift.startCash)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Waktu mulai</dt>
                <dd className="font-semibold tabular-nums text-slate-900">
                  {formatClock(new Date(activeShift.startTime))} WIB
                </dd>
              </div>
            </dl>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <CashField
                autoFocus
                type="number"
                inputMode="numeric"
                label="Total uang fisik aktual"
                placeholder="Nominal hasil hitungan laci"
                icon={CheckCircle2}
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                required
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsClosing(false)}
                  className="h-12 w-1/2 rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  isLoading={isSubmittingShift}
                  className="h-12 w-1/2 rounded-xl"
                >
                  Akhiri shift
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </main>
    </div>
  );
}
