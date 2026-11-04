import { QRCodeSVG } from "qrcode.react";
import { Sparkles, ShieldCheck, School } from "lucide-react";

export default function StudentIdCard({ user }) {
  const nis = user?.nis || "YASX-000000";
  const name = user?.name || "Nama Siswa";
  const points = user?.points ?? 0;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-5 border border-slate-700/50">
      {/* Background Decorative Pattern */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Kartu */}
      <div className="flex items-start justify-between relative z-10 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <School size={18} />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wider uppercase text-blue-200">
              BC Yasix Member Card
            </h3>
            <p className="text-[10px] text-slate-400">
              SMK Yadika 6 Digital Identity
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <ShieldCheck size={12} />
          Aktif
        </span>
      </div>

      {/* Bagian Tengah: Data Siswa & QR Code */}
      <div className="flex items-center justify-between gap-4 relative z-10">
        {/* Detail Siswa */}
        <div className="space-y-2 flex-1 min-w-0">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Nama Lengkap
            </span>
            <h2 className="text-sm font-extrabold text-white truncate drop-shadow-xs">
              {name}
            </h2>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Nomor Induk Siswa (NIS)
            </span>
            <p className="text-xs font-mono font-bold text-blue-300 tracking-wider">
              {nis}
            </p>
          </div>

          {/* Saldo Poin */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span className="text-xs font-black">{points}</span>
            <span className="text-[10px] text-amber-200/80">Yasix Points</span>
          </div>
        </div>

        {/* QR Code Scannable */}
        <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-white/20 shrink-0 flex flex-col items-center">
          <QRCodeSVG value={nis} size={88} level="H" includeMargin={false} />
          <span className="text-[8px] font-mono font-bold text-slate-600 mt-1">
            SCAN DI KASIR
          </span>
        </div>
      </div>

      {/* Footer Kartu */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400 relative z-10">
        <span>
          Tunjukkan kartu ini saat checkout untuk klaim poin & voucher.
        </span>
      </div>
    </div>
  );
}
