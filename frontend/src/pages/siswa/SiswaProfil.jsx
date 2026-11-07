import { useState } from "react";
import {
  User,
  Mail,
  Hash,
  Gift,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useRedeemPoints } from "../../hooks/siswa/useStudentTransactions";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import StudentIdCard from "../../components/siswa/StudentIdCard";
import Button from "../../components/ui/Button";

export default function SiswaProfil() {
  const logout = useAuthStore((state) => state.logout);
  const { user: liveUser, isFetching, refetch } = useCurrentUser();
  const cachedUser = useAuthStore((state) => state.user);
  const user = liveUser || cachedUser;

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [redeemedVoucher, setRedeemedVoucher] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const redeemMutation = useRedeemPoints();
  const points = user?.points ?? 0;
  const canRedeem = points >= 100;

  const handleRedeem = () => {
    if (!canRedeem) return;

    // Kirim payload eksplisit diskon 10% sesuai ketentuan loyalitas siswa
    redeemMutation.mutate(
      { discountPct: 10 },
      {
        onSuccess: (res) => {
          const voucher = res.data?.data?.voucher || res.data?.data;
          setRedeemedVoucher(voucher);
          showSuccessToast(
            res.data?.message ||
              "Berhasil menukarkan 100 poin menjadi voucher diskon 10%!",
          );
        },
        onError: (err) => {
          const msg =
            err.response?.data?.message || "Gagal menukarkan poin. Coba lagi.";
          showErrorToast(msg);
        },
      },
    );
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Kartu Member Digital */}
      <StudentIdCard user={user} />

      {/* Tombol Sinkronisasi Data */}
      <div className="flex justify-end">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary font-semibold transition-colors"
        >
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          <span>{isFetching ? "Memperbarui..." : "Sinkronkan Data"}</span>
        </button>
      </div>

      {/* Benefit Poin & Penukaran Voucher */}
      <div className="bg-gradient-to-r from-accent/20 via-accent/5 to-transparent border border-accent/40 rounded-2xl p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-dark flex items-center justify-center font-bold shadow-md shadow-accent/20 shrink-0">
              <Gift size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Tukarkan Poin dengan Diskon 10%
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Setiap 100 poin dapat ditukar dengan voucher diskon 10% (maks. Rp 10.000).
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="xs"
            variant="primary"
            onClick={handleRedeem}
            disabled={!canRedeem || redeemMutation.isPending}
            className="text-xs px-3 py-1.5 font-bold rounded-xl shrink-0"
          >
            {redeemMutation.isPending ? (
              <Loader2 size={13} className="animate-spin mr-1" />
            ) : (
              <Sparkles size={13} className="mr-1" />
            )}
            <span>Tukar</span>
          </Button>
        </div>

        {/* Progress Bar Poin */}
        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
            <span>Progress: {points} / 100 Poin</span>
            <span>{canRedeem ? "Siap Ditukarkan!" : `Kurang ${100 - points} poin lagi`}</span>
          </div>
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                canRedeem ? "bg-emerald-500" : "bg-accent"
              }`}
              style={{ width: `${Math.min(100, (points / 100) * 100)}%` }}
            />
          </div>
        </div>

        {/* Notifikasi Voucher yang Baru Ditukar */}
        {redeemedVoucher && (
          <div className="p-3 bg-white/90 border border-accent/50 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">
                Voucher Diskon {redeemedVoucher.discountPct || 10}% Anda:
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-black text-slate-900 text-sm">
                  {redeemedVoucher.code}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-accent text-dark text-[9px] font-black uppercase">
                  {redeemedVoucher.discountPct || 10}% OFF
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyCode(redeemedVoucher.code)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent/20 text-amber-900 font-bold text-xs hover:bg-accent/30 transition-colors"
            >
              {copiedCode ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedCode ? "Tersalin" : "Salin"}</span>
            </button>
          </div>
        )}
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

      {/* Bantuan & Ketentuan Poin (Expandable Accordion) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all">
        <button
          type="button"
          onClick={() => setIsHelpOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle size={16} className="text-slate-400" />
            <span>Pusat Bantuan & Ketentuan Poin</span>
          </div>
          {isHelpOpen ? (
            <ChevronDown size={16} className="text-slate-400" />
          ) : (
            <ChevronRight size={16} className="text-slate-400" />
          )}
        </button>

        {isHelpOpen && (
          <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              <strong>1. Bagaimana cara mendapatkan poin?</strong>
              <br />
              Poin diperoleh otomatis dari setiap transaksi belanja di YasixMerch atau cetak mandiri dokumen.
            </p>
            <p>
              <strong>2. Bagaimana cara menukarkan voucher?</strong>
              <br />
              Kumpulkan minimal 100 poin, lalu klik tombol <em>Tukar</em> di atas untuk mendapatkan kupon diskon 10% (maksimal potongan Rp 10.000). Kode voucher dapat digunakan saat checkout pre-order barang.
            </p>
            <p>
              <strong>3. Selisih data poin?</strong>
              <br />
              Jika poin belum terupdate setelah transaksi di kasir, gunakan tombol <em>Sinkronkan Data</em> di atas atau hubungi petugas kasir YasixMerch.
            </p>
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="pt-2">
        <Button
          variant="outline"
          onClick={logout}
          className="w-full py-3 text-danger border-danger/30 hover:bg-danger/10 hover:border-danger/40 text-xs font-bold rounded-2xl"
        >
          <LogOut size={15} className="mr-2" />
          Keluar dari Akun
        </Button>
      </div>
    </div>
  );
}
