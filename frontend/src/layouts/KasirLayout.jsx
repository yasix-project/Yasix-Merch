import { useState, useEffect } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import {
  LogOut,
  UserCircle,
  Maximize,
  Minimize,
  Wallet,
  Lock,
  PlayCircle,
  CheckCircle2,
  Monitor,
  Receipt,
  Printer,
} from "lucide-react";

import BCYasixLogo from "../components/ui/BcYasixLogo";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { useAuthStore } from "../store/authStore";
import { useShiftStore } from "../store/shiftStore";
import { formatRupiah } from "../utils/formatters";

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

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
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

    const shiftData = {
      id: `SHIFT-${Date.now()}`,
      startTime: new Date().toISOString(),
      startCash: Number(startCash),
    };

    openShift(shiftData);
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans relative">
      <header className="h-[80px] bg-slate-900 text-white flex items-center justify-between px-4 lg:px-8 shadow-md relative z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-inner">
              <BCYasixLogo variant="icon" size={32} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white">
                Yasix POS
              </h1>
              <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                Terminal Kasir
              </p>
            </div>
          </div>

          {activeShift && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/80">
              <NavLink
                to="/kasir/pos"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                  }`
                }
              >
                <Monitor size={15} />
                <span>POS Terminal</span>
              </NavLink>

              <NavLink
                to="/kasir/riwayat"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                  }`
                }
              >
                <Receipt size={15} />
                <span>Riwayat Kasir</span>
              </NavLink>

              <NavLink
                to="/kasir/print"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                  }`
                }
              >
                <Printer size={15} />
                <span>Antrean Cetak</span>
              </NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {activeShift && (
            <div className="hidden xl:flex flex-col items-end mr-3 border-r border-slate-700/80 pr-5">
              <span className="font-mono text-lg font-bold tracking-widest text-slate-100 leading-none mb-1">
                {formattedTime}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                <PlayCircle size={12} />
                Shift Buka:{" "}
                {new Date(activeShift.startTime).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          {activeShift && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsClosing(true)}
              className="hidden sm:flex bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 px-3 text-xs"
            >
              <Wallet size={15} className="mr-1.5" />
              Tutup Shift
            </Button>
          )}

          <button
            type="button"
            onClick={toggleFullScreen}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-700/80">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-bold text-slate-200 leading-tight">
                {user?.name || "Kasir"}
              </p>
              <p className="text-[10px] text-slate-400 font-medium capitalize">
                {user?.role?.toLowerCase() || "Staff POS"}
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center border border-blue-400/30 shadow-sm"
              title={user?.name || "Kasir"}
            >
              <UserCircle size={22} className="text-white" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
            title="Keluar Sistem"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-8 relative overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            !activeShift
              ? "blur-sm pointer-events-none opacity-40 select-none"
              : ""
          }`}
        >
          <Outlet />
        </div>

        {!activeShift && (
          <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 mx-auto border border-blue-100 shadow-inner">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-center text-slate-900 tracking-tight mb-2">
                Buka Shift Kasir
              </h2>
              <p className="text-center text-xs text-slate-500 mb-6 leading-relaxed">
                Masukkan nominal uang modal awal (pecahan kas kecil / kembalian)
                yang berada di laci kasir sebelum memulai sesi transaksi.
              </p>

              <form onSubmit={handleOpenShift} className="space-y-4">
                <Input
                  autoFocus
                  type="number"
                  label="Modal Awal Kasir (Cash)"
                  placeholder="Contoh: 150000"
                  icon={Wallet}
                  value={startCash}
                  onChange={(e) => setStartCash(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 mt-2"
                >
                  Buka Shift Sekarang
                </Button>
              </form>
            </div>
          </div>
        )}

        {isClosing && activeShift && (
          <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 animate-in zoom-in-95">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Tutup Shift Kasir
              </h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Hitung seluruh uang fisik secara aktual yang ada di dalam laci
                kasir untuk rekonsiliasi akhir sesi.
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl mb-5 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Modal Awal:</span>
                  <strong className="text-slate-900 font-bold">
                    {formatRupiah(activeShift.startCash)}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Waktu Mulai:</span>
                  <strong className="text-slate-900 font-bold">
                    {new Date(activeShift.startTime).toLocaleTimeString(
                      "id-ID",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}{" "}
                    WIB
                  </strong>
                </div>
              </div>

              <form onSubmit={handleCloseShift} className="space-y-4">
                <Input
                  autoFocus
                  type="number"
                  label="Total Uang Fisik Aktual"
                  placeholder="Masukkan nominal hitungan fisik laci"
                  icon={CheckCircle2}
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  required
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsClosing(false)}
                    className="w-1/2 py-3"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="w-1/2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    Akhiri Shift
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
