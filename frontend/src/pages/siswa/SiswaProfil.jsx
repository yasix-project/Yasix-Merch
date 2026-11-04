import {
  User,
  Mail,
  Hash,
  Gift,
  HelpCircle,
  LogOut,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import StudentIdCard from "../../components/siswa/StudentIdCard";
import Button from "../../components/ui/Button";

export default function SiswaProfil() {
  const logout = useAuthStore((state) => state.logout);
  const { user: liveUser, isFetching, refetch } = useCurrentUser();
  const cachedUser = useAuthStore((state) => state.user);

  const user = liveUser || cachedUser;

  return (
    <div className="space-y-4 pb-6">
      {/* Kartu Member Digital */}
      <StudentIdCard user={user} />

      {/* Tombol Sinkronisasi Data */}
      <div className="flex justify-end">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-semibold transition-colors"
        >
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          <span>{isFetching ? "Memperbarui..." : "Sinkronkan Data"}</span>
        </button>
      </div>

      {/* Benefit Poin */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Gift size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Tukarkan Poin dengan Diskon
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Gunakan poin belanja dan print untuk mendapatkan voucher potongan
              harga.
            </p>
          </div>
        </div>
      </div>

      {/* Rincian Akun */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Informasi Akun Siswa
        </h3>

        <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-slate-500">
              <User size={15} />
              <span>Nama Lengkap</span>
            </div>
            <span className="font-bold text-slate-800">
              {user?.name || "-"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2.5">
            <div className="flex items-center gap-2 text-slate-500">
              <Hash size={15} />
              <span>NIS</span>
            </div>
            <span className="font-mono font-bold text-slate-800">
              {user?.nis || "-"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2.5">
            <div className="flex items-center gap-2 text-slate-500">
              <Mail size={15} />
              <span>Email</span>
            </div>
            <span className="font-medium text-slate-800 truncate max-w-[180px]">
              {user?.email || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Bantuan & Logout */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() =>
            alert(
              "Silakan hubungi petugas Business Center jika ada selisih poin.",
            )
          }
          className="w-full flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle size={16} className="text-slate-400" />
            <span>Pusat Bantuan & Ketentuan Poin</span>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        <Button
          variant="outline"
          onClick={logout}
          className="w-full py-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs font-bold rounded-2xl"
        >
          <LogOut size={15} className="mr-2" />
          Keluar dari Akun
        </Button>
      </div>
    </div>
  );
}
