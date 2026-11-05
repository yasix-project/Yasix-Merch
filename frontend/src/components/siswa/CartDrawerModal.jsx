import { useState } from "react";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  Clock,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
  CreditCard,
} from "lucide-react";
import { useStudentCartStore } from "../../store/studentCartStore";
import {
  useCreatePreOrder,
  useValidateVoucher,
} from "../../hooks/siswa/useStudentTransactions";
import { formatRupiah } from "../../utils/formatters";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import Button from "../ui/Button";

export default function CartDrawerModal({ isOpen, onClose, onOrderSuccess }) {
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PAY_ON_PICKUP");

  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    appliedVoucher,
    setAppliedVoucher,
    removeAppliedVoucher,
    getSubtotal,
    getFinalTotal,
  } = useStudentCartStore();

  const subtotal = getSubtotal();
  const finalTotal = getFinalTotal();
  const discountAmount = appliedVoucher?.discountAmount || 0;

  const createOrderMutation = useCreatePreOrder();
  const validateVoucherMutation = useValidateVoucher();

  if (!isOpen) return null;

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    if (!voucherCodeInput.trim()) return;

    validateVoucherMutation.mutate(
      { code: voucherCodeInput.trim(), subtotal },
      {
        onSuccess: (res) => {
          const voucherData = res.data?.data || res.data;
          setAppliedVoucher(voucherData);
          showSuccessToast(`Voucher ${voucherData.code} berhasil diterapkan!`);
          setVoucherCodeInput("");
        },
        onError: (err) => {
          const msg =
            err.response?.data?.message ||
            "Kode voucher tidak valid atau syarat minimal belum terpenuhi.";
          showErrorToast(msg);
        },
      },
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const payload = {
      paymentMethod,
      voucherId: appliedVoucher?.voucherId || null,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    createOrderMutation.mutate(payload, {
      onSuccess: (res) => {
        const orderData = res.data?.data || res.data;
        clearCart();
        onClose();
        if (onOrderSuccess) {
          onOrderSuccess(orderData);
        }
      },
      onError: (err) => {
        const msg =
          err.response?.data?.message || "Gagal membuat pre-order barang.";
        showErrorToast(msg);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Drawer */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Keranjang Belanja
              </h3>
              <p className="text-[10px] text-slate-400">
                {cart.length} jenis barang dipilih
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-semibold text-slate-400 hover:text-danger px-2 py-1 rounded-lg hover:bg-danger/10 transition-colors"
              >
                Kosongkan
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* List Keranjang */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <ShoppingBag size={28} />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Keranjang belanja masih kosong
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Silakan pilih barang ATK atau kebutuhan sekolah dari katalog
                untuk mulai memesan.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const fileUrl = item.product?.imageUrl
                ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${item.product.imageUrl}`
                : null;

              return (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl shadow-2xs hover:border-slate-300 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {fileUrl ? (
                      <img
                        src={fileUrl}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <ShoppingBag size={20} className="text-slate-300" />
                    )}
                  </div>

                  {/* Info Barang */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.product?.name}
                    </h4>
                    <p className="text-xs font-black text-primary">
                      {formatRupiah(item.price)}
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      Stok: {item.product?.stock}
                    </span>
                  </div>

                  {/* Stepper Jumlah */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-xs font-bold w-6 text-center text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product?.stock}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                      <Plus size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1.5 ml-1 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Form Kode Voucher */}
          {cart.length > 0 && (
            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Punya Kode Voucher Diskon?
              </label>

              {appliedVoucher ? (
                <div className="p-2.5 bg-accent/15 border border-accent/40 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <Tag size={14} className="text-accent" />
                    <span>
                      Voucher "{appliedVoucher.code}" aktif (-
                      {formatRupiah(discountAmount)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeAppliedVoucher}
                    className="text-[11px] font-bold text-danger hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyVoucher} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: DISKON10"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value)}
                    className="flex-1 text-xs uppercase px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={
                      !voucherCodeInput.trim() ||
                      validateVoucherMutation.isPending
                    }
                    className="text-xs px-3.5 py-2 font-bold rounded-xl"
                  >
                    {validateVoucherMutation.isPending ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      "Terapkan"
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Metode Pembayaran */}
          {cart.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-bold text-slate-700 block">
                Metode Pembayaran
              </label>
              <div
                onClick={() => setPaymentMethod("PAY_ON_PICKUP")}
                className="p-3 rounded-2xl border border-primary bg-primary/5 flex items-start gap-3 cursor-pointer shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">
                    Pay on Pickup (Bayar di Kasir Yasix)
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Bayar saat mengambil barang di kasir Business Center (Bisa
                    Tunai atau QRIS Dinamis).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ketentuan 1 Jam */}
          {cart.length > 0 && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
              <Clock size={16} className="text-amber-600 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                Stok barang akan ditahan selama <strong>1 jam</strong>. Pesanan
                akan dibatalkan otomatis jika belum diambil.
              </p>
            </div>
          )}
        </div>

        {/* Footer Ringkasan Biaya & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Barang:</span>
                <span className="font-semibold text-slate-900">
                  {formatRupiah(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Potongan Voucher:</span>
                  <span className="font-bold">
                    -{formatRupiah(discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm pt-1 border-t border-slate-200/70 items-center">
                <span className="font-bold text-slate-800">Total Tagihan:</span>
                <span className="text-base font-black text-primary">
                  {formatRupiah(finalTotal)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleCheckout}
              disabled={createOrderMutation.isPending}
              className="w-full py-3.5 text-xs font-bold rounded-2xl shadow-md shadow-primary/25 flex items-center justify-center gap-2"
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Memproses Pre-Order...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Konfirmasi & Buat Pesanan</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
