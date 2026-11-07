import { useState, useMemo } from "react";
import {
  Banknote,
  X,
  CheckCircle2,
  Calculator,
  QrCode,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import Button from "../ui/Button";
import { formatRupiah } from "../../utils/formatters";

export default function PaymentModal({
  isOpen,
  onClose,
  totalAmount = 0,
  onProcessPayment,
  isProcessing,
}) {
  const [paymentMethod, setPaymentMethod] = useState("CASH"); // "CASH" | "QRIS"
  const [payAmount, setPayAmount] = useState("");

  const numPayAmount = Number(payAmount) || 0;
  const effectivePayAmount = paymentMethod === "QRIS" ? totalAmount : numPayAmount;
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
    if (!isPayAmountValid || isProcessing) return;

    onProcessPayment({
      payAmount: effectivePayAmount,
      changeAmount: paymentMethod === "QRIS" ? 0 : Math.max(0, changeAmount),
      paymentMethod: paymentMethod,
    });

    setPayAmount("");
  };

  // Kalkulasi opsi pecahan uang cepat (Quick Cash Denominations)
  const quickCashOptions = useMemo(() => {
    const list = [totalAmount]; // Uang Pas selalu pertama

    // Hitung pembulatan ke atas terdekat
    const roundTo5k = Math.ceil(totalAmount / 5000) * 5000;
    const roundTo10k = Math.ceil(totalAmount / 10000) * 10000;
    const roundTo50k = Math.ceil(totalAmount / 50000) * 50000;

    if (roundTo5k > totalAmount) list.push(roundTo5k);
    if (roundTo10k > roundTo5k) list.push(roundTo10k);
    if (roundTo50k > roundTo10k) list.push(roundTo50k);

    [20000, 50000, 100000, 150000, 200000].forEach((amt) => {
      if (amt >= totalAmount && !list.includes(amt)) {
        list.push(amt);
      }
    });

    return list.slice(0, 5); // Ambil maksimal 5 opsi terpopuler
  }, [totalAmount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden my-auto border border-slate-200/90 animate-in zoom-in-95">
        {/* Header Modal */}
        <div className="bg-slate-900 px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-xl text-blue-400 border border-blue-500/20">
              <Calculator size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Proses Pembayaran</h2>
              <p className="text-xs text-slate-400">
                Pilih metode bayar & selesaikan transaksi
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-slate-800"
            title="Tutup (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Tagihan Utama */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200/70 rounded-2xl p-4 sm:p-5 text-center shadow-2xs">
            <p className="text-[11px] font-bold text-blue-700 mb-1 uppercase tracking-widest">
              Total Tagihan Transaksi
            </p>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {formatRupiah(totalAmount)}
            </p>
          </div>

          {/* Tab Pilihan Metode Bayar */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                paymentMethod === "CASH"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Banknote size={17} />
              Tunai (Cash)
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod("QRIS");
                setPayAmount(totalAmount.toString());
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                paymentMethod === "QRIS"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <QrCode size={17} />
              QRIS / Non-Tunai
            </button>
          </div>

          {paymentMethod === "CASH" ? (
            <div className="space-y-3.5">
              {/* Input Uang Diterima */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Uang Diterima dari Siswa / Pembeli (Rp)
                </label>
                <div className="relative">
                  <Banknote
                    size={20}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    autoFocus
                    type="number"
                    inputMode="numeric"
                    placeholder="Masukkan nominal uang tunai..."
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-lg font-black text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition"
                  />
                  {payAmount && (
                    <button
                      type="button"
                      onClick={() => setPayAmount("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                      title="Reset nominal"
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                  Pecahan Cepat (Quick Cash):
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickCashOptions.map((amount, idx) => {
                    const isSelected = Number(payAmount) === amount;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPayAmount(amount.toString())}
                        className={`flex-1 min-w-[85px] py-2 px-2.5 rounded-xl font-bold text-xs transition active:scale-95 border ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200/90 hover:border-blue-300"
                        }`}
                      >
                        {amount === totalAmount ? "Uang Pas" : formatRupiah(amount)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kalkulasi Kembalian atau Kurang */}
              <div>
                {payAmount && numPayAmount < totalAmount ? (
                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/90 flex items-center justify-between text-xs transition-colors">
                    <span className="flex items-center gap-1.5 font-bold text-amber-800">
                      <AlertTriangle size={15} className="text-amber-600" />
                      Uang Masih Kurang:
                    </span>
                    <span className="text-base font-black text-amber-700 tabular-nums">
                      {formatRupiah(totalAmount - numPayAmount)}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`p-3.5 rounded-xl border transition-colors ${
                      changeAmount >= 0 && payAmount
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-600">
                        Uang Kembalian:
                      </span>
                      <span
                        className={`text-lg font-black tabular-nums ${
                          changeAmount >= 0 && payAmount
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {payAmount && changeAmount >= 0
                          ? formatRupiah(changeAmount)
                          : "Rp 0"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tampilan QRIS */
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2.5 animate-in fade-in duration-200">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <QrCode size={70} className="text-slate-800" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  Pembayaran QRIS Standar Bank Indonesia
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  Arahkan siswa memindai QRIS statis di konter kasir sebesar{" "}
                  <strong className="text-blue-700 font-extrabold">
                    {formatRupiah(totalAmount)}
                  </strong>
                  .
                </p>
              </div>
            </div>
          )}

          {/* Tombol Eksekusi Bayar */}
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
