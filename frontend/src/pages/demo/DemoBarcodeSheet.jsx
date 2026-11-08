// src/pages/demo/DemoBarcodeSheet.jsx
import { useState } from "react";
import {
  QrCode,
  Barcode as BarcodeIcon,
  Copy,
  Check,
  Smartphone,
  Award,
  Tag,
  ExternalLink,
  ChevronRight,
  SunMedium,
  Layers,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import BarcodeSVG from "../../components/shared/BarcodeSVG";
import YasixLogo from "../../components/ui/YasixLogo";
import { formatRupiah } from "../../utils/formatters";
import { showSuccessToast } from "../../utils/toast";

const DEMO_PRODUCTS = [
  {
    name: "Pensil 2B Faber-Castell",
    category: "Alat Tulis Kantor",
    barcode: "899123456701",
    price: 4000,
  },
  {
    name: "Buku Tulis Sidu 38 Lembar",
    category: "Alat Tulis Kantor",
    barcode: "899123456702",
    price: 4500,
  },
  {
    name: "Pulpen Standard AE7 0.5 Black",
    category: "Alat Tulis Kantor",
    barcode: "899886610001",
    price: 3000,
  },
  {
    name: "Dasi Formal SMK Yadika 6",
    category: "Seragam & Merchandise",
    barcode: "899770010001",
    price: 20000,
  },
  {
    name: "Kaos Kaki Putih Logo Yadika 6",
    category: "Seragam & Merchandise",
    barcode: "899770010002",
    price: 15000,
  },
  {
    name: "Tote Bag Kanvas Karya KIK DKV",
    category: "Produk Kreatif Siswa",
    barcode: "899550010001",
    price: 35000,
  },
  {
    name: "Le Minerale 600ml",
    category: "Snack & Minuman",
    barcode: "899600160018",
    price: 3500,
  },
  {
    name: "Teh Pucuk Harum 350ml",
    category: "Snack & Minuman",
    barcode: "899886670007",
    price: 4000,
  },
];

const DEMO_STUDENTS = [
  {
    name: "Budi Pratama",
    class: "XII RPL 1",
    nis: "20261001",
    qrCode: "MEMBER-20261001",
    points: 145,
  },
  {
    name: "Siti Nurhaliza",
    class: "XI DKV 1",
    nis: "20261003",
    qrCode: "MEMBER-20261003",
    points: 230,
  },
];

const DEMO_VOUCHERS = [
  {
    code: "GTNIC2026",
    discount: "10%",
    minPurchase: 30000,
    maxDiscount: 10000,
    desc: "Voucher Spesial Pengujian Juri GTNIC 2026",
  },
  {
    code: "YASIXHEMAT5",
    discount: "5%",
    minPurchase: 20000,
    maxDiscount: 5000,
    desc: "Diskon Belanja Rutin Siswa Yadika 6",
  },
];

const DEMO_ORDERS = [
  {
    invoiceNumber: "ORD-20261107-001",
    customer: "Budi Pratama (XII RPL 1)",
    items: "2x Buku Tulis Sidu, 1x Pensil 2B Faber-Castell",
    total: 13000,
  },
  {
    invoiceNumber: "ORD-20261107-002",
    customer: "Siti Nurhaliza (XI DKV 1)",
    items: "1x Tote Bag Kanvas Karya KIK DKV",
    total: 35000,
  },
];

export default function DemoBarcodeSheet() {
  const [copiedCode, setCopiedCode] = useState(null);
  const [displayMode, setDisplayMode] = useState("QR"); // "QR" | "1D" | "BOTH"

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showSuccessToast(`Disalin: ${code}`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* Header Halaman Pengujian */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <YasixLogo variant="icon" size={28} />
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              YasixMerch Barcode Sheet
            </h1>
            <p className="text-[10.5px] text-emerald-400 font-medium">
              Mode Pengujian Juri GTNIC 2026
            </p>
          </div>
        </div>

        <a
          href="/kasir/pos"
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm"
        >
          <span>Ke Kasir</span>
          <ChevronRight size={14} />
        </a>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Banner Petunjuk Penggunaan untuk Layar HP */}
        <div className="bg-gradient-to-r from-blue-900/40 via-blue-950/60 to-slate-900 border border-blue-500/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Smartphone size={16} />
            <span>Petunjuk Pengujian Juri Online</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Buka halaman ini di HP Anda. Karena kamera laptop memiliki resolusi
            berbeda-beda, gunakan format <strong>QR Code (Sangat Cepat)</strong>{" "}
            atau <strong>Barcode 1D (Garis)</strong> di bawah, lalu arahkan layar HP
            ke depan webcam laptop kasir.
          </p>
        </div>

        {/* ======================================================== */}
        {/* BAGIAN 1: PILIHAN FORMAT SCAN PRODUK                     */}
        {/* ======================================================== */}
        <section className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold">
                1
              </span>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Katalog Produk Kasir ({DEMO_PRODUCTS.length} Barang)
              </h2>
            </div>

            {/* Tab Pilihan Format Scan */}
            <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setDisplayMode("QR")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  displayMode === "QR"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                QR Code (Instan)
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("1D")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  displayMode === "1D"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Barcode 1D
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("BOTH")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  displayMode === "BOTH"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Keduanya
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {DEMO_PRODUCTS.map((p) => {
              const isCopied = copiedCode === p.barcode;
              return (
                <div
                  key={p.barcode}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex flex-col justify-between hover:border-slate-600 transition shadow-sm space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>{p.category}</span>
                      <span className="font-bold text-emerald-400">
                        {formatRupiah(p.price)}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-xs leading-snug">
                      {p.name}
                    </h3>
                  </div>

                  {/* Visual Barcode: QR Code / 1D Barcode / Keduanya */}
                  <div className="bg-white p-3 rounded-xl flex flex-col items-center justify-center shadow-inner overflow-hidden min-h-[140px]">
                    {displayMode === "QR" && (
                      <div className="flex flex-col items-center animate-in fade-in duration-200">
                        <QRCodeSVG
                          value={p.barcode}
                          size={110}
                          level="M"
                          includeMargin={false}
                        />
                        <span className="font-mono text-[10px] font-bold text-slate-800 mt-2 tracking-wider">
                          {p.barcode}
                        </span>
                      </div>
                    )}

                    {displayMode === "1D" && (
                      <div className="flex flex-col items-center animate-in fade-in duration-200 py-1">
                        <BarcodeSVG
                          value={p.barcode}
                          height={50}
                          barWidth={1.8}
                          showText={true}
                        />
                      </div>
                    )}

                    {displayMode === "BOTH" && (
                      <div className="flex flex-col items-center gap-3 w-full py-1 animate-in fade-in duration-200">
                        <QRCodeSVG
                          value={p.barcode}
                          size={90}
                          level="M"
                          includeMargin={false}
                        />
                        <BarcodeSVG
                          value={p.barcode}
                          height={38}
                          barWidth={1.4}
                          showText={true}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[10.5px] text-slate-400 font-semibold">
                      SKU: {p.barcode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(p.barcode)}
                      className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                        isCopied
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                      }`}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? "Tersalin" : "Salin"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* BAGIAN 2: KARTU PELAJAR & QR MEMBER SISWA                */}
        {/* ======================================================== */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                2
              </span>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Kartu Pelajar & QR Member Siswa
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Identitas Siswa</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {DEMO_STUDENTS.map((s) => {
              const isQrCopied = copiedCode === s.qrCode;
              const isNisCopied = copiedCode === s.nis;
              return (
                <div
                  key={s.nis}
                  className="bg-gradient-to-br from-slate-800 via-slate-800/90 to-blue-950/40 border border-blue-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                        KTA Member Digital
                      </span>
                      <h3 className="font-extrabold text-white text-sm">
                        {s.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">{s.class}</p>
                    </div>
                    <span className="bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-[10.5px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Award size={12} />
                      {s.points} Poin
                    </span>
                  </div>

                  {/* QR Code Member untuk Diarahkan ke Webcam */}
                  <div className="bg-white p-3 rounded-xl flex flex-col items-center justify-center shadow-inner">
                    <QRCodeSVG
                      value={s.qrCode}
                      size={110}
                      level="M"
                      includeMargin={false}
                    />
                    <span className="font-mono font-bold text-[10px] text-slate-800 mt-1.5 tracking-wider">
                      {s.qrCode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="text-[10.5px] text-slate-300 font-mono">
                      NIS: <strong className="text-white">{s.nis}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(s.nis)}
                        title="Salin NIS"
                        className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded-lg transition"
                      >
                        {isNisCopied ? "NIS Tersalin" : "Salin NIS"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(s.qrCode)}
                        title="Salin QR Code"
                        className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-lg transition font-bold"
                      >
                        {isQrCopied ? "QR Tersalin" : "Salin QR"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* BAGIAN 3: VOUCHER PROMO PENGUJIAN                        */}
        {/* ======================================================== */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold">
                3
              </span>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Kupon Diskon Promo Aktif
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {DEMO_VOUCHERS.map((v) => {
              const isCopied = copiedCode === v.code;
              return (
                <div
                  key={v.code}
                  className="bg-slate-800/80 border border-dashed border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Tag size={13} className="text-amber-400" />
                      <span className="font-mono font-extrabold text-amber-300 text-xs tracking-wider">
                        {v.code}
                      </span>
                      <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        Diskon {v.discount}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Min. {formatRupiah(v.minPurchase)} • Maks. Potongan{" "}
                      {formatRupiah(v.maxDiscount)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(v.code)}
                    className={`text-[10.5px] font-bold px-2.5 py-1.5 rounded-xl transition shrink-0 ${
                      isCopied
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {isCopied ? "Tersalin" : "Salin Kode"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* BAGIAN 4: QR CODE PRE-ORDER SISWA (PENGUJIAN KASIR)     */}
        {/* ======================================================== */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">
                4
              </span>
              <h2 className="text-sm font-bold text-white tracking-wide">
                QR Code Pesanan Pre-Order Siswa ({DEMO_ORDERS.length} Invoice Demo)
              </h2>
            </div>
            <a
              href="/kasir/pre-order"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold underline"
            >
              Buka Pre-Order Kasir &rarr;
            </a>
          </div>

          <p className="text-[11px] text-slate-400">
            Arahkan QR Code berikut ke webcam di menu <strong>Pre-Order Kasir</strong> untuk mengonfirmasi orderan dan mengupdate statusnya.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {DEMO_ORDERS.map((ord) => {
              const isCopied = copiedCode === ord.invoiceNumber;
              return (
                <div
                  key={ord.invoiceNumber}
                  className="bg-slate-800/90 border border-indigo-500/30 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 shadow-sm"
                >
                  <div className="bg-white p-3 rounded-xl shadow-xs">
                    <QRCodeSVG
                      value={ord.invoiceNumber}
                      size={130}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <div className="space-y-1 w-full">
                    <span className="font-mono font-bold text-indigo-300 text-xs block">
                      {ord.invoiceNumber}
                    </span>
                    <p className="text-xs font-bold text-white">{ord.customer}</p>
                    <p className="text-[10px] text-slate-400">{ord.items}</p>
                    <p className="text-xs font-extrabold text-emerald-400">
                      Total: {formatRupiah(ord.total)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(ord.invoiceNumber)}
                    className={`w-full py-2 text-xs font-bold rounded-xl transition ${
                      isCopied
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                    }`}
                  >
                    {isCopied ? "Nomor Invoice Tersalin" : "Salin No. Invoice"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
