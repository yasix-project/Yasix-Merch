import { Camera, QrCode, RefreshCw } from "lucide-react";
import Button from "../ui/Button";

export default function PreOrderHeaderActions({
  onOpenScanner,
  onRefresh,
  isFetching = false,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
      {/* Tombol Buka Scanner Barcode / QR Order Siswa */}
      <Button
        size="sm"
        variant="primary"
        onClick={onOpenScanner}
        className="text-xs font-bold gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30 active:scale-95 text-white"
        title="Scan Barcode / QR Code Pesanan Siswa [F9]"
      >
        <Camera size={15} />
        <span>Scan Barcode Order</span>
        <kbd className="hidden sm:inline text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold">
          F9
        </kbd>
      </Button>

      {/* Tombol Demo Barcode HP */}
      <a
        href="/demo"
        target="_blank"
        rel="noopener noreferrer"
        title="Buka Lembar Barcode Produk, Siswa & Orderan di HP (/demo)"
        className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all shrink-0 active:scale-95 shadow-2xs"
      >
        <QrCode size={14} className="text-emerald-600" />
        <span>📱 Barcode HP (/demo)</span>
      </a>

      {/* Tombol Sinkronisasi / Refresh */}
      <Button
        size="sm"
        variant="outline"
        onClick={onRefresh}
        disabled={isFetching}
        className="text-xs font-bold gap-1.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50"
      >
        <RefreshCw
          size={13}
          className={isFetching ? "animate-spin text-blue-600" : ""}
        />
        <span className="hidden sm:inline">Segarkan</span>
      </Button>
    </div>
  );
}
