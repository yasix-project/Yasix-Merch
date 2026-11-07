import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  LogOut,
  Settings,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FolderTree,
  Ticket,
  Clock,
  Users,
  BanknoteArrowUp,
  Menu, // [BARU] tombol hamburger (mobile)
  X, // [BARU] tombol tutup drawer (mobile)
} from "lucide-react";
import YasixLogo from "../components/ui/YasixLogo";
import LogoYadika from "../assets/yadika-seeklogo.png";
import { useAuthStore } from "../store/authStore";

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false); // desktop: ciut / lebar
  const [mobileOpen, setMobileOpen] = useState(false); // [BARU] mobile: drawer

  // Di drawer mobile label selalu tampil; mode ciut hanya berlaku di desktop
  const mini = collapsed && !mobileOpen;

  // [BARU] Tutup drawer: tombol Esc, dan saat layar diperbesar ke ukuran desktop
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e) => e.matches && setMobileOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const navigationGroups = [
    {
      title: "UTAMA",
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "SISTEM & OPERASIONAL",
      items: [
        { name: "Kelola Produk", path: "/admin/produk", icon: Package },
        { name: "Kelola Kategori", path: "/admin/kategori", icon: FolderTree },
        { name: "Kelola Voucher", path: "/admin/voucher", icon: Ticket },

        { name: "Kelola Siswa", path: "/admin/siswa", icon: Users },
      ],
    },
    {
      title: "MONITORING",
      items: [
        { name: "Monitoring Shift", path: "/admin/shift", icon: Clock },
        {
          name: "Monitoring Transaksi",
          path: "/admin/transaksi",
          icon: BanknoteArrowUp,
        },
      ],
    },
    {
      title: "PENGATURAN",
      items: [
        { name: "Pengaturan", path: "/admin/pengaturan", icon: Settings },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-bright font-sans antialiased text-slate-800">
      {/* [BARU] Overlay gelap di belakang drawer (mobile) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ===== SIDEBAR: drawer di mobile, sidebar tetap di desktop ===== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:max-w-none ${
          collapsed ? "md:w-20" : "md:w-64"
        } transition-all duration-300 bg-dark border-r border-white/10 shadow-2xl shadow-dark/30 flex flex-col`}
      >
        {/* Lapisan dekorasi: glow & watermark */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/40 rounded-full blur-3xl" />
          <div className="absolute bottom-10 -right-24 w-64 h-64 bg-cyan/10 rounded-full blur-3xl" />
          <img
            src={LogoYadika}
            alt=""
            aria-hidden="true"
            className="absolute -bottom-12 -right-12 w-64 opacity-[0.06] select-none"
          />
        </div>

        {/* Tombol buka/tutup sidebar (desktop saja) */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="hidden md:flex absolute -right-3 top-8 w-6 h-6 items-center justify-center rounded-full bg-dark text-sky border border-white/20 shadow-lg hover:bg-primary hover:text-white hover:border-primary transition-colors z-30"
          title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>

        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          {/* Logo di atas (+ tombol X di mobile) */}
          <div
            className={`h-20 shrink-0 flex items-center border-b border-white/10 pt-[env(safe-area-inset-top)] ${
              mini ? "justify-center" : "px-6 justify-between"
            }`}
          >
            {mini ? (
              <YasixLogo variant="icon" theme="dark" size={40} />
            ) : (
              <YasixLogo
                variant="full"
                theme="dark"
                size={40}
                tagline={false}
              />
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-2 -mr-2 rounded-lg text-blue-200/80 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Tutup menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigasi Terkelompok (bagian ini yang bisa di-scroll) */}
          <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-6 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
            {navigationGroups.map((group) => (
              <div key={group.title}>
                {mini ? (
                  <div className="mx-3 mb-2 border-t border-white/10" />
                ) : (
                  <p className="px-3 text-[10px] font-semibold tracking-wider text-blue-200/50 mb-2 uppercase">
                    {group.title}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        title={mini ? item.name : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center ${
                          mini ? "justify-center" : "justify-between"
                        } px-3 py-3 md:py-2.5 rounded-xl text-sm font-normal border transition-all ${
                          isActive
                            ? "bg-primary/30 border-primary/50 text-white backdrop-blur-md shadow-[inset_3px_0_0_var(--color-accent)]"
                            : "border-transparent text-blue-100/70 hover:bg-white/10 hover:border-white/10 hover:text-white active:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={18}
                            strokeWidth={isActive ? 2.5 : 2}
                            className={isActive ? "text-cyan" : ""}
                          />
                          {!mini && <span>{item.name}</span>}
                        </div>
                        {!mini && isActive && (
                          <ChevronRight size={14} className="text-cyan" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Status Cloud Railway Engine */}
        {!mini && (
          <div className="relative z-10 shrink-0 px-4 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10.5px] font-mono font-medium truncate">
                Railway Cloud: Online
              </span>
            </div>
          </div>
        )}

        {/* Profil Pengguna: kartu kaca (aman dari bar gestur Android) */}
        <div className="relative z-10 shrink-0 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10">
          <div
            className={`flex items-center ${
              mini ? "flex-col gap-2" : "justify-between"
            } p-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="w-9 h-9 rounded-lg bg-primary text-white font-bold flex items-center justify-center shrink-0 shadow-md shadow-primary/30"
                title={mini ? user?.name || "Admin Manager" : undefined}
              >
                {user?.name?.charAt(0) || "A"}
              </div>
              {!mini && (
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.name || "Admin Manager"}
                  </p>
                  <p className="text-[10px] text-blue-200/80 font-medium truncate">
                    Administrator
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-blue-200/70 hover:text-red-300 hover:bg-danger/20 rounded-lg transition-colors shrink-0"
              title="Keluar"
              aria-label="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== KONTEN UTAMA ===== */}
      <div className="relative flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Glow ambient halus di latar konten */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile Header: hamburger + logo (kaca gelap) */}
        <header className="relative z-10 shrink-0 bg-dark/95 backdrop-blur-md border-b border-white/10 h-16 pt-[env(safe-area-inset-top)] box-content flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-sky hover:bg-white/10 active:bg-white/10 transition-colors"
            aria-label="Buka menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={22} />
          </button>
          <YasixLogo variant="full" theme="dark" size={32} tagline={false} />
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Cloud Live
          </span>
        </header>

        <main className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
