// src/pages/admin/Pengaturan.jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Award, Save, Loader2, CheckCircle2 } from "lucide-react";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useProfile, useProfileMutations } from "../../hooks/admin/useProfile";

// Schema Validasi Zod
const profileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Password baru minimal 6 karakter",
    }),
});

export default function Pengaturan() {
  // 1. Fetch Data User Aktif dari /me
  const { data: user, isLoading, isError, error } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Autofill form saat data user berhasil dimuat
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user, reset]);

  // 2. Mutation Update Profile
  const { update } = useProfileMutations();

  const handleFormSubmit = (data) => {
    update.mutate(data, {
      onSuccess: (res) => {
        alert("Profil berhasil diperbarui!");
        reset({
          name: res.data?.data?.name || user.name,
          email: res.data?.data?.email || user.email,
          password: "",
        });
      },
      onError: (err) => {
        alert(err.response?.data?.message || "Gagal memperbarui profil.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 size={36} className="animate-spin text-primary mb-3" />
        <p className="text-xs font-semibold">Memuat Pengaturan Akun...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-medium text-center border border-red-200 max-w-md mx-auto">
        {error?.message || "Gagal memuat informasi akun."}
      </div>
    );
  }

  const isStudent = user.role === "SISWA";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Page */}
      <div>
        <h1 className="text-2xl font-bold text-dark tracking-tight">
          Pengaturan Akun
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Kelola informasi profil dan keamanan kata sandi Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KARTU RINGKASAN PROFIL (SISI KIRI) */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-dark via-slate-900 to-primary text-white rounded-2xl p-6 shadow-sm relative overflow-hidden text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-accent mx-auto sm:mx-0 mb-4 shadow-inner">
              <User size={32} />
            </div>

            <h2 className="text-lg font-bold text-white tracking-wide truncate">
              {user.name}
            </h2>
            <p className="text-xs text-sky/80 font-mono truncate mt-0.5">
              {user.email}
            </p>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300">Hak Akses</span>
              <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-accent text-dark">
                {user.role}
              </span>
            </div>

            {user.nis && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-300">NIS</span>
                <span className="font-mono font-bold text-white">
                  {user.nis}
                </span>
              </div>
            )}

            {isStudent && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-300">Poin Loyalitas</span>
                <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                  <Award size={13} /> {user.points || 0} Poin
                </span>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-blue-900">
              <CheckCircle2 size={14} /> Sesi Terverifikasi
            </div>
            <p className="text-[11px] leading-relaxed text-blue-700">
              Perubahan profil akan langsung diperbarui ke seluruh sesi aplikasi
              Business Center Yasix.
            </p>
          </div>
        </div>

        {/* FORMULIR EDIT PROFIL (SISI KANAN) */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-dark border-b border-slate-100 pb-3 mb-5">
            Perbarui Informasi Diri
          </h3>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <Input
              id="name"
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              {...register("name")}
              error={errors.name?.message}
            />

            <Input
              id="email"
              type="email"
              label="Alamat Email"
              placeholder="nama@yasix.com"
              {...register("email")}
              error={errors.email?.message}
            />

            <div className="pt-2 border-t border-slate-100">
              <Input
                id="password"
                type="password"
                label="Password Baru (Opsional)"
                placeholder="Kosongkan jika tidak ingin diubah"
                {...register("password")}
                error={errors.password?.message}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Abaikan kolom password jika hanya ingin mengedit Nama atau
                Email.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                type="submit"
                isLoading={isSubmitting || update.isPending}
              >
                <Save size={16} /> Simpan Perubahan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
