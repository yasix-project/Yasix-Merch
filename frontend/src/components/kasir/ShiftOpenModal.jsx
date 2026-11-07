import { Wallet, Lock, LogOut } from "lucide-react";
import Button from "../ui/Button";

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

export default function ShiftOpenModal({
  isOpen = true,
  userName = "Kasir",
  startCash,
  setStartCash,
  isSubmitting = false,
  onSubmit,
  onLogout,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md overflow-y-auto">
      <div className="animate-in zoom-in-95 my-auto w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80 relative">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
          <Lock size={24} strokeWidth={2} />
        </div>

        <h2 className="mb-1 text-center text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Buka Shift Kasir
        </h2>

        {/* Status Akun yang Sedang Login */}
        <div className="flex items-center justify-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-slate-100/90 text-slate-600 text-xs font-medium w-fit mx-auto border border-slate-200/60">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Login sebagai:{" "}
            <strong className="text-slate-900 font-bold">{userName}</strong>
          </span>
        </div>

        <p className="mx-auto mb-5 max-w-[320px] text-center text-xs leading-relaxed text-slate-500">
          Masukkan modal awal berupa uang kecil di laci kasir sebelum memulai
          sesi transaksi.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <CashField
            autoFocus
            type="number"
            inputMode="numeric"
            label="Modal Awal Kasir (Rp)"
            placeholder="Contoh: 150000"
            icon={Wallet}
            value={startCash}
            onChange={(e) => setStartCash(e.target.value)}
            required
          />

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="mt-2 h-12 w-full rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30"
          >
            Buka Shift Sekarang
          </Button>

          {/* Tombol Logout di Bawah Form */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition border border-slate-200/80 hover:border-red-200 active:scale-[0.98]"
            >
              <LogOut size={15} />
              <span>Keluar / Ganti Akun Kasir</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
