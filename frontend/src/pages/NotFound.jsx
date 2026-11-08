// src/pages/NotFound.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Compass } from "lucide-react";

import Button from "../components/ui/Button";
import YasixLogo from "../components/ui/YasixLogo";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative font-sans">
      {/* Konten Utama */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">
        {/* Logo */}
        <div className="mb-10">
          <YasixLogo variant="full" theme="light" size={48} />
        </div>

        {/* Ilustrasi 404 */}
        <div className="relative mb-6">
          <h1 className="text-[96px] md:text-[120px] font-extrabold text-slate-200 leading-none tracking-tighter select-none">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-3xl shadow-sm text-primary border border-slate-200">
            <Compass size={40} strokeWidth={1.5} />
          </div>
        </div>

        {/* Teks Pesan */}
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8 px-4">
          Tautan yang Anda tuju tidak tersedia atau telah dipindahkan.
          Silakan kembali ke halaman sebelumnya atau ke menu login.
        </p>

        {/* Aksi Tombol */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-6"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </Button>

          <Button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-6"
          >
            <Home size={16} />
            <span>Ke Halaman Login</span>
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
