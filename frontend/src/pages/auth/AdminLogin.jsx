// src/pages/auth/AdminLogin.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";

import Input from "../../components/ui/Input";
import BCYasixLogo from "../../components/ui/BcYasixLogo";
import { useAuthMutations } from "../../hooks/admin/useAuth";
import { useAuthStore } from "../../store/authStore";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");
  const { loginAdmin } = useAuthMutations();

  // Panggil action login dari Zustand store
  const loginAction = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data) => {
    setAuthError("");
    loginAdmin.mutate(data, {
      onSuccess: (res) => {
        const { token, user } = res.data.data;
        loginAction(user, token);
        localStorage.setItem("accessToken", token);
        sessionStorage.setItem("userRole", user.role);
        navigate("/admin/dashboard");
      },
      onError: (err) => {
        setAuthError(err.response?.data?.message || "Koneksi ke server gagal.");
      },
    });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="shardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad1)" />

          <g className="animate-pulse-slow">
            <polygon
              points="0,0 400,0 200,300"
              fill="url(#shardGrad)"
              stroke="rgba(59,130,246,0.2)"
              strokeWidth="1"
            />
            <polygon
              points="1000,0 1440,0 1200,400"
              fill="url(#shardGrad)"
              stroke="rgba(59,130,246,0.2)"
              strokeWidth="1"
            />
            <polygon
              points="200,300 600,100 700,500"
              fill="url(#shardGrad)"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
            <polygon
              points="1200,400 800,200 900,600"
              fill="url(#shardGrad)"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
            <polygon
              points="0,1000 0,600 300,700"
              fill="url(#shardGrad)"
              stroke="rgba(59,130,246,0.15)"
              strokeWidth="1"
            />
            <polygon
              points="1440,1000 1440,700 1100,800"
              fill="url(#shardGrad)"
              stroke="rgba(59,130,246,0.15)"
              strokeWidth="1"
            />
            <polygon
              points="300,700 600,900 500,500"
              fill="url(#shardGrad)"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />
            <polygon
              points="1100,800 800,950 900,600"
              fill="url(#shardGrad)"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />
            <polygon points="700,500 500,500 600,900" fill="url(#shardGrad)" />
            <polygon
              points="700,500 900,600 800,950 600,900"
              fill="rgba(30,58,138,0.2)"
              stroke="rgba(59,130,246,0.1)"
              strokeWidth="1"
            />
          </g>
        </svg>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm px-6 py-10 mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white p-3 rounded-2xl shadow-lg mb-5 inline-flex ring-4 ring-white/10">
            <BCYasixLogo variant="icon" size={42} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Admin Portal
          </h1>
          <p className="text-sm text-blue-200/70 mt-1.5 font-medium tracking-widest uppercase">
            Yasix Merch Management
          </p>
        </div>

        {authError && (
          <div className="mb-6 flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/50 rounded-xl">
            <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
            <span className="text-xs text-red-200 leading-relaxed font-medium">
              {authError}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            id="email"
            type="email"
            placeholder="Alamat Email Admin"
            icon={Mail}
            {...register("email")}
            error={errors.email?.message}
            className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-slate-400 [&_input]:focus:border-blue-400 [&_input]:focus:bg-white/10"
          />

          <Input
            id="password"
            type="password"
            placeholder="Kata Sandi Keamanan"
            icon={Lock}
            {...register("password")}
            error={errors.password?.message}
            className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-slate-400 [&_input]:focus:border-blue-400 [&_input]:focus:bg-white/10"
          />

          <button
            type="submit"
            disabled={isSubmitting || loginAdmin.isPending}
            className="w-full py-3.5 mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isSubmitting || loginAdmin.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Otentikasi...</span>
              </>
            ) : (
              <>
                <span>Akses Sistem</span>
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            &copy; 2026 SMK Yadika 6. Secured Connection.
          </p>
        </div>
      </div>
    </div>
  );
}
