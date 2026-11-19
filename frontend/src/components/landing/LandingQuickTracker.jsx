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
import { formatRupiah, formatDate } from "../../utils/formatters";

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
          label: "SIAP DIAMBIL DI LOKET",
          variant: "emerald",
          icon: BadgeCheck,
        };
      case "PROCESSING":
        return {
          label: "SEDANG DICETAK KASIR",
          variant: "sky",
          icon: Clock,
        };
      case "PENDING":
        return {
          label: "DALAM ANTREAN DIGITAL",
          variant: "amber",
          icon: Clock,
        };
      case "COMPLETED":
        return {
          label: "SELESAI / SUDAH DIAMBIL",
          variant: "dark",
          icon: CheckCircle2,
        };
      case "CANCELLED":
        return {
          label: "DIBATALKAN",
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
    <section id="lacak" className="py-20 md:py-28 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div>
            <Badge variant="sky" icon={Search}>
              Lacak Status Cepat
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Cek Status Tiket Cetak Tanpa Login
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
            Sudah mengunggah tugas di portal? Masukkan nomor tiket Anda untuk melihat
            apakah dokumen sudah selesai dicetak oleh petugas kasir.
          </p>
        </div>

        {/* Input Box */}
        <form
          onSubmit={handleTrack}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="w-full flex-1">
            <Input
              variant="dark"
              icon={Search}
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Masukkan Nomor Tiket (Contoh: PRN-2026-0842)"
              className="font-mono"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={Printer}
            disabled={!ticketInput.trim()}
            className="w-full sm:w-auto shadow-lg shadow-primary/25 shrink-0 min-h-[46px]"
          >
            <span>Cek Status</span>
          </Button>
        </form>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Result Card */}
        {trackResult && (
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/20 text-sky">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    {trackResult.fileName}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    No. Tiket: {trackResult.orderNumber}
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              {(() => {
                const badge = getStatusBadge(trackResult.status);
                return (
                  <Badge variant={badge.variant} icon={badge.icon} className="px-3.5 py-1.5 text-xs font-bold">
                    {badge.label}
                  </Badge>
                );
              })()}
            </div>

            {/* Spec Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] mb-0.5">
                  Jumlah Lembar:
                </span>
                <span className="font-bold text-white text-sm">
                  {trackResult.pageCount} Halaman
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] mb-0.5">
                  Format Warna:
                </span>
                <span className="font-bold text-white text-sm">
                  {trackResult.colorType === "COLOR" ? "Warna" : "Hitam-Putih"}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] mb-0.5">
                  Kertas & Jilid:
                </span>
                <span className="font-bold text-white text-sm truncate block">
                  {trackResult.paperSize} • {trackResult.finishing || "Tanpa Jilid"}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] mb-0.5">
                  Total Biaya:
                </span>
                <span className="font-bold text-accent text-sm">
                  {formatRupiah(trackResult.totalPrice)}
                </span>
              </div>
            </div>

            {/* Direction Instruction */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5">
              <MapPin size={18} className="shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-300">
                  {trackResult.status === "READY"
                    ? "Dokumen Anda sudah selesai dicetak!"
                    : "Pesanan terdaftar di sistem antrean kasir."}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Tunjukkan nomor tiket ini ke petugas kasir di Business Center Lantai 1 SMK Yadika 6 saat mengambil dokumen.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
