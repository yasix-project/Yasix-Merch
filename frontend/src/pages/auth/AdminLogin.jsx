// src/pages/auth/AdminLogin.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import YasixLogo from "../../components/ui/YasixLogo";
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
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-900 font-sans">
      <div className="relative z-10 w-full max-w-sm px-6 py-8 bg-slate-800 border border-slate-700 rounded-3xl shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-700 mb-4 inline-flex">
            <YasixLogo variant="icon" size={42} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Portal Administrator
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Manajemen Business Center Yasix
          </p>
        </div>

        {authError && (
          <div className="mb-5 flex items-start gap-2.5 p-3 bg-red-950/50 border border-red-900/60 rounded-xl text-xs text-red-300">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Alamat Email Admin"
            placeholder="admin@yasix.com"
            icon={Mail}
            {...register("email")}
            error={errors.email?.message}
            className="[&>label]:text-slate-200 [&_input]:bg-slate-900 [&_input]:border-slate-700 [&_input]:text-white [&_input]:placeholder-slate-400 [&_input]:focus:border-primary [&_input]:focus:bg-slate-900"
          />

          <Input
            id="password"
            type="password"
            label="Kata Sandi"
            placeholder="••••••••"
            icon={Lock}
            {...register("password")}
            error={errors.password?.message}
            className="[&>label]:text-slate-200 [&_input]:bg-slate-900 [&_input]:border-slate-700 [&_input]:text-white [&_input]:placeholder-slate-400 [&_input]:focus:border-primary [&_input]:focus:bg-slate-900 [&_button]:text-slate-300"
          />

          <Button
            type="submit"
            disabled={isSubmitting || loginAdmin.isPending}
            isLoading={isSubmitting || loginAdmin.isPending}
            className="w-full py-3 mt-4 text-sm font-bold bg-primary hover:bg-primary-hover text-white rounded-xl"
          >
            Masuk sebagai Admin
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} SMK Yadika 6 Jatiwaringin
          </p>
        </div>
      </div>
    </div>
  );
}
