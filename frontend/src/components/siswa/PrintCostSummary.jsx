import { Loader2, Sparkles, Check, Scissors } from "lucide-react";
import { formatRupiah } from "../../utils/formatters";
import { parsePrintSpecs } from "../../utils/printSpecs";

export default function PrintCostSummary({ estimate, isEstimating }) {
  const {
    totalPages,
    effectivePageCount,
    pageRangeText,
    skippedRangeText,
    skippedPages,
    isColor,
    paperSize,
    copies,
    pricePerPage,
    printCost,
    finishing,
    finishingCost,
    totalPrice,
  } = parsePrintSpecs(estimate);

  return (
    <div className="bg-dark text-bright rounded-2xl p-4 space-y-2.5 shadow-md border border-cyan/20">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
          <Sparkles size={12} className="text-cyan" />
          Rincian Estimasi Biaya
        </span>
        {isEstimating && (
          <span className="inline-flex items-center gap-1 text-[11px] text-cyan animate-pulse">
            <Loader2 size={12} className="animate-spin" /> Menghitung halaman...
          </span>
        )}
      </div>

      {estimate ? (
        <div className="space-y-2 text-xs">
          {/* Info Halaman File vs Halaman Cetak */}
          <div className="flex justify-between items-center text-slate-300">
            <span>Halaman yang Dicetak:</span>
            <div className="text-right">
              <span className="font-bold text-cyan">
                {effectivePageCount} dari {totalPages} Halaman ({paperSize})
              </span>
              <span className="block text-[10px] text-slate-400 font-mono">
                Hal: {pageRangeText}
              </span>
            </div>
          </div>

          {/* Jika ada halaman yang dilewati */}
          {skippedPages && skippedPages.length > 0 && (
            <div className="flex justify-between items-center text-rose-300 bg-rose-950/30 px-2.5 py-1 rounded-lg border border-rose-500/20 text-[11px]">
              <span className="flex items-center gap-1">
                <Scissors size={11} className="text-rose-400" />
                Halaman Dilewati (Hemat Biaya):
              </span>
              <span className="font-mono font-bold text-rose-300">
                Hal {skippedRangeText} ({skippedPages.length} hal)
              </span>
            </div>
          )}

          {/* Subtotal Cetak Kertas */}
          <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-700/60">
            <span>
              Biaya Cetak ({isColor ? "Warna" : "B/W"} • {copies} Rangkap):
            </span>
            <span className="font-medium text-white">
              {effectivePageCount} x {formatRupiah(pricePerPage)} x {copies} ={" "}
              <strong className="text-cyan">{formatRupiah(printCost)}</strong>
            </span>
          </div>

          {/* Biaya Jilid */}
          <div className="flex justify-between text-slate-300">
            <span>Finishing / Jilid:</span>
            <span className="font-medium text-white">
              {finishing || "Tanpa Jilid"}{" "}
              <strong className="text-cyan">
                ({finishingCost === 0 ? "Gratis" : formatRupiah(finishingCost)})
              </strong>
            </span>
          </div>

          {/* Total Keseluruhan */}
          <div className="border-t border-slate-700/80 pt-2.5 my-1 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-300 block">
                Total Biaya Cetak:
              </span>
              <span className="text-[10px] text-slate-400">
                Bayar di kasir saat dokumen siap
              </span>
            </div>
            <span className="text-xl font-black text-cyan tracking-tight">
              {formatRupiah(totalPrice)}
            </span>
          </div>
        </div>
      ) : !isEstimating ? (
        <p className="text-xs text-slate-400 italic">
          Unggah dokumen PDF untuk membaca jumlah halaman secara otomatis.
        </p>
      ) : null}
    </div>
  );
}
