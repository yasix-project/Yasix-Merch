import { Loader2 } from "lucide-react";
import { formatRupiah } from "../../utils/formatters";

export default function PrintCostSummary({ estimate, isEstimating }) {
  // Ambil specs/config/options/details jika kembalian berupa objek konfigurasi cetak
  const specs =
    (typeof estimate?.specs === "object" && estimate?.specs) ||
    (typeof estimate?.config === "object" && estimate?.config) ||
    (typeof estimate?.options === "object" && estimate?.options) ||
    (typeof estimate?.details === "object" && estimate?.details) ||
    (typeof estimate?.totalPages === "object" && estimate?.totalPages) ||
    (typeof estimate?.pageCount === "object" && estimate?.pageCount) ||
    null;

  const rawPages =
    specs?.totalPages ??
    (typeof estimate?.totalPages === "number" || typeof estimate?.totalPages === "string"
      ? estimate.totalPages
      : estimate?.pages ?? estimate?.pageCount ?? 0);

  const totalPages =
    typeof rawPages === "object" && rawPages !== null
      ? rawPages.totalPages || 1
      : Number(rawPages) || 0;

  const isColor =
    specs?.isColor ??
    estimate?.isColor ??
    (estimate?.colorType === "COLOR");

  const paperSize =
    specs?.paperSize ||
    estimate?.paperSize ||
    "A4";

  const copies = specs?.copies || estimate?.copies || 1;

  const pricePerPage =
    estimate?.pricePerPage ?? (isColor ? 1000 : 500);

  const totalPrice =
    estimate?.totalPrice ?? totalPages * pricePerPage * copies;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2.5 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
          Estimasi Biaya Cetak
        </span>
        {isEstimating && (
          <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 animate-pulse">
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
            <span className="text-xl font-black text-blue-400 tracking-tight">
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
