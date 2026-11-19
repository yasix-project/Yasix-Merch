import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calculator,
  Printer,
  Info,
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

  // Tarif resmi Yasix
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
      className="py-16 md:py-24 bg-slate-950 text-white border-b border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Kalkulator Estimasi Biaya Cetak
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Hitung perkiraan biaya pencetakan dokumen tugas atau modul sebelum mengunggah file asli ke portal siswa.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sisi Kiri: Form Opsi Perhitungan */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
            {/* Opsi 1: Jumlah Halaman */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="page-count-input"
                  className="text-xs font-semibold text-slate-300 uppercase tracking-wide"
                >
                  Jumlah Halaman Dokumen:
                </label>
                <span className="text-sm font-bold text-sky">
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
                  className="w-20 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-center font-bold text-sm text-white focus:outline-none focus:border-primary"
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
                    className={`px-2.5 py-1 text-[11px] rounded font-semibold border transition-colors ${
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
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2.5">
                Jenis Cetak:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setColorType("BW")}
                  className={`p-3.5 rounded-xl border text-left transition-colors ${
                    colorType === "BW"
                      ? "bg-primary/10 border-primary text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <p className="font-bold text-xs text-white">Hitam - Putih (B/W)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Rp 500 / halaman</p>
                </button>

                <button
                  type="button"
                  onClick={() => setColorType("COLOR")}
                  className={`p-3.5 rounded-xl border text-left transition-colors ${
                    colorType === "COLOR"
                      ? "bg-amber-500/10 border-amber-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
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
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                  Ukuran Kertas:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperSize("A4")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors ${
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
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors ${
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
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                  Jumlah Rangkap (Copies):
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCopies(c)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-colors ${
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
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2.5">
                Finishing / Penjilidan:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(PRICE_RATES.FINISHING).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFinishing(key)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      finishing === key
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
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
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator size={16} className="text-accent" />
                <h3 className="font-bold text-sm text-white">
                  Rincian Estimasi Biaya
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Tarif Resmi
              </span>
            </div>

            {/* Breakdown item */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>
                  Cetak {calculation.validPages} Hal x {calculation.validCopies} Rangkap (
                  {colorType === "COLOR" ? "Warna" : "B/W"} • {paperSize})
                </span>
                <span className="font-semibold text-white font-mono">
                  {formatRupiah(calculation.printSubtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>
                  Finishing ({PRICE_RATES.FINISHING[finishing]?.label || "-"})
                </span>
                <span className="font-semibold text-white font-mono">
                  {formatRupiah(calculation.finishingCost)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">
                    Total Estimasi:
                  </span>
                  <span className="text-2xl font-bold text-accent font-mono">
                    {formatRupiah(calculation.grandTotal)}
                  </span>
                </div>
                {calculation.earnedPoints > 0 && (
                  <Badge variant="success" className="text-xs font-mono">
                    +{calculation.earnedPoints} Poin
                  </Badge>
                )}
              </div>
            </div>

            {/* Note alert without Sparkles */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs flex items-start gap-2.5">
              <Info size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Dokumen PDF yang diunggah ke portal siswa akan diverifikasi jumlah halamannya
                secara otomatis oleh server sebelum dicetak oleh petugas kasir.
              </p>
            </div>

            {/* Action CTA */}
            <div>
              <Button
                as={Link}
                to={user ? "/siswa/print" : "/login"}
                size="md"
                variant="primary"
                leftIcon={Printer}
                className="w-full"
              >
                <span>
                  {user
                    ? "Unggah Dokumen di Portal Siswa"
                    : "Masuk untuk Cetak Dokumen"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
