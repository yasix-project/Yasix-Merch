import { ShoppingCart, CreditCard, XCircle } from "lucide-react";
import Button from "../ui/Button";
import CartItem from "./CartItem";
import { formatRupiah } from "../../utils/formatters";
import { usePosStore } from "../../store/posStore";

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
    <div className="w-full lg:w-[380px] xl:w-[400px] flex flex-col bg-white shadow-xl z-20">
      {/* Header Keranjang */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-blue-400" />
          <h2 className="font-bold text-base">Keranjang Kasir</h2>
        </div>
        <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
          {cart.length} Item
        </span>
      </div>

      {/* Daftar Item */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
        {cart.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-slate-400">
            <ShoppingCart size={36} className="mb-2 opacity-25" />
            <p className="text-xs font-semibold text-slate-600">
              Keranjang masih kosong
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Klik produk pada katalog untuk memasukkan pesanan
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

      {/* Panel Checkout & Voucher */}
      <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="mb-3 pb-3 border-b border-slate-200 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Scan NIS / Kode Member"
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <Button
              size="sm"
              variant="secondary"
              className="px-3 bg-slate-100 text-xs"
            >
              Cek
            </Button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Kode Voucher Diskon"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none uppercase"
            />
            <Button
              size="sm"
              variant="secondary"
              className="px-3 bg-slate-100 text-xs text-blue-600 font-bold border-blue-200"
            >
              Gunakan
            </Button>
          </div>
        </div>

        <div className="space-y-1.5 mb-3 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-bold text-slate-800">
              {formatRupiah(getCartTotal())}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Diskon</span>
            <span className="font-bold text-emerald-600">- Rp 0</span>
          </div>
          <div className="border-t border-dashed border-slate-300 my-2 pt-2 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Total Bayar
            </span>
            <span className="text-xl font-black text-blue-600 tracking-tight">
              {formatRupiah(getCartTotal())}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearCart}
            disabled={cart.length === 0 || isProcessing}
            className="px-3 text-red-500 hover:bg-red-50 hover:border-red-200 disabled:opacity-50"
            title="Kosongkan Keranjang"
          >
            <XCircle size={18} />
          </Button>

          <Button
            onClick={onOpenPayment}
            disabled={cart.length === 0 || isProcessing}
            className="flex-1 py-3 text-sm bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25"
          >
            <CreditCard size={17} className="mr-2" />
            Proses Pembayaran
          </Button>
        </div>
      </div>
    </div>
  );
}
