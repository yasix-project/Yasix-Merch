import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogIn,
  LayoutDashboard,
  Store,
  GraduationCap,
  Sparkles,
  Printer,
  ShoppingBag,
  HelpCircle,
  Clock,
  Search,
} from "lucide-react";
import YasixLogo from "../ui/YasixLogo";
import Button from "../ui/Button";
import { useAuthStore } from "../../store/authStore";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            className={`shadow-lg shadow-primary/20 ${isMobile ? "w-full" : ""}`}
          >
            <span>Masuk Portal Siswa / Kasir</span>
          </Button>
          <Button
            as={Link}
            to="/login/admin"
            size="sm"
            variant="dark"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-slate-400 hover:text-white border-slate-700/60 ${isMobile ? "w-full" : ""}`}
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
          className={`bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 ${isMobile ? "w-full" : ""}`}
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
          className={`bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 ${isMobile ? "w-full" : ""}`}
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
        className={`shadow-accent/25 ${isMobile ? "w-full" : ""}`}
      >
        <span>Buka Portal Siswa ({user.name ? user.name.split(" ")[0] : "Siswa"})</span>
      </Button>
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl py-3"
          : "bg-slate-950/60 backdrop-blur-sm border-b border-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#beranda"
            className="flex items-center gap-3 group focus:outline-none"
            aria-label="Kembali ke beranda YasixMerch"
          >
            <YasixLogo variant="full" theme="dark" size={38} />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 bg-slate-900/60 p-1.5 rounded-full border border-slate-800">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right Action Button (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {renderUserButton(false)}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Menu navigasi"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1.5 mb-4">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all"
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
