import {
  Wallet,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react";
import Button from "../ui/Button";
import { formatRupiah } from "../../utils/formatters";

const formatClock = (date) =>
  date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

function CashField({ label, icon: Icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </span>
      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          {...props}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 placeholder:font-normal focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
        />
      </div>
    </label>
  );
}

export default function ShiftCloseModal({
  isOpen = false,
  activeShift,
  effectiveCashSales = 0,
  effectiveExpectedEndCash = 0,
  shiftSummaryLoading = false,
  actualCash = "",
  setActualCash,
  hasEnteredCash = false,
  cashDifference = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}) {
  if (!isOpen || !activeShift) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md overflow-y-auto">
      <div className="animate-in zoom-in-95 my-auto w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80 relative">
        <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-200/60">
              <Wallet size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Tutup Shift Kasir
              </h2>
              <p className="text-[11px] text-slate-400">
                Rekonsiliasi akhir sesi & perhitungan kas fisik
              </p>
            </div>
          </div>
        </div>

        {/* Banner Catatan Kas Sistem (Pengingat Kas Bertambah & Total) */}
        <div className="mb-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-indigo-50/60 p-3.5 shadow-xs">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <TrendingUp size={15} strokeWidth={2.5} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Catatan Kas Sistem
                </h4>
                {shiftSummaryLoading && (
                  <span className="text-[10px] text-blue-600 font-semibold animate-pulse">
                    Sinkronisasi...
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Selama shift ini berlangsung, kas sistem telah bertambah sebesar{" "}
                <strong className="text-emerald-700 font-bold">
                  +{formatRupiah(effectiveCashSales)}
                </strong>{" "}
                dari transaksi tunai berhasil.
              </p>

              {/* Kotak Highlight Total Kas Sistem */}
              <div className="mt-2.5 flex items-center justify-between rounded-xl bg-white/95 px-3 py-2 border border-blue-200/70 shadow-2xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Kas Sistem yang Diharapkan
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    (Modal Awal + Tambahan Tunai)
                  </p>
                </div>
                <span className="font-mono text-base font-black text-blue-700 tabular-nums">
                  {formatRupiah(effectiveExpectedEndCash)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rincian Finansial Sesi Shift */}
        <dl className="mb-4 space-y-2 rounded-2xl bg-slate-50 p-3 text-xs ring-1 ring-slate-200/80">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500 font-medium">Modal Awal Kasir</dt>
            <dd className="font-bold tabular-nums text-slate-800">
              {formatRupiah(activeShift.startCash)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500 font-medium">Pemasukan Kas Tunai Berjalan</dt>
            <dd className="font-bold tabular-nums text-emerald-600">
              +{formatRupiah(effectiveCashSales)}
            </dd>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
            <dt className="text-slate-700 font-bold">Target Total Kas di Laci</dt>
            <dd className="font-bold tabular-nums text-slate-900">
              {formatRupiah(effectiveExpectedEndCash)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-400 font-medium text-[11px]">Waktu Sesi Dimulai</dt>
            <dd className="font-semibold tabular-nums text-slate-600 text-[11px]">
              {formatClock(new Date(activeShift.startTime))} WIB
            </dd>
          </div>
        </dl>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <CashField
              autoFocus
              type="number"
              inputMode="numeric"
              label="Total Uang Fisik Aktual di Laci (Rp)"
              placeholder="Nominal hasil hitungan fisik laci kasir"
              icon={CheckCircle2}
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              required
            />

            {/* Tombol Shortcut untuk Mengisi Nominal Sesuai Total Sistem */}
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActualCash(String(effectiveExpectedEndCash))}
                className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
              >
                <Sparkles size={13} />
                <span>Isi sesuai total sistem ({formatRupiah(effectiveExpectedEndCash)})</span>
              </button>
            </div>

            {/* Indikator Selisih Kas Real-Time */}
            {hasEnteredCash && (
              <div
                className={`mt-2 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium border transition-all animate-in fade-in duration-150 ${
                  cashDifference === 0
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : cashDifference < 0
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {cashDifference === 0 ? (
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  ) : cashDifference < 0 ? (
                    <AlertTriangle size={15} className="text-red-600 shrink-0" />
                  ) : (
                    <Info size={15} className="text-amber-600 shrink-0" />
                  )}
                  <span>
                    {cashDifference === 0
                      ? "Uang laci pas (tidak ada selisih)"
                      : cashDifference < 0
                      ? "Selisih Kurang (Defisit)"
                      : "Selisih Lebih (Surplus)"}
                  </span>
                </div>
                <span className="font-mono font-bold tabular-nums">
                  {cashDifference === 0
                    ? "Rp 0"
                    : `${cashDifference > 0 ? "+" : ""}${formatRupiah(cashDifference)}`}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={isSubmitting}
              className="h-11 flex-1 rounded-xl text-xs font-bold"
            >
              Akhiri Shift
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
