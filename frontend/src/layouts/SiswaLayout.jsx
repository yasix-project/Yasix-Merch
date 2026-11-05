import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Printer,
  ClipboardList,
  User,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useStudentCartStore } from "../store/studentCartStore";

export default function SiswaLayout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Panggil query /auth/me untuk memvalidasi & menyegarkan data user
  const { user: liveUser, isFetching, refetch } = useCurrentUser();
  const cachedUser = useAuthStore((state) => state.user);

  // Gunakan data live backend atau fallback ke cache lokal
  const user = liveUser || cachedUser;
  const cartCount = useStudentCartStore((state) => state.getTotalItems());

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/siswa/katalog", label: "Katalog", icon: ShoppingBag },
    { to: "/siswa/print", label: "Print PDF", icon: Printer },
    { to: "/siswa/pesanan", label: "Pesanan", icon: ClipboardList },
    { to: "/siswa/profil", label: "Kartu Saya", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800">
      <div className="w-full max-w-lg bg-slate-50 min-h-screen flex flex-col shadow-2xl relative border-x border-slate-200">
        {/* Top Header Siswa */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-gradient text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div className="leading-tight">
              <h1 className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                {user?.name || "Siswa Yasix"}
              </h1>
              <p className="text-[10px] font-mono text-slate-400">
                NIS: {user?.nis || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Badge Saldo Poin dengan tombol Refresh */}
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1 px-2.5 py-1 bg-accent/15 border border-accent/30 rounded-full text-amber-900 text-xs font-black shadow-2xs hover:bg-accent/25 transition-colors"
              title="Klik untuk menyegarkan saldo poin"
            >
              <Sparkles
                size={13}
                className={`text-accent ${isFetching ? "animate-spin" : ""}`}
              />
              <span>{user?.points ?? 0} Poin</span>
            </button>

            {/* Tombol Keluar */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 p-4 pb-24 overflow-y-auto">
          <Outlet />
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 py-2 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "text-primary font-bold scale-105"
                        : "text-slate-400 hover:text-slate-600 font-medium"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`p-1 rounded-lg transition-colors relative ${
                          isActive ? "bg-primary/10" : "bg-transparent"
                        }`}
                      >
                        <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                        {item.to === "/siswa/katalog" && cartCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-dark text-[9px] font-black flex items-center justify-center shadow-2xs">
                            {cartCount > 9 ? "9+" : cartCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] mt-0.5 tracking-tight">
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
