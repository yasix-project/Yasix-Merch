import { useState, useMemo } from "react";
import {
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Printer,
  Camera,
  Coins,
  UserCheck,
  X,
  Banknote,
  QrCode,
  RotateCcw,
  ShoppingBag,
  Tag,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { formatDate, formatRupiah } from "../../utils/formatters";

export default function OrderConfirmModal({
  isOpen,
  order,
  onClose,
  onMarkReady,
  onComplete,
  onCancel,
  onRevertToBooked,
  onReprint,
  onOpenScanner,
  isPending = false,
}) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH"); // "CASH" | "QRIS"
  const [payAmountInput, setPayAmountInput] = useState("");
  const [autoPrintAfterComplete, setAutoPrintAfterComplete] = useState(true);

  // Inisialisasi default pembayaran saat order berganti
  const total = Number(order?.totalAmount || 0);
  const payNum = Number(payAmountInput || total);
  const effectivePay = paymentMethod === "QRIS" ? total : payNum;
  const changeAmount = effectivePay - total;
  const isPayAmountValid =
    paymentMethod === "QRIS" ? true : effectivePay >= total;

  // Deret uang pecahan cepat (Quick Cash)
  const quickCashOptions = useMemo(() => {
    if (!total) return [];
    const list = [total];
    const roundTo5k = Math.ceil(total / 5000) * 5000;
    const roundTo10k = Math.ceil(total / 10000) * 10000;
    const roundTo50k = Math.ceil(total / 50000) * 50000;

    if (roundTo5k > total) list.push(roundTo5k);
    if (roundTo10k > roundTo5k) list.push(roundTo10k);
    if (roundTo50k > roundTo10k) list.push(roundTo50k);

    [20000, 50000, 100000].forEach((amt) => {
      if (amt >= total && !list.includes(amt)) {
        list.push(amt);
      }
    });

    return list.slice(0, 4);
  }, [total]);

  if (!isOpen || !order) return null;

  const isBooked = order.status === "BOOKED";
  const isReady = order.status === "READY";
  const isCompleted = order.status === "COMPLETED";
  const isCancelled = order.status === "CANCELLED";

  const handleExecutePayment = (e) => {
    e.preventDefault();
    if (!isPayAmountValid || isPending) return;

    onComplete({
      order,
      payAmount: effectivePay,
      paymentMethod,
      autoPrint: autoPrintAfterComplete,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden my-auto border border-slate-200/90 flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Header Modal */}
        <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-600/30 rounded-xl text-blue-400 border border-blue-500/20 shrink-0">
              <PackageCheck size={20} />
            </div>
            <div className="truncate">
              <h2 className="text-base font-bold leading-tight truncate">
                Konfirmasi Pesanan Siswa
              </h2>
              <p className="text-[11px] font-mono text-slate-400 leading-tight mt-0.5">
                {order.invoiceNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-slate-800 shrink-0"
            title="Tutup (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Konten Scrollable */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0 [scrollbar-width:thin] text-xs">
          {/* Status & Waktu Alert */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <span className="text-[10.5px] uppercase font-bold text-slate-400 block tracking-wider">
                Status Pesanan
              </span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    isReady
                      ? "success"
                      : isBooked
                      ? "warning"
                      : isCompleted
                      ? "primary"
                      : "danger"
                  }
                >
                  {isReady && <PackageCheck size={12} className="mr-1" />}
                  {isBooked && <Clock size={12} className="mr-1 animate-spin" />}
                  {isCompleted && <CheckCircle2 size={12} className="mr-1" />}
                  {isCancelled && <XCircle size={12} className="mr-1" />}
                  {order.status === "BOOKED"
                    ? "Menunggu Diproses"
                    : order.status === "READY"
                    ? "Siap Diambil di Konter"
                    : order.status === "COMPLETED"
                    ? "Selesai / Lunas"
                    : "Dibatalkan"}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Waktu Order:</span>
              <span className="font-semibold text-slate-700">
                {formatDate(order.createdAt, true)}
              </span>
            </div>
          </div>

          {/* Profil Pemesan Siswa */}
          <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 shadow-xs font-bold">
                <UserCheck size={17} />
              </span>
              <div className="truncate">
                <p className="font-black text-slate-900 text-xs sm:text-sm truncate">
                  {order.student?.name || "Siswa Yasix"}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  NIS: <strong className="text-slate-700">{order.student?.nis || "-"}</strong>
                  {order.student?.class ? ` • ${order.student.class}` : ""}
                </p>
              </div>
            </div>
            {order.student?.points !== undefined && (
              <span className="px-2.5 py-1 rounded-xl bg-white border border-blue-200 text-blue-700 font-extrabold text-[11px] shadow-2xs shrink-0">
                {order.student.points || 0} Poin
              </span>
            )}
          </div>

          {/* Apa Saja yang Diorder (Daftar Barang) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-blue-600" />
                <span>Barang yang Diorder ({order.items?.length || 0} Jenis)</span>
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-48 overflow-y-auto bg-slate-50/40">
              {(order.items || []).map((it, idx) => (
                <div
                  key={idx}
                  className="p-3 flex items-center justify-between hover:bg-white transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <span className="font-bold text-slate-900 text-xs block leading-snug truncate">
                      {it.itemName || it.product?.name || "Produk"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatRupiah(it.price)} per pcs
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-black text-xs">
                      {it.quantity} pcs
                    </span>
                    <span className="font-bold text-slate-900 text-xs tabular-nums text-right min-w-[70px]">
                      {formatRupiah(it.subtotal || it.price * it.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rincian Finansial Tagihan */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Subtotal Barang:</span>
              <span className="font-bold text-slate-700 tabular-nums">
                {formatRupiah(order.subtotal || total)}
              </span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  <span>Potongan Voucher:</span>
                </span>
                <span className="tabular-nums font-bold">
                  -{formatRupiah(order.discountAmount)}
                </span>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-dashed border-slate-300/80 pt-2 text-slate-900">
              <div>
                <span className="text-xs font-bold block leading-tight">Total Tagihan Kasir</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Metode: {order.paymentMethod || "PAY_ON_PICKUP"}
                </span>
              </div>
              <span className="text-xl font-black text-blue-600 tabular-nums tracking-tight">
                {formatRupiah(total)}
              </span>
            </div>
          </div>

          {/* Form Pelunasan / Pembayaran Cepat (Muncul saat Klik Pelunasan atau Status READY) */}
          {(showPaymentForm || isReady) && !isCompleted && !isCancelled && (
            <form
              onSubmit={handleExecutePayment}
              className="p-4 bg-blue-50/60 border border-blue-200/90 rounded-2xl space-y-3.5 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                  <Coins size={14} className="text-blue-600" />
                  <span>Form Pelunasan & Penyerahan</span>
                </span>
                {isBooked && (
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
                  >
                    Batal Pelunasan
                  </button>
                )}
              </div>

              {/* Pilihan Metode Pembayaran */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    paymentMethod === "CASH"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Banknote size={14} />
                  <span>Tunai (Cash)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("QRIS");
                    setPayAmountInput(String(total));
                  }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    paymentMethod === "QRIS"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <QrCode size={14} />
                  <span>QRIS Yasix</span>
                </button>
              </div>

              {paymentMethod === "CASH" && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Uang Fisik Diterima (Rp)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Nominal uang tunai..."
                        value={payAmountInput}
                        onChange={(e) => setPayAmountInput(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                        required
                      />
                      {payAmountInput && (
                        <button
                          type="button"
                          onClick={() => setPayAmountInput("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <RotateCcw size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {quickCashOptions.map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPayAmountInput(String(amt))}
                        className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-[11px] font-bold border transition ${
                          Number(payAmountInput) === amt
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {amt === total ? "Uang Pas" : formatRupiah(amt)}
                      </button>
                    ))}
                  </div>

                  {/* Status Kembalian */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      changeAmount >= 0 && payAmountInput
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}
                  >
                    <span className="font-semibold">
                      {changeAmount >= 0 ? "Uang Kembalian:" : "Uang Kurang:"}
                    </span>
                    <span className="font-black text-sm tabular-nums">
                      {formatRupiah(Math.abs(changeAmount))}
                    </span>
                  </div>
                </div>
              )}

              {/* Checkbox Cetak Struk */}
              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={autoPrintAfterComplete}
                  onChange={(e) => setAutoPrintAfterComplete(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="font-medium">Cetak struk thermal otomatis setelah diserahkan</span>
              </label>

              {/* Tombol Eksekusi Bayar */}
              <Button
                type="submit"
                variant="primary"
                disabled={!isPayAmountValid || isPending}
                className="w-full py-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/30"
              >
                {isPending ? "Menyimpan Transaksi..." : "Konfirmasi Lunas & Serahkan Barang"}
              </Button>
            </form>
          )}

          {/* Opsi Aksi Cepat Update Status */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Aksi Update Status Pesanan:
            </span>

            {/* Jika Status BOOKED */}
            {isBooked && !showPaymentForm && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => onMarkReady(order)}
                  disabled={isPending}
                  className="w-full py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  <PackageCheck size={15} />
                  <span>Tandai Siap Ambil (READY)</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPaymentForm(true);
                    setPayAmountInput(String(total));
                  }}
                  disabled={isPending}
                  className="w-full py-2.5 text-xs font-bold text-blue-700 border-blue-200 bg-blue-50/70 hover:bg-blue-100 rounded-xl"
                >
                  <Coins size={15} />
                  <span>Langsung Bayar & Serahkan</span>
                </Button>
              </div>
            )}

            {/* Jika Status READY */}
            {isReady && !showPaymentForm && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onRevertToBooked(order)}
                  disabled={isPending}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border-slate-200"
                >
                  <RotateCcw size={14} />
                  <span>Kembalikan ke Menunggu</span>
                </Button>
              </div>
            )}

            {/* Jika Status COMPLETED */}
            {isCompleted && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span className="font-bold">Pesanan telah lunas & diserahkan.</span>
                </div>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => onReprint(order)}
                  className="text-xs font-bold bg-white text-slate-800 shadow-2xs border border-slate-200"
                >
                  <Printer size={13} className="mr-1 text-blue-600" />
                  <span>Cetak Struk</span>
                </Button>
              </div>
            )}

            {/* Tombol Batalkan Pesanan (jika belum lunas/batal) */}
            {(isBooked || isReady) && (
              <button
                type="button"
                onClick={() => onCancel(order)}
                disabled={isPending}
                className="w-full text-center py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
              >
                Batalkan Pesanan Ini (Kembalikan Stok)
              </button>
            )}
          </div>
        </div>

        {/* Footer Modal: Tombol Scan Berikutnya & Tutup */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onOpenScanner}
            className="text-xs font-bold gap-1.5 rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-100"
          >
            <Camera size={14} className="text-blue-600" />
            <span>Scan Pesanan Lain [F9]</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onClose}
            className="text-xs font-semibold rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
