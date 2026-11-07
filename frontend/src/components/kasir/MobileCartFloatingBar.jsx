import { ShoppingBag, ArrowRight } from "lucide-react";
import { formatRupiah } from "../../utils/formatters";

export default function MobileCartFloatingBar({
  isVisible = false,
  cartLength = 0,
  totalCartItems = 0,
  finalTotal = 0,
  onOpenMobileCart,
}) {
  if (!isVisible || cartLength === 0) return null;

  return (
    <div className="lg:hidden fixed bottom-20 left-3 right-3 sm:left-4 sm:right-4 z-30 animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center justify-between rounded-2xl bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-md border border-slate-700/80 ring-1 ring-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30">
              <ShoppingBag size={18} />
            </span>
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[10px] font-black px-1 shadow-xs">
              {totalCartItems}
            </span>
          </div>
          <div className="truncate">
            <p className="text-[11px] text-slate-400 font-medium leading-tight">
              {cartLength} Item • {totalCartItems} Pcs
            </p>
            <p className="text-base font-black text-white tracking-tight truncate leading-tight mt-0.5">
              {formatRupiah(finalTotal)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenMobileCart}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 px-3.5 py-2.5 text-xs font-bold text-white transition shadow-md shadow-blue-600/30 shrink-0"
        >
          <span>Keranjang & Bayar</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
