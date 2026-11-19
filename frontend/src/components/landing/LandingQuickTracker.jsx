import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  Printer,
  AlertCircle,
  FileText,
  BadgeCheck,
  MapPin,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import { printService } from "../../api/printService";
import { formatRupiah } from "../../utils/formatters";

export default function LandingQuickTracker() {
  const [ticketInput, setTicketInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trackResult, setTrackResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!ticketInput.trim()) return;

    setIsLoading(true);
    setErrorMessage("");
    setTrackResult(null);

    try {
      const res = await printService.trackOrder(ticketInput.trim());
      setTrackResult(res.data?.data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Nomor tiket tidak ditemukan. Pastikan Anda memasukkan kode tiket dengan benar.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "READY":
        return {
          label: "Siap Diambil di Loket",
          variant: "success",
          icon: BadgeCheck,
        };
      case "PROCESSING":
        return {
          label: "Sedang Dicetak Petugas",
          variant: "sky",
          icon: Clock,
        };
      case "PENDING":
        return {
          label: "Dalam Antrean Kasir",
          variant: "warning",
          icon: Clock,
        };
      case "COMPLETED":
        return {
          label: "Sudah Diambil / Selesai",
          variant: "dark",
          icon: CheckCircle2,
        };
      case "CANCELLED":
        return {
          label: "Dibatalkan",
          variant: "danger",
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          variant: "dark",
          icon: Clock,
        };
    }
  };

  return (
    <section id="lacak" className="py-16 md:py-24 bg-slate-950 text-white border-b border-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header without decorative eyebrow */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Cek Status Tiket Cetak
          </h2>
          <p className="text-slate-300 text-sm mt-2 max-w-lg mx-auto">
            Masukkan nomor tiket pesanan cetak Anda untuk mengetahui status proses di loket kasir.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleTrack}
          className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="w-full flex-1">
            <Input
              variant="dark"
              icon={Search}
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Contoh: PRN-2026-0842"
              className="font-mono text-sm"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={Printer}
            disabled={!ticketInput.trim()}
            className="w-full sm:w-auto shrink-0 min-h-[44px]"
          >
            <span>Cek Status</span>
          </Button>
        </form>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Result Card */}
        {trackResult && (
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
            {/* Header Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {trackResult.fileName}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Tiket: {trackResult.orderNumber}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {(() => {
                const badge = getStatusBadge(trackResult.status);
                return (
                  <Badge variant={badge.variant} icon={badge.icon} className="px-3 py-1 text-xs">
                    {badge.label}
                  </Badge>
                );
              })()}
            </div>

            {/* Spec Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Halaman:</span>
                <span className="font-bold text-white text-sm font-mono">
                  {trackResult.pageCount} Hal
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Warna:</span>
                <span className="font-bold text-white text-sm">
                  {trackResult.colorType === "COLOR" ? "Berwarna" : "Hitam-Putih"}
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Kertas:</span>
                <span className="font-bold text-white text-sm truncate block">
                  {trackResult.paperSize} ({trackResult.finishing || "Tanpa Jilid"})
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Biaya:</span>
                <span className="font-bold text-accent text-sm font-mono">
                  {formatRupiah(trackResult.totalPrice)}
                </span>
              </div>
            </div>

            {/* Direction Instruction */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <MapPin size={16} className="shrink-0 text-primary mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Tunjukkan nomor tiket ini ke petugas loket kasir Business Center (Lantai 1) saat mengambil dokumen.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
