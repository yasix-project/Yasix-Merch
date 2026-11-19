import { useState } from "react";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
} from "lucide-react";
import YasixLogo from "../ui/YasixLogo";

export default function LandingFooter() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Bagaimana alur cetak dokumen tugas lewat portal YasixMerch?",
      a: "Siswa masuk ke portal dengan akun masing-masing, buka menu 'Print Mandiri', dan unggah file PDF. Sistem otomatis mendeteksi jumlah halaman dan rincian biaya. Setelah konfirmasi, siswa mendapatkan nomor tiket untuk mengambil dokumen langsung di loket kasir.",
    },
    {
      q: "Apakah siswa masih perlu membawa flashdisk ke konter kasir?",
      a: "Tidak perlu. File dikirim langsung melalui portal siswa ke antrean digital kasir. Hal ini menghindarkan risiko transfer malware dari flashdisk dan mempercepat antrean.",
    },
    {
      q: "Bagaimana jika siswa belum memiliki akun login?",
      a: "Akun siswa dibuat secara terpusat oleh pihak sekolah menggunakan NIS. Silakan hubungi petugas admin di loket Business Center atau pembina unit produksi untuk verifikasi akun baru.",
    },
    {
      q: "Metode pembayaran apa saja yang diterima di kasir?",
      a: "Kasir menerima uang tunai (dengan pencatatan kembalian sistematis), QRIS via m-banking atau e-wallet, serta sistem bayar saat pengambilan (Pay on Pickup) untuk pesanan pre-order.",
    },
    {
      q: "Bagaimana cara mendapatkan dan menukar poin loyalitas?",
      a: "Setiap transaksi di kasir dengan scan kartu pelajar (QR NIS), siswa otomatis mengumpulkan +1 poin per kelipatan Rp 10.000 belanja. Poin yang terkumpul dapat ditukarkan voucher diskon di portal siswa.",
    },
  ];

  const operatingHours = [
    { session: "Sesi Pagi (Sebelum Bel Masuk)", time: "06:45 - 07:15 WIB" },
    { session: "Jam Istirahat 1", time: "09:45 - 10:15 WIB" },
    { session: "Jam Istirahat 2 (Dzuhur)", time: "12:00 - 12:45 WIB" },
    { session: "Sesi Pulang Sekolah", time: "15:00 - 15:45 WIB" },
  ];

  return (
    <footer id="kontak" className="bg-slate-950 text-white border-t border-slate-800">
      {/* FAQ & Kontak Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* FAQ (Left 7 Cols) */}
          <div id="faq" className="lg:col-span-7 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white">
                Pertanyaan yang Sering Diajukan
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Informasi penting seputar penggunaan portal dan layanan Business Center.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-white flex items-center justify-between gap-4 hover:text-sky transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={16}
                        className={`shrink-0 transition-transform duration-200 text-slate-400 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lokasi & Jam Operasional (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Jam Operasional Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                <Clock size={16} className="text-accent" />
                <h4 className="font-bold text-xs uppercase tracking-wide text-white">
                  Jadwal Operasional Loket
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                {operatingHours.map((slot, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-none"
                  >
                    <span className="text-slate-300">
                      {slot.session}
                    </span>
                    <span className="font-mono font-bold text-sky">
                      {slot.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lokasi Fisik & Kontak Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
              <h4 className="font-bold text-xs uppercase tracking-wide text-white pb-1 border-b border-slate-800">
                Lokasi & Narahubung
              </h4>

              <div className="flex items-start gap-2.5 text-slate-300">
                <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Lantai 1 Gedung Business Center, SMK Yadika 6, Jl. Jatiwaringin Raya No. 34, Pondok Gede, Kota Bekasi.
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail size={15} className="text-primary shrink-0" />
                <span>businesscenter@smkyadika6.sch.id</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone size={15} className="text-primary shrink-0" />
                <span>Telp: (021) 846-XXXX / Ext. 106</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-slate-800 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <YasixLogo variant="full" theme="dark" size={30} />
          </div>

          <p>
            © 2026 SMK Yadika 6 Jatiwaringin. Unit Produksi Resmi Sekolah.
          </p>
        </div>
      </div>
    </footer>
  );
}
