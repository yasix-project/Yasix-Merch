import { useState, useEffect } from "react";
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
} from "lucide-react";

import BCYasixLogo from "../components/ui/BcYasixLogo";

import { useAuthStore } from "../store/authStore";
import { useShiftStore } from "../store/shiftStore";
import { formatRupiah } from "../utils/formatters";

const NAV_ITEMS = [
  { to: "/kasir/pos", label: "POS Terminal", icon: Monitor },
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
          size={17}
          strokeWidth={1.75}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          {...props}
          className="w-full rounded-xl bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium tabular-nums text-slate-900 ring-1 ring-slate-200 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600"
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

  const handleLogout = () => {
    if (activeShift) {
      alert("Harap tutup shift terlebih dahulu sebelum keluar dari sistem.");
      return;
    }
    if (window.confirm("Yakin ingin keluar dari sistem?")) {
      logout();
      navigate("/login");
    }
  };

  const handleOpenShift = (e) => {
    e.preventDefault();
    if (!startCash || Number(startCash) < 0) {
      alert("Harap masukkan modal awal yang valid.");
      return;
    }

    openShift({
      id: `SHIFT-${Date.now()}`,
      startTime: new Date().toISOString(),
      startCash: Number(startCash),
    });
    setStartCash("");
  };

  const handleCloseShift = (e) => {
    e.preventDefault();
    if (!actualCash || Number(actualCash) < 0) {
      alert("Harap masukkan total uang fisik yang valid.");
      return;
    }

    alert(
      `Shift berhasil ditutup. Total uang fisik tercatat: ${formatRupiah(
        Number(actualCash),
      )}`,
    );

    closeShift();
    setIsClosing(false);
    setStartCash("");
    setActualCash("");
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
            <BCYasixLogo variant="icon" size={34} />
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
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      isActive
                        ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.12)]"
                        : "text-slate-500 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={15} strokeWidth={1.75} />
                  <span>{label}</span>
                </NavLink>
              ))}
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

              <button
                type="submit"
                className="mt-2 h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] outline-none transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:scale-[0.985]"
              >
                Buka shift
              </button>
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
                <button
                  type="button"
                  onClick={() => setIsClosing(false)}
                  className="h-12 w-1/2 rounded-xl text-sm font-medium text-slate-600 ring-1 ring-slate-200 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-12 w-1/2 rounded-xl bg-slate-900 text-sm font-semibold text-white outline-none transition hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:scale-[0.985]"
                >
                  Akhiri shift
                </button>
              </div>
            </form>
          </Modal>
        )}
      </main>
    </div>
  );
}
