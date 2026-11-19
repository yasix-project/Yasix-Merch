import {
  Printer,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  FileText,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

export default function LandingHero() {
  return (
    <section
      id="beranda"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-slate-950 text-white"
    >
      {/* Decorative ambient gradient glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/20 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-10 w-[350px] h-[300px] bg-accent/15 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Sisi Kiri: Headline & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Badge GTNIC & Status */}
            <div>
              <Badge variant="sky" icon={Award} className="px-3.5 py-1.5 text-xs font-semibold">
                Inovasi Unit Produksi Sekolah • GTNIC 2026
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              Pusat Bisnis & Percetakan{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300">
                Digital Mandiri
              </span>{" "}
              SMK Yadika 6
            </h1>

            {/* Sub-headline */}
            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Solusi pintar transaksi kasir ritel, perlengkapan seragam sekolah, ATK,
              serta layanan antrean cetak dokumen mandiri bebas colok flashdisk & anti-antre.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                as="a"
                href="#kalkulator"
                size="lg"
                variant="primary"
                leftIcon={Printer}
                rightIcon={ArrowRight}
                className="w-full sm:w-auto shadow-xl shadow-primary/30"
              >
                <span>Simulasi & Cetak Mandiri</span>
              </Button>

              <Button
                as="a"
                href="#produk"
                size="lg"
                variant="dark"
                leftIcon={ShoppingBag}
                className="w-full sm:w-auto"
              >
                <span>Lihat Etalase Produk</span>
              </Button>
            </div>

            {/* Quick Benefits Bullet Points */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-900/70 border border-slate-800/80 px-3 py-2.5 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Kalkulasi Otomatis (pdf-lib)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-900/70 border border-slate-800/80 px-3 py-2.5 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Scan Barcode via Webcam</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-900/70 border border-slate-800/80 px-3 py-2.5 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Reward Poin Siswa & Struk</span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Interactive Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-primary/10 overflow-hidden">
              {/* Header Box */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300 tracking-wide">
                    SISTEM KASIR & ANTREAN AKTIF
                  </span>
                </div>
                <Badge variant="sky" className="text-[11px] font-mono">
                  LOKET BC YASIX
                </Badge>
              </div>

              {/* Sample Document Print Ticket */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/20 text-sky">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Laporan_Tugas_Akhir.pdf
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        No. Tiket: #PRN-2026-0842
                      </p>
                    </div>
                  </div>
                  <Badge variant="emerald" className="text-[10px] font-bold">
                    SIAP DIAMBIL
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Spesifikasi:</span>
                    <span className="font-semibold text-white">14 Lembar • A4 • Warna</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Finishing:</span>
                    <span className="font-semibold text-white">Jilid Spiral Mika</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                  <span className="text-slate-400">Total Tarif:</span>
                  <span className="text-base font-extrabold text-accent">
                    Rp 17.500
                  </span>
                </div>
              </div>

              {/* Sample Student Loyalty Reward Point */}
              <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Kartu Pelajar & Loyalty Point
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Otomatis bertambah setiap transaksi di konter
                    </p>
                  </div>
                </div>
                <Badge variant="amber" className="text-xs font-mono font-bold">
                  +1 Poin / 10k
                </Badge>
              </div>

              {/* Footer Indicator */}
              <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-sky" /> Jam Istirahat 1 & 2
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" /> Audit Shift Aman
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
