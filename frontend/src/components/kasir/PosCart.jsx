import { ShoppingBag, CreditCard, Trash2, Loader2 } from "lucide-react";
import CartItem from "./CartItem";
import { formatRupiah } from "../../utils/formatters";
import { usePosStore } from "../../store/posStore";

const inputClass =
  "w-full rounded-xl bg-slate-50 py-2.5 pl-3.5 pr-20 text-[13px] text-slate-800 ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600";

const inlineBtnClass =
  "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 outline-none transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-600";

export default function PosCart({
  memberCode,
  setMemberCode,
  voucherCode,
  setVoucherCode,
  onOpenPayment,
  isProcessing,
}) {
  const {
    cart,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
  } = usePosStore();

  const total = getCartTotal();
  const isEmpty = cart.length === 0;

  const handleIncrease = (item) => {
    addToCart({
      id: item.productId,
      stock: item.maxStock,
      sellingPrice: item.price,
      price: item.price,
      name: item.itemName,
    });
  };

  return (
    <aside className="z-20 flex w-full flex-col bg-white shadow-[-12px_0_32px_-20px_rgba(15,23,42,0.25)] lg:w-[380px] xl:w-[400px]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ShoppingBag size={17} strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold leading-tight text-slate-900">
              Keranjang
            </h2>
            <p className="text-[11px] text-slate-400">Pesanan saat ini</p>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600">
          {cart.length} item
        </span>
      </header>

      {/* Daftar item */}
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-slate-50/70 p-3.5 [scrollbar-width:thin]">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-300 ring-1 ring-slate-200">
              <ShoppingBag size={26} strokeWidth={1.5} />
            </span>
            <p className="text-sm font-semibold text-slate-700">
              Keranjang masih kosong
            </p>
            <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-slate-400">
              Pilih produk dari katalog untuk mulai menambahkan pesanan.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onIncrease={handleIncrease}
              onDecrease={decreaseQuantity}
              onRemove={removeFromCart}
            />
          ))
        )}
      </div>

      {/* Checkout */}
      <div className="border-t border-slate-200/80 bg-white px-5 pb-5 pt-4">
        {/* Member & voucher */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Scan NIS atau kode member"
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              aria-label="Kode member"
              className={inputClass}
            />
            <button type="button" className={inlineBtnClass}>
              Cek
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Kode voucher diskon"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              aria-label="Kode voucher"
              className={`${inputClass} uppercase placeholder:normal-case`}
            />
            <button type="button" className={inlineBtnClass}>
              Gunakan
            </button>
          </div>
        </div>

        {/* Ringkasan */}
        <dl className="mt-5 space-y-2 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="font-medium tabular-nums text-slate-800">
              {formatRupiah(total)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Diskon</dt>
            <dd className="font-medium tabular-nums text-emerald-600">
              - Rp 0
            </dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-dashed border-slate-200 pt-3">
            <dt className="text-sm font-semibold text-slate-900">
              Total bayar
            </dt>
            <dd className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
              {formatRupiah(total)}
            </dd>
          </div>
        </dl>

        {/* Aksi */}
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={clearCart}
            disabled={isEmpty || isProcessing}
            title="Kosongkan keranjang"
            aria-label="Kosongkan keranjang"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-slate-400 ring-1 ring-slate-200 outline-none transition hover:bg-red-50 hover:text-red-500 hover:ring-red-200 focus-visible:ring-2 focus-visible:ring-red-400 disabled:pointer-events-none disabled:opacity-40"
          >
            <Trash2 size={18} strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onOpenPayment}
            disabled={isEmpty || isProcessing}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] outline-none transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:scale-[0.985] disabled:pointer-events-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {isProcessing ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CreditCard size={17} strokeWidth={1.75} />
                Proses pembayaran
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
