import { useState } from "react";
import { CheckCircle2, Copy, Check, FileText } from "lucide-react";
import { formatRupiah } from "../../utils/formatters";
import { parsePrintSpecs } from "../../utils/printSpecs";

export default function PrintSuccessTicket({ order }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!order?.orderNumber) return;
    navigator.clipboard.writeText(order.orderNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const { totalPages, isColor, paperSize, copies } = parsePrintSpecs(order);

  return (
    <div className="bg-success/10 border border-success/30 rounded-2xl p-4 text-emerald-950 shadow-sm space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-success text-white rounded-xl shadow-xs">
          <CheckCircle2 size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-success">
            Order Cetak Berhasil Dibuat
          </h3>
          <p className="text-xs text-emerald-900 mt-0.5">
            Tunjukkan Nomor Order ini ke kasir YasixMerch saat pengambilan
            dokumen:
          </p>
        </div>
      </div>

      {/* Detail Nomor Order PO */}
      <div className="bg-white p-3 rounded-xl border border-success/30 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Nomor Order
          </span>
          <span className="text-base font-mono font-black text-slate-800">
            {order?.orderNumber}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success/15 text-success text-xs font-bold hover:bg-success/25 transition-colors"
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
          <span>{isCopied ? "Tersalin" : "Salin"}</span>
        </button>
      </div>

      {/* Rincian Singkat File & Biaya */}
      <div className="bg-success/10 rounded-xl p-2.5 text-xs space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-600 flex items-center gap-1 truncate max-w-[180px]">
            <FileText size={13} className="shrink-0 text-success" />
            {order?.fileName || "Dokumen Cetak"}
          </span>
          <div className="text-xs text-right space-y-0.5 shrink-0">
            <span className="font-bold text-slate-800 block">
              {totalPages} Halaman ({paperSize})
            </span>
            <span className="text-slate-600 block text-[11px]">
              {isColor ? "Warna" : "Hitam Putih"} • {copies} Rangkap
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-success/20">
          <span className="text-slate-600">Total Tagihan Kasir:</span>
          <span className="font-extrabold text-sm text-success">
            {formatRupiah(order?.totalPrice || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
