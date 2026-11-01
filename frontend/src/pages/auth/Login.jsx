// src/pages/Login.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Server,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

import BCYasixLogo from "../../components/ui/BcYasixLogo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuthMutations } from "../../hooks/admin/useAuth";

// Skema Validasi Login Umum
const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid." }),
  password: z.string().min(1, { message: "Kata sandi wajib diisi." }),
});

export default function Login() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const { login } = useAuthMutations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onLogin = (data) => {
    setLoginError("");
    login.mutate(data, {
      onSuccess: (res) => {
        const { token, user } = res.data.data;
        localStorage.setItem("accessToken", token);
        sessionStorage.setItem("userRole", user.role);

        const userRole = user.role?.toUpperCase();
        if (userRole === "ADMIN") {
          navigate("/admin");
        } else if (userRole === "KASIR") {
          navigate("/kasir");
        } else {
          navigate("/siswa");
        }
      },
      onError: (err) => {
        const errorMessage =
          err.response?.data?.message ||
          "Kredensial tidak valid atau koneksi ke server gagal.";
        setLoginError(errorMessage);
      },
    });
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-6 font-sans overflow-hidden">
      {/* Kontainer Utama */}
      <main className="relative z-10 max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* === SISI KIRI: HERO SHOWCASE & SVG GLASS SHARDS === */}
        <section className="relative hidden md:flex md:w-5/12 p-10 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 text-white">
          {/* ============================================================ */}
          {/* BACKGROUND SVG: PECAHAN KACA FUTURISTIK (Di Sisi Kiri Saja)  */}
          {/* ============================================================ */}
          <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="shardGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <g className="animate-pulse-slow">
                <polygon
                  points="0,0 250,0 150,300"
                  fill="url(#shardGrad)"
                  stroke="rgba(59,130,246,0.3)"
                  strokeWidth="1"
                />
                <polygon
                  points="150,300 400,150 450,500"
                  fill="url(#shardGrad)"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <polygon
                  points="-50,500 -50,300 200,450"
                  fill="url(#shardGrad)"
                  stroke="rgba(59,130,246,0.2)"
                  strokeWidth="1"
                />
                <polygon
                  points="200,450 450,600 300,800"
                  fill="url(#shardGrad)"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
                <polygon
                  points="450,600 600,400 400,150"
                  fill="url(#shardGrad)"
                />
              </g>
            </svg>
            {/* Efek Glow di tengah */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/30 rounded-full blur-[80px]"></div>
          </div>

          <div className="space-y-8 relative z-10">
            {/* Logo Utama & Badge */}
            <div className="flex items-center justify-between gap-3">
              <BCYasixLogo variant="full" theme="dark" size={44} />
              <span className="bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1 text-[10px] font-extrabold text-blue-400 tracking-wider uppercase">
                Portal Utama
              </span>
            </div>

            {/* Headline Umum */}
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-white">
                Akses Cerdas & <br />
                <span className="text-blue-400">Terpadu</span>
              </h1>
              <p className="text-blue-200/60 text-sm leading-relaxed pr-6 font-medium">
                Platform manajemen dan koordinasi terpusat dengan sistem
                proteksi data berlapis untuk efisiensi operasional harian
                Business Center Yasix.
              </p>
            </div>

            {/* Keunggulan */}
            <div className="pt-4 space-y-4 hover:scale-[1.01] transition-transform hover:bg-blue-900/20 hover:backdrop-blur-sm rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    Enkripsi Kelas Enterprise
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Proteksi data dengan standar keamanan tinggi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Card Showcase */}
          <div className="pt-6 border-t border-white/10 mt-8 flex justify-between items-center text-xs text-slate-400 font-medium relative z-10">
            <div className="flex items-center gap-2">
              <Server size={14} className="text-emerald-400" />
              <span className="text-emerald-400">
                Status Server: Normal (99.98%)
              </span>
            </div>
          </div>
        </section>

        {/* === SISI KANAN: FORM PANEL (TEMA GELAP) === */}
        <section className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-slate-900/90 relative z-10">
          {/* Header Form */}
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 shadow-inner">
              <BCYasixLogo variant="icon" size={48} className="shrink-0" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Masuk ke Akun
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-0.5">
                Portal Akses Pengguna BC Yasix
              </p>
            </div>
          </div>

          {/* Form Login */}
          <form
            onSubmit={handleSubmit(onLogin)}
            className="space-y-5 w-full max-w-md"
          >
            {/* Error Alert Khusus Tema Gelap */}
            {loginError && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-sm text-red-400 font-medium flex items-start gap-3 shadow-inner">
                <AlertCircle
                  size={18}
                  className="shrink-0 mt-0.5 text-red-500"
                />
                <p className="leading-relaxed">{loginError}</p>
              </div>
            )}

            <Input
              id="email"
              label="Email atau ID Pengguna"
              icon={Mail}
              placeholder="nama@yasix.com"
              {...register("email")}
              error={errors.email?.message}
              // Override class Input agar cocok di tema gelap
              className="[&>label]:text-slate-300 [&_input]:bg-slate-800/50 [&_input]:border-slate-700 [&_input]:text-white [&_input]:placeholder-slate-500 [&_input]:focus:border-blue-500 [&_input]:focus:bg-slate-800"
            />

            <Input
              id="password"
              type="password"
              label="Kata Sandi"
              icon={Lock}
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
              // Override class Input agar cocok di tema gelap
              className="[&>label]:text-slate-300 [&_input]:bg-slate-800/50 [&_input]:border-slate-700 [&_input]:text-white [&_input]:placeholder-slate-500 [&_input]:focus:border-blue-500 [&_input]:focus:bg-slate-800 [&_button]:text-slate-400"
            />

            <Button
              type="submit"
              className="w-full py-3.5 mt-8 text-base rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 transition-all font-bold border border-blue-500/50"
              isLoading={isSubmitting || login.isPending}
            >
              {isSubmitting || login.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  Masuk Sekarang{" "}
                  <ArrowRight size={18} className="ml-2 inline" />
                </>
              )}
            </Button>

            <div className="mt-6 flex justify-between items-center text-center">
              <p className="text-[11px] text-slate-500 font-mono tracking-widest uppercase mx-auto">
                Secured Connection
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
