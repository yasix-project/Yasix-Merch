import { useState } from "react";
import { Banknote, X, CheckCircle2, Calculator } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { formatRupiah } from "../../utils/formatters";

export default function PaymentModal({
  isOpen,
  onClose,
  totalAmount,
  onProcessPayment,
  isProcessing,
}) {
  const [payAmount, setPayAmount] = useState("");
  const changeAmount = Number(payAmount) - totalAmount;
  const isPayAmountValid = Number(payAmount) >= totalAmount;

  // Fungsi untuk menutup modal dan me-reset state (Menggantikan useEffect)
  const handleClose = () => {
    setPayAmount("");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPayAmountValid) return;

    // Kirim data ke komponen induk (PosTerminal)
    onProcessPayment({
      payAmount: Number(payAmount),
      changeAmount: changeAmount,
      paymentMethod: "CASH",
    });

    // Reset input setelah dikirim
    setPayAmount("");
  };

  if (!isOpen) return null;

  // Deret uang pecahan cepat (Quick Cash)
  const quickCashOptions = [
    totalAmount, // Uang Pas
    50000,
    100000,
    150000,
    200000,
  ].filter((amount) => amount >= totalAmount); // Hanya tampilkan pecahan yang >= total belanja

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        {/* Header Modal */}
        <div className="bg-slate-900 p-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <Calculator size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Proses Pembayaran</h2>
              <p className="text-xs text-slate-400">
                Konfirmasi transaksi tunai
              </p>
            </div>
          </div>
          {/* Ubah onClick menjadi handleClose */}
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tagihan Utama */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center mb-6">
            <p className="text-sm font-bold text-blue-600 mb-1 uppercase tracking-widest">
              Total Tagihan
            </p>
            <p className="text-4xl font-black text-slate-900 tracking-tight">
              {formatRupiah(totalAmount)}
            </p>
          </div>

          <div className="space-y-4">
            {/* Input Uang Diterima */}
            <div>
              <Input
                autoFocus
                type="number"
                label="Uang Diterima (Cash)"
                icon={Banknote}
                placeholder="Masukkan nominal uang pelanggan"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="text-lg font-bold"
              />
            </div>

            {/* Quick Cash Buttons */}
            <div className="flex flex-wrap gap-2">
              {quickCashOptions.map((amount, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPayAmount(amount.toString())}
                  className="flex-1 min-w-[80px] py-2 px-3 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
                >
                  {amount === totalAmount ? "Uang Pas" : formatRupiah(amount)}
                </button>
              ))}
            </div>

            {/* Kalkulasi Kembalian (Muncul jika uang >= tagihan) */}
            <div
              className={`p-4 rounded-xl border ${changeAmount >= 0 && payAmount ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"} transition-colors`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600">
                  Kembalian:
                </span>
                <span
                  className={`text-xl font-black ${changeAmount >= 0 && payAmount ? "text-emerald-600" : "text-slate-400"}`}
                >
                  {payAmount
                    ? formatRupiah(changeAmount >= 0 ? changeAmount : 0)
                    : "Rp 0"}
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Eksekusi */}
          <div className="mt-8">
            <Button
              type="submit"
              disabled={!isPayAmountValid || isProcessing}
              className="w-full py-4 text-lg font-bold bg-blue-600 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none"
            >
              {isProcessing ? (
                "Menyimpan Transaksi..."
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={24} />
                  Selesaikan & Cetak Struk
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
