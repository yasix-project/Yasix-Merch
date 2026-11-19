import {
  Printer,
  Shirt,
  BookOpen,
  ShoppingBag,
  Camera,
  ShieldCheck,
  Coins,
  Receipt,
  FileCheck,
  CheckCircle,
} from "lucide-react";
import Badge from "../ui/Badge";
import FeatureCard from "../ui/FeatureCard";

export default function LandingFeatures() {
  const storeCategories = [
    {
      icon: Shirt,
      title: "Seragam & Atribut Sekolah",
      desc: "Seragam kejuruan resmi Yadika 6, jas praktikum, dasi, sabuk, topi upacara, kaos olahraga, dan bordir badge siap pakai.",
      tag: "Resmi Sekolah",
      tagVariant: "emerald",
    },
    {
      icon: BookOpen,
      title: "Alat Tulis & Kebutuhan Belajar",
      desc: "Kertas folio bergaris, map arsip tugas, buku catatan, pena ujian, dan perlengkapan harian dengan harga pelajar.",
      tag: "Stok Lengkap",
      tagVariant: "amber",
    },
    {
      icon: ShoppingBag,
      title: "Merchandise & Produk KIK",
      desc: "Hasil karya unit produksi kreatif siswa kejuruan: gantungan kunci akrilik, tote bag kanvas, stiker, dan souvenir eksklusif.",
      tag: "Karya Siswa",
      tagVariant: "purple",
    },
  ];

  const systemCapabilities = [
    {
      icon: Camera,
      title: "Webcam Barcode & QR",
      description: "Memindai barcode produk 1D dan QR Code kartu pelajar langsung lewat webcam laptop tanpa alat scanner tambahan.",
    },
    {
      icon: Coins,
      title: "Loyalty Poin Siswa",
      description: "Akumulasi +1 poin per kelipatan Rp 10.000 belanja yang dapat ditukarkan voucher diskon langsung.",
    },
    {
      icon: ShieldCheck,
      title: "Audit Shift Kasir Terkunci",
      description: "Pencatatan kas awal wajib dan rekonsiliasi kas fisik di akhir shift untuk transparansi unit produksi.",
    },
    {
      icon: Receipt,
      title: "Cetak Struk Thermal",
      description: "Pencetakan struk transaksi 58mm/80mm instan langsung dari browser saat pembayaran selesai.",
    },
  ];

  return (
    <section id="layanan" className="py-16 md:py-24 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Content-first without decorative pill badges */}
        <div className="max-w-3xl mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Layanan Unit Produksi & Retail Siswa
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Menggabungkan kemudahan pemesanan cetak tugas secara digital dengan ketersediaan
            barang kebutuhan sekolah harian di satu tempat.
          </p>
        </div>

        {/* Flagship Feature (Wide Card) + Retail Grid (3 Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Flagship: Jasa Print Mandiri (7 cols) */}
          <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Printer size={22} />
                </div>
                <Badge variant="sky">Layanan Utama</Badge>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Jasa Cetak / Print Dokumen Mandiri
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Siswa cukup mengunggah file tugas berformat PDF melalui portal. Sistem server-side
                  langsung menghitung jumlah lembar, membedakan halaman warna atau hitam-putih,
                  serta mengkalkulasi biaya total beserta opsi penjilidan.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <FileCheck size={16} className="text-sky shrink-0" />
                  <span>Bebas antre flashdisk & WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  <span>Nomor tiket antrean otomatis</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
              Pengambilan hasil cetak langsung di konter loket kasir saat jam istirahat atau jam pulang sekolah.
            </div>
          </div>

          {/* Supporting Categories (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-4">
            {storeCategories.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 flex items-start gap-4"
                >
                  <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white truncate">
                        {item.title}
                      </h4>
                      <Badge variant={item.tagVariant} className="text-[10px] shrink-0">
                        {item.tag}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real Process Timeline: Bukan 4 lingkaran clone yang sama */}
        <div className="mt-14 bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="max-w-2xl mb-8">
            <h3 className="text-lg font-bold text-white">
              Alur Penggunaan Layanan
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Panduan praktis memesan barang dan mencetak dokumen tugas di Business Center.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 border-l-2 border-primary pl-4">
              <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-wider block">
                Langkah 1
              </span>
              <h4 className="text-sm font-bold text-white">Ajukan Pesanan di Portal</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Masuk ke akun siswa, unggah dokumen PDF atau pilih barang kebutuhan sekolah dari katalog pre-order.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-slate-700 pl-4">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                Langkah 2
              </span>
              <h4 className="text-sm font-bold text-white">Proses Kasir & Cetak</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sistem menerbitkan nomor tiket. Kasir mencetak dokumen dan menyiapkan barang sebelum Anda tiba di loket.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-accent pl-4">
              <span className="text-[11px] font-mono text-accent font-bold uppercase tracking-wider block">
                Langkah 3
              </span>
              <h4 className="text-sm font-bold text-white">Pengambilan & Poin</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tunjukkan nomor tiket atau kartu pelajar di konter BC, selesaikan pembayaran, dan klaim poin loyalitas Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Capability Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {systemCapabilities.map((feat, idx) => (
            <FeatureCard
              key={idx}
              icon={feat.icon}
              title={feat.title}
              description={feat.description}
              variant="dark"
              className="bg-slate-950 border-slate-800 rounded-xl"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
