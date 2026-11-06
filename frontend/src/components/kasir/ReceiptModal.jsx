// src/components/kasir/ReceiptModal.jsx
import { Printer, CheckCircle2, X, Sparkles, Award } from "lucide-react";
import Button from "../ui/Button";
import { formatRupiah, formatDate } from "../../utils/formatters";
import BarcodeSVG from "../shared/BarcodeSVG";

export default function ReceiptModal({
  isOpen,
  onClose,
  transaction,
  onPrint,
}) {
  if (!isOpen || !transaction) return null;

  const t = transaction;
  const items = t.items || [];
  const earnedPoints =
    t.student && t.totalAmount ? Math.floor(Number(t.totalAmount) / 10000) : 0;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col my-auto border border-slate-100">
        {/* Banner Sukses Atas */}
        <div className="bg-emerald-600 p-4 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 text-emerald-200 hover:text-white transition p-1"
          >
            <X size={20} />
          </button>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 text-white shadow-inner">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="font-extrabold text-base tracking-tight">
            Pembayaran Berhasil!
          </h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            Struk thermal transaksi telah diterbitkan
          </p>
        </div>

        {/* Visual Kertas Struk Thermal 58mm */}
        <div className="p-4 bg-slate-100 flex justify-center">
          <div className="w-full bg-white p-4 rounded-xl shadow-xs border border-slate-200 text-black font-mono text-[11px] leading-relaxed relative">
            {/* Header Toko */}
            <div className="text-center pb-2 mb-2 border-b border-dashed border-slate-400">
              <h4 className="font-extrabold text-sm tracking-wider uppercase">
                YASIX MERCH
              </h4>
              <p className="text-[10px] text-slate-600">SMK Yadika 6 Jatiwaringin</p>
              <p className="text-[9.5px] text-slate-500">Unit Bisnis & Retail Sekolah</p>
            </div>

            {/* Info Transaksi */}
            <div className="space-y-0.5 text-[10px] pb-2 border-b border-dashed border-slate-400">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Inv:</span>
                <span className="font-bold">{t.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{formatDate(t.createdAt || new Date(), true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span>{t.cashier?.name || "Kasir Shift 1"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span className="font-bold text-blue-900">
                  {t.student?.name ? `${t.student.name} (Member)` : "Umum"}
                </span>
              </div>
            </div>

            {/* Daftar Barang */}
            <div className="py-2 space-y-1.5 border-b border-dashed border-slate-400">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="font-bold leading-tight">{item.itemName}</span>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>
                      {item.quantity} x {formatRupiah(item.price)}
                    </span>
                    <span className="font-bold text-black">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Ringkasan Finansial */}
            <div className="pt-2 space-y-1 text-[10.5px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(t.subtotal)}</span>
              </div>
              {Number(t.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Diskon Promo</span>
                  <span>- {formatRupiah(t.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-slate-300">
                <span>TOTAL</span>
                <span className="text-blue-950 font-black">
                  {formatRupiah(t.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                <span>Metode:</span>
                <span className="font-bold uppercase">{t.paymentMethod || "CASH"}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Bayar:</span>
                <span>{formatRupiah(t.payAmount || t.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Kembalian:</span>
                <span className="font-bold">{formatRupiah(t.changeAmount || 0)}</span>
              </div>
            </div>

            {/* Poin Loyalitas Siswa (Jika ada) */}
            {earnedPoints > 0 && (
              <div className="mt-2.5 p-1.5 bg-blue-50 border border-blue-200 rounded-lg text-center text-blue-900 text-[10px] font-bold flex items-center justify-center gap-1">
                <Award size={13} className="text-blue-600 shrink-0" />
                <span>+{earnedPoints} Poin Loyalitas Ditambahkan!</span>
              </div>
            )}

            {/* Footer Struk & Barcode Invoice */}
            <div className="pt-3 text-center space-y-1.5 border-t border-dashed border-slate-400 mt-2">
              <p className="text-[9px] text-slate-500 leading-tight">
                Terima kasih atas kunjungan Anda di Business Center Yasix!
              </p>
              <div className="flex justify-center scale-90">
                <BarcodeSVG
                  value={t.invoiceNumber || "INV-YASIX"}
                  height={28}
                  barWidth={1.2}
                  showText={false}
                />
              </div>
              <p className="text-[8.5px] text-slate-400">
                Simpan struk ini sebagai bukti transaksi sah
              </p>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="p-4 bg-white flex flex-col gap-2">
          {onPrint && (
            <Button
              type="button"
              onClick={onPrint}
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs font-bold py-2.5 border-slate-300 hover:bg-slate-50"
            >
              <Printer size={15} />
              Cetak Ulang Struk (Printer Fisik / PDF)
            </Button>
          )}
          <Button
            type="button"
            onClick={onClose}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 text-xs shadow-md shadow-blue-600/20"
          >
            ✓ Selesai & Transaksi Baru
          </Button>
        </div>
      </div>
    </div>
  );
}
