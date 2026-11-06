import { useState } from "react";
import {
  Banknote,
  X,
  CheckCircle2,
  Calculator,
  QrCode,
  CreditCard,
} from "lucide-react";
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
  const [paymentMethod, setPaymentMethod] = useState("CASH"); // "CASH" | "QRIS"
  const [payAmount, setPayAmount] = useState("");

  const effectivePayAmount =
    paymentMethod === "QRIS" ? totalAmount : Number(payAmount) || 0;
  const changeAmount = effectivePayAmount - totalAmount;
  const isPayAmountValid =
    paymentMethod === "QRIS" ? true : effectivePayAmount >= totalAmount;

  const handleClose = () => {
    setPayAmount("");
    setPaymentMethod("CASH");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPayAmountValid) return;

    onProcessPayment({
      payAmount: effectivePayAmount,
      changeAmount: paymentMethod === "QRIS" ? 0 : Math.max(0, changeAmount),
      paymentMethod: paymentMethod,
    });

    setPayAmount("");
  };

  if (!isOpen) return null;

  // Deret uang pecahan cepat (Quick Cash)
  const quickCashOptions = [
    totalAmount, // Uang Pas
    20000,
    50000,
    100000,
    150000,
    200000,
  ].filter((amount) => amount >= totalAmount);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        {/* Header Modal */}
        <div className="bg-slate-900 p-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <Calculator size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Proses Pembayaran</h2>
              <p className="text-xs text-slate-400">
                Pilih metode bayar & selesaikan transaksi
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Tagihan Utama */}
          <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 sm:p-5 text-center">
            <p className="text-xs font-bold text-blue-600 mb-0.5 uppercase tracking-widest">
              Total Tagihan
            </p>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {formatRupiah(totalAmount)}
            </p>
          </div>

          {/* Pilihan Tab Metode Pembayaran */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                paymentMethod === "CASH"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Banknote size={16} />
              Tunai (Cash)
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod("QRIS");
                setPayAmount(totalAmount.toString());
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                paymentMethod === "QRIS"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <QrCode size={16} />
              QRIS / Non-Tunai
            </button>
          </div>

          {paymentMethod === "CASH" ? (
            <div className="space-y-4">
              {/* Input Uang Diterima */}
              <div>
                <Input
                  autoFocus
                  type="number"
                  label="Uang Diterima (Cash)"
                  icon={Banknote}
                  placeholder="Masukkan nominal uang tunai..."
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="text-base font-bold"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-2">
                {quickCashOptions.map((amount, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPayAmount(amount.toString())}
                    className="flex-1 min-w-[75px] py-2 px-2.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    {amount === totalAmount ? "Uang Pas" : formatRupiah(amount)}
                  </button>
                ))}
              </div>

              {/* Kalkulasi Kembalian */}
              <div
                className={`p-3.5 rounded-xl border ${
                  changeAmount >= 0 && payAmount
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-slate-50 border-slate-200"
                } transition-colors`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600">
                    Kembalian:
                  </span>
                  <span
                    className={`text-lg font-black ${
                      changeAmount >= 0 && payAmount
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {payAmount
                      ? formatRupiah(changeAmount >= 0 ? changeAmount : 0)
                      : "Rp 0"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Tampilan QRIS */
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2.5 animate-in fade-in duration-200">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <QrCode size={64} className="text-slate-800" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Pembayaran QRIS Standar Bank Indonesia
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                  Arahkan siswa memindai QRIS di monitor konter atau mesin EDC kasir sebesar{" "}
                  <span className="font-bold text-blue-600">
                    {formatRupiah(totalAmount)}
                  </span>
                  .
                </p>
              </div>
            </div>
          )}

          {/* Tombol Eksekusi */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={!isPayAmountValid || isProcessing}
              className="w-full py-3.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none"
            >
              {isProcessing ? (
                "Menyimpan Transaksi..."
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} />
                  {paymentMethod === "QRIS"
                    ? "Konfirmasi Bayar & Cetak Struk"
                    : "Selesaikan & Cetak Struk"}
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
