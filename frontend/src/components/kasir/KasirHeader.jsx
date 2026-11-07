import { NavLink } from "react-router-dom";
import {
  LogOut,
  Maximize,
  Minimize,
  Wallet,
} from "lucide-react";
import YasixLogo from "../ui/YasixLogo";

const formatClock = (date) =>
  date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const iconBtn =
  "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600";

export default function KasirHeader({
  user,
  activeShift,
  navItems = [],
  bookedCount = 0,
  formattedTime,
  isFullscreen,
  toggleFullScreen,
  onOpenCloseShift,
  onLogout,
}) {
  const userName = user?.name || "Kasir";
  const userRole = user?.role?.toLowerCase() || "Staff POS";
  const initial = userName.trim().charAt(0).toUpperCase();

  return (
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
            {navItems.map(({ to, label, icon: Icon, badgeKey }) => {
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
            onClick={onOpenCloseShift}
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
            onClick={onOpenCloseShift}
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
          onClick={onLogout}
          className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
          title="Keluar sistem"
          aria-label="Keluar sistem"
        >
          <LogOut size={17} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
