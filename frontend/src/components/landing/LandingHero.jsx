import {
  Printer,
  ShoppingBag,
  ShieldCheck,
  Clock,
  CheckCircle2,
  FileText,
  Coins,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

export default function LandingHero() {
  return (
    <section
      id="beranda"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-slate-950 text-white border-b border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Sisi Kiri: Headline & Deskripsi Nyata */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Pusat Bisnis & Layanan Cetak Mandiri{" "}
              <span className="text-accent">SMK Yadika 6</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Unit produksi resmi SMK Yadika 6 untuk belanja perlengkapan seragam kejuruan,
              alat tulis kantor (ATK), dan antrean cetak dokumen mandiri berbasis digital
              tanpa perlu menitipkan flashdisk ke meja kasir.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Button
                as="a"
                href="#kalkulator"
                size="md"
                variant="primary"
                leftIcon={Printer}
                className="w-full sm:w-auto"
              >
                <span>Hitung Biaya & Cetak</span>
              </Button>

              <Button
                as="a"
                href="#produk"
                size="md"
                variant="dark"
                leftIcon={ShoppingBag}
                className="w-full sm:w-auto"
              >
                <span>Katalog Seragam & ATK</span>
              </Button>
            </div>

            {/* Kepastian Layanan */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-2.5 rounded-lg">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Hitung Otomatis Lembar PDF</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-2.5 rounded-lg">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Pindai Barcode via Webcam</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-2.5 rounded-lg">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Poin Pelajar & Struk Kasir</span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Kartu Representasi Nyata Sistem */}
          <div className="lg:col-span-5">
            <div className="mx-auto max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              {/* Header Box */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-300">
                  Antrean Digital Unit Produksi
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Konter Lantai 1
                </span>
              </div>

              {/* Sample Document Print Ticket */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        Laporan_Praktik_Kejuruan.pdf
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Tiket: PRN-2026-0842
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px] shrink-0">
                    Siap Diambil
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Spesifikasi:</span>
                    <span className="font-medium text-white">14 Lembar • A4 • Warna</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Finishing:</span>
                    <span className="font-medium text-white">Jilid Spiral Mika</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Total Biaya:</span>
                  <span className="text-sm font-bold text-accent font-mono">
                    Rp 17.500
                  </span>
                </div>
              </div>

              {/* Loyalty Reward Info */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                    <Coins size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Poin Kartu Pelajar
                    </p>
                    <p className="text-[11px] text-slate-400">
                      +1 Poin per transaksi Rp 10.000
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  NIS Terverifikasi
                </span>
              </div>

              {/* Status Footer */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" /> Buka saat jam istirahat
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" /> Audit kasir tercatat
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
