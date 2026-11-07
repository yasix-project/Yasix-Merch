import { NavLink } from "react-router-dom";
import { Wallet } from "lucide-react";

export default function KasirBottomNav({
  activeShift,
  navItems = [],
  bookedCount = 0,
  onOpenCloseShift,
}) {
  if (!activeShift) return null;

  return (
    <nav
      aria-label="Navigasi Kasir Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/90 bg-white/95 px-1 backdrop-blur-md md:hidden shadow-[0_-4px_20px_rgba(15,23,42,0.08)]"
    >
      {navItems.map(({ to, shortLabel, icon: Icon, badgeKey }) => {
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
        onClick={onOpenCloseShift}
        className="relative flex flex-1 flex-col items-center justify-center py-1 text-amber-700 hover:text-amber-800 font-medium transition-all"
        title="Tutup Shift Kasir"
      >
        <Wallet size={19} strokeWidth={1.75} />
        <span className="text-[10px] leading-tight mt-0.5">Shift</span>
      </button>
    </nav>
  );
}
