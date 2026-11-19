import {
  Printer,
  Shirt,
  BookOpen,
  ShoppingBag,
  Camera,
  ShieldAlert,
  Coins,
  Receipt,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import Badge from "../ui/Badge";
import FeatureCard from "../ui/FeatureCard";

export default function LandingFeatures() {
  const services = [
    {
      icon: Printer,
      title: "Jasa Print Mandiri (Self-Service)",
      description:
        "Unggah dokumen tugas PDF langsung dari ponsel atau laptop Anda. Jumlah halaman, warna, dan estimasi biaya langsung terdeteksi otomatis oleh sistem tanpa perlu repot colok flashdisk.",
      tag: "Paling Populer",
      tagVariant: "sky",
    },
    {
      icon: Shirt,
      title: "Seragam & Atribut Resmi Sekolah",
      description:
        "Penyediaan seragam kejuruan resmi SMK Yadika 6, jas praktikum, dasi, sabuk, topi upacara, kaos olahraga, hingga bordir badge jurusan siap pakai.",
      tag: "Resmi Yadika 6",
      tagVariant: "emerald",
    },
    {
      icon: BookOpen,
      title: "Alat Tulis Kantor & Kebutuhan Siswa",
      description:
        "Pusat belanja ATK harian: kertas folio bergaris, map arsip tugas, buku catatan, pena, pensil ujian, dan kebutuhan belajar harian dengan harga bersahabat untuk pelajar.",
      tag: "Lengkap & Murah",
      tagVariant: "amber",
    },
    {
      icon: ShoppingBag,
      title: "Merchandise & Produk Kreatif (KIK)",
      description:
        "Wadah pemasaran hasil karya kreatif unit produksi siswa kejuruan: gantungan kunci, merchandise sekolah, tote bag, stiker, dan produk inovatif lainnya.",
      tag: "Karya Kejuruan",
      tagVariant: "purple",
    },
  ];

  const techFeatures = [
    {
      icon: Camera,
      title: "Webcam Barcode & QR Scanner",
      description:
        "Memindai barcode produk 1D (EAN-13) dan QR Code kartu pelajar menggunakan kamera web laptop tanpa perlu beli alat scanner fisik tambahan.",
    },
    {
      icon: Coins,
      title: "Loyalty Point & Diskon Siswa",
      description:
        "Siswa mengumpulkan poin setiap transaksi kelipatan Rp 10.000 yang dapat ditukar dengan kupon potongan harga belanja.",
    },
    {
      icon: ShieldAlert,
      title: "Audit Shift Kasir Ketat",
      description:
        "Mewajibkan input kas awal (Start Cash) dan verifikasi kas fisik (Actual Cash) saat pergantian giliran kasir untuk mencegah selisih.",
    },
    {
      icon: Receipt,
      title: "Cetak Struk Thermal Otomatis",
      description:
        "Mendukung cetak struk kasir thermal 58mm / 80mm secara langsung melalui web browser saat transaksi selesai.",
    },
  ];

  return (
    <section id="layanan" className="py-20 md:py-28 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div>
            <Badge variant="sky" icon={Sparkles}>
              Layanan Unggulan Unit Produksi
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Solusi Terintegrasi untuk Seluruh Kebutuhan Sekolah
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Business Center SMK Yadika 6 menyediakan ekosistem terpadu untuk kemudahan
            siswa dan guru dalam bertransaksi cepat tanpa antrean konvensional.
          </p>
        </div>

        {/* 4 Pilar Layanan Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-primary/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 text-sky transition-colors">
                      <Icon size={24} />
                    </div>
                    <Badge variant={item.tagVariant} className="text-[10px] font-bold">
                      {item.tag}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2.5 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-300 font-semibold group-hover:text-sky transition-colors">
                  <CheckCircle size={15} className="text-emerald-400" />
                  <span>Tersedia di Loket Yasix</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* How It Works (Alur Layanan Cetak & Belanja) */}
        <div className="mt-20 p-8 sm:p-10 rounded-3xl bg-slate-950 border border-slate-800 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Alur Cepat Cetak Dokumen & Pre-Order
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Hanya butuh 4 langkah mudah dari perangkat Anda hingga pesanan siap diambil.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-sm text-white">Unggah PDF / Pilih Barang</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pilih file tugas Anda di portal siswa atau masukkan produk seragam/ATK ke keranjang.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-sm text-white">Deteksi Biaya Otomatis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sistem menghitung jumlah lembar, pilihan warna, dan jilid. Nomor tiket antrean otomatis diterbitkan.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-sm text-white">Kasir Memproses Antrean</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kasir langsung mencetak pesanan dari antrean digital tanpa meminta flashdisk Anda.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-accent text-slate-950 font-bold text-sm flex items-center justify-center">
                4
              </span>
              <h4 className="font-bold text-sm text-white">Ambil & Raih Poin</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ambil hasil cetak di konter kasir, bayar tunai atau QRIS, dan kumpulkan poin loyalitas siswa!
              </p>
            </div>
          </div>
        </div>

        {/* Keunggulan Ekosistem Teknis */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techFeatures.map((feat, idx) => (
            <FeatureCard
              key={idx}
              icon={feat.icon}
              title={feat.title}
              description={feat.description}
              variant="dark"
              className="bg-slate-950/60 border-slate-800/80"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
