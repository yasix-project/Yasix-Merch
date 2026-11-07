import { Keyboard } from "lucide-react";

export default function PosKeyboardShortcuts() {
  return (
    <div className="hidden sm:flex px-4 py-2 bg-white border-t border-slate-200/80 items-center justify-between text-[11px] text-slate-500 shrink-0 shadow-2xs">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-0.5">
        <span className="flex items-center gap-1 font-bold text-slate-700">
          <Keyboard size={13} className="text-slate-400" /> Kasir Cepat:
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
            F2
          </kbd>
          <span>Cari</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
            F4
          </kbd>
          <span>Bayar</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
            F9
          </kbd>
          <span>Scan Barcode</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
            Esc
          </kbd>
          <span>Tutup Modal</span>
        </span>
      </div>
      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hidden md:inline">
        ● Retail POS Aktif
      </span>
    </div>
  );
}
