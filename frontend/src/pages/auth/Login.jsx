// src/pages/Login.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  Store,
  GraduationCap,
} from "lucide-react";

import YasixLogo from "../../components/ui/YasixLogo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuthMutations } from "../../hooks/admin/useAuth";
import { useAuthStore } from "../../store/authStore";

// Skema Validasi Login Umum
const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid." }),
  password: z.string().min(1, { message: "Kata sandi wajib diisi." }),
});

export default function Login() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const { login } = useAuthMutations();

  const loginAction = useAuthStore((state) => state.login);

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

        loginAction(user, token);
        localStorage.setItem("accessToken", token);
        sessionStorage.setItem("userRole", user.role);

        const userRole = user.role?.toUpperCase();
        if (userRole === "KASIR") {
          navigate("/kasir/pos");
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
    <div className="relative min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-6 font-sans">
      {/* Kontainer Utama */}
      <main className="relative z-10 max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* === SISI KIRI: INFORMASI PORTAL LAYANAN SEKOLAH === */}
        <section className="relative hidden md:flex md:w-5/12 p-10 flex-col justify-between bg-dark text-white border-r border-slate-800">
          <div className="space-y-8 relative z-10">
            {/* Logo Utama & Badge Unit Sekolah */}
            <div className="flex items-center justify-between gap-3">
              <YasixLogo variant="full" theme="dark" size={44} />
              <span className="bg-primary/20 border border-primary/40 rounded-full px-3 py-1 text-[11px] font-bold text-sky">
                SMK Yadika 6
              </span>
            </div>

            {/* Headline Umum */}
            <div className="space-y-3">
              <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white">
                Pusat Bisnis & <br />
                <span className="text-accent">Layanan Siswa</span>
              </h1>
              <p className="text-slate-200 text-sm leading-relaxed pr-4 font-normal">
                Sistem terpadu untuk transaksi kasir YasixMerch, pemesanan seragam & alat tulis, serta layanan antrean cetak dokumen mandiri siswa.
              </p>
            </div>

            {/* Informasi Peruntukan */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-200 bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="p-2 bg-primary/20 rounded-lg text-sky shrink-0">
                  <Store size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Kasir & Point of Sale</h4>
                  <p className="text-[11px] text-slate-300">
                    Pelayanan belanja langsung, kas shift, dan cetak struk.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-200 bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="p-2 bg-accent/20 rounded-lg text-accent shrink-0">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Portal Siswa Yadika 6</h4>
                  <p className="text-[11px] text-slate-300">
                    Katalog online, kartu member digital, dan antrean print PDF.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Showcase */}
          <div className="pt-6 border-t border-white/10 mt-8 flex justify-between items-center text-xs text-slate-300 font-medium">
            <span>Unit Produksi & Kewirausahaan SMK Yadika 6</span>
          </div>
        </section>

        {/* === SISI KANAN: FORM LOGIN === */}
        <section className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-slate-900">
          {/* Header Form */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
              <YasixLogo variant="icon" size={44} className="shrink-0" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Masuk ke Akun
              </h2>
              <p className="text-sm text-slate-300 font-normal mt-0.5">
                Masuk menggunakan akun kasir atau akun siswa terdaftar
              </p>
            </div>
          </div>

          {/* Form Login */}
          <form
            onSubmit={handleSubmit(onLogin)}
            className="space-y-5 w-full max-w-md"
          >
            {loginError && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-sm text-red-300 font-medium flex items-start gap-3">
                <AlertCircle
                  size={18}
                  className="shrink-0 mt-0.5 text-red-400"
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
              className="[&>label]:text-slate-200 [&_input]:bg-slate-800/80 [&_input]:border-slate-700 [&_input]:text-white [&_input]:placeholder-slate-400 [&_input]:focus:border-primary [&_input]:focus:bg-slate-800"
            />

            <Input
              id="password"
              type="password"
              label="Kata Sandi"
              icon={Lock}
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
              className="[&>label]:text-slate-200 [&_input]:bg-slate-800/80 [&_input]:border-slate-700 [&_input]:text-white [&_input]:placeholder-slate-400 [&_input]:focus:border-primary [&_input]:focus:bg-slate-800 [&_button]:text-slate-300"
            />

            <Button
              type="submit"
              className="w-full py-3 mt-4 text-base rounded-xl bg-primary hover:bg-primary-hover text-white transition-all font-bold"
              isLoading={isSubmitting || login.isPending}
            >
              {isSubmitting || login.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Memverifikasi...
                </>
              ) : (
                <span>Masuk</span>
              )}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                Punya kendala akun? Hubungi administrator di ruang Business Center Yadika 6.
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
