import { Loader2 } from "lucide-react";
import { formatRupiah } from "../../utils/formatters";
import { parsePrintSpecs } from "../../utils/printSpecs";

export default function PrintCostSummary({ estimate, isEstimating }) {
  const { totalPages, isColor, paperSize, copies, pricePerPage, totalPrice } =
    parsePrintSpecs(estimate);

  return (
    <div className="bg-dark text-bright rounded-2xl p-4 space-y-2.5 shadow-md border border-cyan/20">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
          Estimasi Biaya Cetak
        </span>
        {isEstimating && (
          <span className="inline-flex items-center gap-1 text-[11px] text-cyan animate-pulse">
            <Loader2 size={12} className="animate-spin" /> Menghitung halaman...
          </span>
        )}
      </div>

      {estimate ? (
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Jumlah Halaman Dokumen:</span>
            <span className="font-bold text-white">
              {totalPages} Halaman ({paperSize})
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>
              Tarif ({isColor ? "Warna" : "Hitam Putih"} • {copies} Rangkap):
            </span>
            <span className="font-bold text-white">
              {formatRupiah(pricePerPage)} / hal
            </span>
          </div>
          <div className="border-t border-slate-700/80 pt-2 my-1 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300">
              Total Biaya:
            </span>
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
