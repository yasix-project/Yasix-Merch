import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calculator,
  Printer,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { formatRupiah } from "../../utils/formatters";
import { useAuthStore } from "../../store/authStore";

export default function LandingPrintEstimator() {
  const [pageCount, setPageCount] = useState(10);
  const [colorType, setColorType] = useState("BW"); // "BW" | "COLOR"
  const [paperSize, setPaperSize] = useState("A4"); // "A4" | "F4"
  const [copies, setCopies] = useState(1);
  const [finishing, setFinishing] = useState("NONE"); // "NONE" | "KLIP" | "LAKBAN" | "SPIRAL"

  const user = useAuthStore((state) => state.user);

  // Tarif standar Yasix
  const PRICE_RATES = {
    BW: 500, // Rp 500 per halaman
    COLOR: 1500, // Rp 1.500 per halaman
    F4_SURCHARGE: 200, // Tambahan Rp 200 per lembar untuk F4
    FINISHING: {
      NONE: { label: "Tanpa Jilid (Stapler Biasa)", price: 0 },
      KLIP: { label: "Klip Penjepit (Paper Clip)", price: 500 },
      LAKBAN: { label: "Jilid Lakban Hitam + Mika", price: 3000 },
      SPIRAL: { label: "Jilid Spiral Kawat + Mika", price: 5000 },
    },
  };

  const calculation = useMemo(() => {
    const validPages = Math.max(1, parseInt(pageCount) || 1);
    const validCopies = Math.max(1, parseInt(copies) || 1);

    const basePageRate =
      colorType === "COLOR" ? PRICE_RATES.COLOR : PRICE_RATES.BW;
    const paperSurcharge = paperSize === "F4" ? PRICE_RATES.F4_SURCHARGE : 0;
    const perPageCost = basePageRate + paperSurcharge;

    const printSubtotal = perPageCost * validPages * validCopies;
    const finishingCost =
      (PRICE_RATES.FINISHING[finishing]?.price || 0) * validCopies;

    const grandTotal = printSubtotal + finishingCost;
    const earnedPoints = Math.floor(grandTotal / 10000);

    return {
      validPages,
      validCopies,
      perPageCost,
      printSubtotal,
      finishingCost,
      grandTotal,
      earnedPoints,
    };
  }, [pageCount, colorType, paperSize, copies, finishing]);

  return (
    <section
      id="kalkulator"
      className="py-20 md:py-28 bg-slate-950 text-white relative border-t border-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div>
            <Badge variant="amber" icon={Calculator}>
              Transparansi Tarif & Simulasi Cepat
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Kalkulator Simulasi Biaya Cetak
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Hitung perkiraan biaya cetak tugas atau laporan Anda sebelum memesan di konter kasir.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sisi Kiri: Form Opsi Perhitungan */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            {/* Opsi 1: Jumlah Halaman */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="page-count-input"
                  className="text-xs font-bold text-slate-300 uppercase tracking-wider"
                >
                  Jumlah Halaman PDF / Dokumen:
                </label>
                <span className="text-sm font-extrabold text-sky">
                  {calculation.validPages} Halaman
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="page-count-input"
                  type="range"
                  min="1"
                  max="100"
                  value={pageCount}
                  onChange={(e) => setPageCount(parseInt(e.target.value) || 1)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  aria-label="Slider jumlah halaman"
                />
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={pageCount}
                  onChange={(e) =>
                    setPageCount(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-20 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center font-bold text-sm text-white focus:outline-none focus:border-primary"
                  aria-label="Input angka jumlah halaman"
                />
              </div>
              {/* Quick page buttons */}
              <div className="flex items-center gap-2 mt-2.5">
                {[5, 10, 20, 35, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPageCount(num)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold border transition-all ${
                      pageCount === num
                        ? "bg-primary text-white border-primary"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {num} Hal
                  </button>
                ))}
              </div>
            </div>

            {/* Opsi 2: Tinta & Warna */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                Pilihan Jenis Cetak:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setColorType("BW")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    colorType === "BW"
                      ? "bg-primary/20 border-primary text-white shadow-md shadow-primary/20"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <p className="font-bold text-xs text-white">Hitam - Putih (B/W)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Rp 500 / halaman</p>
                </button>

                <button
                  type="button"
                  onClick={() => setColorType("COLOR")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    colorType === "COLOR"
                      ? "bg-accent/20 border-accent text-white shadow-md shadow-accent/20"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <p className="font-bold text-xs text-white">Berwarna (Color)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Rp 1.500 / halaman</p>
                </button>
              </div>
            </div>

            {/* Opsi 3: Ukuran Kertas & Rangkap */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Ukuran Kertas:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperSize("A4")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      paperSize === "A4"
                        ? "bg-slate-800 border-sky text-sky"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    A4 (Standar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperSize("F4")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      paperSize === "F4"
                        ? "bg-slate-800 border-sky text-sky"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    F4 (+Rp 200)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Jumlah Rangkap (Copies):
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCopies(c)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        copies === c
                          ? "bg-primary text-white border-primary"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      {c}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Opsi 4: Finishing / Jilid */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                Finishing / Penjilidan:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(PRICE_RATES.FINISHING).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFinishing(key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      finishing === key
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{item.label}</p>
                    <p className="text-[11px] text-slate-400">
                      {item.price === 0 ? "Gratis" : `+ ${formatRupiah(item.price)}`}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Rincian & Summary Card */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent/20 text-accent">
                  <Calculator size={18} />
                </div>
                <h3 className="font-extrabold text-sm text-white">
                  Rincian Estimasi Biaya
                </h3>
              </div>
              <Badge variant="dark" className="text-[10px] font-mono uppercase">
                Tarif Resmi BC
              </Badge>
            </div>

            {/* Breakdown item */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>
                  Cetak {calculation.validPages} Hal x {calculation.validCopies} Rangkap (
                  {colorType === "COLOR" ? "Warna" : "B/W"} • {paperSize})
                </span>
                <span className="font-semibold text-white">
                  {formatRupiah(calculation.printSubtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>
                  Finishing ({PRICE_RATES.FINISHING[finishing]?.label || "-"})
                </span>
                <span className="font-semibold text-white">
                  {formatRupiah(calculation.finishingCost)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-normal">
                    Total Estimasi:
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-accent">
                    {formatRupiah(calculation.grandTotal)}
                  </span>
                </div>
                {calculation.earnedPoints > 0 && (
                  <Badge variant="emerald" className="text-xs font-bold">
                    +{calculation.earnedPoints} Poin Siswa
                  </Badge>
                )}
              </div>
            </div>

            {/* Note alert */}
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-sky text-xs flex items-start gap-2.5">
              <Sparkles size={16} className="text-accent shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Untuk mencetak dokumen asli, silakan masuk ke portal siswa. Server akan
                membaca jumlah halaman dokumen PDF Anda secara otomatis dan akurat.
              </p>
            </div>

            {/* Action CTA */}
            <div>
              <Button
                as={Link}
                to={user ? "/siswa/print" : "/login"}
                size="lg"
                variant="primary"
                leftIcon={Printer}
                rightIcon={ArrowRight}
                className="w-full shadow-lg shadow-primary/30"
              >
                <span>
                  {user
                    ? "Buka Menu Unggah PDF Siswa"
                    : "Masuk Akun untuk Cetak PDF"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
