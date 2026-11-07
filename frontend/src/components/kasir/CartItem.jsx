import { X, Plus, Minus } from "lucide-react";
import { formatRupiah } from "../../utils/formatters";

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const unitPrice = Number(item.price) || 0;
  const subtotal = unitPrice * item.quantity;
  const isMaxStock =
    item.maxStock !== undefined && item.quantity >= item.maxStock;

  const stepperBtn =
    "flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 outline-none transition-all hover:bg-white hover:text-slate-900 hover:shadow-xs focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-90 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="group rounded-2xl bg-white p-3 sm:p-3.5 ring-1 ring-slate-200/90 shadow-2xs transition-all duration-200 hover:ring-slate-300 hover:shadow-sm">
      {/* Nama, harga satuan, dan tombol hapus */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-xs sm:text-[13px] font-bold leading-snug sm:leading-5 text-slate-900">
            {item.itemName}
          </h4>
          <p className="mt-0.5 text-[11px] font-medium tabular-nums text-slate-400">
            {formatRupiah(unitPrice)} / pcs
          </p>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 outline-none transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-400 active:scale-95"
          title="Hapus item"
          aria-label={`Hapus ${item.itemName} dari keranjang`}
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>

      {/* Pengatur jumlah dan subtotal */}
      <div className="mt-2.5 flex items-end justify-between gap-2 pt-1 border-t border-slate-50">
        <div>
          <div className="inline-flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/60">
            <button
              type="button"
              onClick={() => onDecrease(item.productId)}
              className={stepperBtn}
              title="Kurangi jumlah"
              aria-label="Kurangi jumlah"
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>

            <span
              className="w-8 select-none text-center text-xs sm:text-[13px] font-bold tabular-nums text-slate-900 font-mono"
              aria-live="polite"
            >
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => onIncrease(item)}
              disabled={isMaxStock}
              className={stepperBtn}
              title={isMaxStock ? "Mencapai batas stok" : "Tambah jumlah"}
              aria-label="Tambah jumlah"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>

          {isMaxStock && (
            <p className="mt-1 text-[10px] font-semibold text-amber-600">
              Batas stok ({item.maxStock})
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Subtotal</p>
          <p className="text-sm sm:text-[15px] font-black tabular-nums tracking-tight text-blue-700">
            {formatRupiah(subtotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
