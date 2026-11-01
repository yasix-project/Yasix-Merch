// src/pages/NotFound.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Compass } from "lucide-react";

import Button from "../components/ui/Button";
import BCYasixLogo from "../components/ui/BcYasixLogo"; // Sesuaikan path jika berbeda

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Efek Latar Belakang (Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Konten Utama */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">
        {/* Logo */}
        <div className="mb-10 transform hover:scale-105 transition-transform duration-300">
          <BCYasixLogo variant="full" theme="light" size={48} />
        </div>

        {/* Ilustrasi 404 */}
        <div className="relative mb-6">
          <h1 className="text-[120px] md:text-[150px] font-extrabold text-slate-200 leading-none tracking-tighter select-none">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-3xl shadow-xl shadow-blue-900/10 text-blue-600 border border-slate-100">
            <Compass size={48} strokeWidth={1.5} className="animate-pulse" />
          </div>
        </div>

        {/* Teks Pesan */}
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-3">
          Tersesat di Sistem?
        </h2>
        <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-10 px-4">
          Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
          Pastikan URL yang dimasukkan sudah benar atau kembali ke jalur yang
          aman.
        </p>

        {/* Aksi Tombol */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)} // Kembali ke riwayat sebelumnya
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
          >
            <ArrowLeft size={18} />
            <span>Kembali</span>
          </Button>

          <Button
            onClick={() => navigate("/login")} // Arahkan ke beranda (atau '/admin')
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 shadow-md shadow-blue-500/20"
          >
            <Home size={18} />
            <span>Ke Login</span>
          </Button>
        </div>

        {/* Footer info */}
        <div className="mt-16 text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} Yasix Merch - SMK Yadika 6
        </div>
      </div>
    </div>
  );
}
