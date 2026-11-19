import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  LogIn,
  LayoutDashboard,
  Store,
  GraduationCap,
} from "lucide-react";
import YasixLogo from "../ui/YasixLogo";
import Button from "../ui/Button";
import { useAuthStore } from "../../store/authStore";

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const navLinks = [
    { name: "Beranda", href: "#beranda" },
    { name: "Layanan", href: "#layanan" },
    { name: "Kalkulator Cetak", href: "#kalkulator" },
    { name: "Katalog Produk", href: "#produk" },
    { name: "Lacak Pesanan", href: "#lacak" },
    { name: "Jam Buka & Kontak", href: "#kontak" },
    { name: "FAQ", href: "#faq" },
  ];

  // Helper untuk menentukan tombol navigasi user
  const renderUserButton = (isMobile = false) => {
    if (!user) {
      return (
        <div className={`flex items-center gap-2 ${isMobile ? "flex-col w-full" : ""}`}>
          <Button
            as={Link}
            to="/login"
            size="sm"
            variant="primary"
            leftIcon={LogIn}
            onClick={() => setMobileMenuOpen(false)}
            className={isMobile ? "w-full" : ""}
          >
            <span>Masuk Portal Siswa / Kasir</span>
          </Button>
          <Button
            as={Link}
            to="/login/admin"
            size="sm"
            variant="dark"
            onClick={() => setMobileMenuOpen(false)}
            className={isMobile ? "w-full" : ""}
            title="Portal Administrator"
          >
            <span>Admin</span>
          </Button>
        </div>
      );
    }

    const userRole = (role || user.role || "").toUpperCase();

    if (userRole === "ADMIN") {
      return (
        <Button
          as={Link}
          to="/admin/dashboard"
          size="sm"
          variant="primary"
          leftIcon={LayoutDashboard}
          onClick={() => setMobileMenuOpen(false)}
          className={`bg-indigo-600 hover:bg-indigo-700 ${isMobile ? "w-full" : ""}`}
        >
          <span>Dashboard Admin</span>
        </Button>
      );
    }

    if (userRole === "KASIR") {
      return (
        <Button
          as={Link}
          to="/kasir/pos"
          size="sm"
          variant="primary"
          leftIcon={Store}
          onClick={() => setMobileMenuOpen(false)}
          className={`bg-emerald-600 hover:bg-emerald-700 ${isMobile ? "w-full" : ""}`}
        >
          <span>Terminal Kasir POS</span>
        </Button>
      );
    }

    // Default SISWA
    return (
      <Button
        as={Link}
        to="/siswa/katalog"
        size="sm"
        variant="amber"
        leftIcon={GraduationCap}
        onClick={() => setMobileMenuOpen(false)}
        className={isMobile ? "w-full" : ""}
      >
        <span>Portal Siswa ({user.name ? user.name.split(" ")[0] : "Siswa"})</span>
      </Button>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-slate-800 py-3.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#beranda"
            className="flex items-center gap-3 focus:outline-none"
            aria-label="Kembali ke beranda YasixMerch"
          >
            <YasixLogo variant="full" theme="dark" size={36} />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-3 py-1 rounded text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right Action Button (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {renderUserButton(false)}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Menu navigasi"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Solid, no excessive blur) */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="pt-3 border-t border-slate-800">
              {renderUserButton(true)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
