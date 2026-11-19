import { useState } from "react";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Award,
} from "lucide-react";
import YasixLogo from "../ui/YasixLogo";
import Badge from "../ui/Badge";

export default function LandingFooter() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Bagaimana cara mencetak dokumen tugas melalui portal YasixMerch?",
      a: "Siswa cukup masuk ke akun portal siswa, pilih menu 'Print Mandiri Siswa', lalu unggah dokumen berformat PDF. Sistem secara otomatis menghitung jumlah halaman dan estimasi harga. Setelah konfirmasi, Anda akan mendapatkan kode tiket cetak yang dapat langsung diambil di loket kasir.",
    },
    {
      q: "Apakah saya masih perlu membawa flashdisk atau kirim file via WhatsApp ke kasir?",
      a: "Tidak perlu lagi! Seluruh proses pengiriman file dokumen dilakukan mandiri secara cloud melalui portal siswa. Kasir langsung menerima dokumen pada antrean digital POS dan langsung mencetaknya, sehingga tidak ada risiko virus dari flashdisk maupun antrean chat WhatsApp.",
    },
    {
      q: "Bagaimana jika saya siswa baru dan belum memiliki akun?",
      a: "Akun siswa dibuat secara resmi oleh Administrator Business Center menggunakan Nomor Induk Siswa (NIS). Silakan hubungi pembina unit produksi atau staf admin kasir di loket BC SMK Yadika 6 untuk didaftarkan dan mendapatkan kartu digital siswa.",
    },
    {
      q: "Metode pembayaran apa saja yang diterima di kasir?",
      a: "Business Center Yasix menerima pembayaran Tunai (Cash) dengan perhitungan kembalian otomatis, QRIS (melalui m-Banking / dompet digital seperti GoPay, OVO, Dana), serta sistem Pay on Pickup untuk pesanan pre-order.",
    },
    {
      q: "Bagaimana cara kerja poin loyalitas siswa?",
      a: "Setiap bertransaksi di kasir YasixMerch (belanja ATK, seragam, atau jasa cetak), kasir akan memindai QR Code kartu pelajar Anda. Setiap kelipatan Rp 10.000 belanja, Anda otomatis mendapatkan +1 Poin loyalitas yang dapat ditukar dengan voucher diskon belanja.",
    },
  ];

  const operatingHours = [
    { session: "Sesi Pagi (Sebelum Bel Masuk)", time: "06:45 - 07:15 WIB" },
    { session: "Jam Istirahat 1", time: "09:45 - 10:15 WIB" },
    { session: "Jam Istirahat 2 (Dzuhur)", time: "12:00 - 12:45 WIB" },
    { session: "Sesi Pulang Sekolah", time: "15:00 - 15:45 WIB" },
  ];

  return (
    <footer id="kontak" className="bg-slate-950 text-white border-t border-slate-900">
      {/* FAQ & Kontak Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* FAQ (Left 7 Cols) */}
          <div id="faq" className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div>
                <Badge variant="sky" icon={HelpCircle}>
                  Pertanyaan Umum (FAQ)
                </Badge>
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                Hal yang Sering Ditanyakan
              </h3>
            </div>

            <div className="space-y-3 pt-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-white flex items-center justify-between gap-4 hover:text-sky transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-200 text-slate-400 ${
                        openFaq === idx ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  {openFaq === idx && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3 animate-in fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lokasi & Jam Operasional (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Jam Operasional Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="p-2 rounded-xl bg-accent/20 text-accent">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">
                    Jam Operasional Loket
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Senin s/d Jumat (Hari Efektif Sekolah)
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {operatingHours.map((slot, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-none"
                  >
                    <span className="text-slate-300 font-medium">
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
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3.5">
              <h4 className="font-extrabold text-sm text-white mb-2">
                Informasi & Lokasi Konter
              </h4>

              <div className="flex items-start gap-3 text-xs text-slate-300">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span>
                  Lantai 1 Gedung Business Center, SMK Yadika 6, Jl. Jatiwaringin Raya No. 34, Pondok Gede, Kota Bekasi.
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Mail size={16} className="text-primary shrink-0" />
                <span>businesscenter@smkyadika6.sch.id</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Phone size={16} className="text-primary shrink-0" />
                <span>Loket Kasir Yasix: (021) 846-XXXX / Ext. 106</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-slate-900 bg-slate-950/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <YasixLogo variant="full" theme="dark" size={32} />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Badge variant="amber" icon={Award}>
              GTNIC 2026 Innovation Project
            </Badge>
            <span>•</span>
            <Badge variant="emerald" icon={ShieldCheck}>
              Unit Produksi Resmi
            </Badge>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 SMK Yadika 6 Jatiwaringin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
