import { X, Plus, Minus } from "lucide-react";
import { formatRupiah } from "../../utils/formatters";

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const unitPrice = Number(item.price) || 0;
  const subtotal = unitPrice * item.quantity;
  const isMaxStock =
    item.maxStock !== undefined && item.quantity >= item.maxStock;

  const stepperBtn =
    "flex h-7 w-7 items-center justify-center rounded-full text-slate-500 outline-none transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-90 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="group rounded-2xl bg-white p-3.5 ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:ring-slate-300 hover:shadow-[0_10px_24px_-14px_rgba(15,23,42,0.25)]">
      {/* Nama, harga satuan, dan tombol hapus */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-[13px] font-semibold leading-5 text-slate-800">
            {item.itemName}
          </h4>
          <p className="mt-0.5 text-[11px] tabular-nums text-slate-400">
            {formatRupiah(unitPrice)} per pcs
          </p>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-300 outline-none transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-400"
          title="Hapus dari keranjang"
          aria-label={`Hapus ${item.itemName} dari keranjang`}
        >
          <X size={15} strokeWidth={2} />
        </button>
      </div>

      {/* Pengatur jumlah dan subtotal */}
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center rounded-full bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => onDecrease(item.productId)}
              className={stepperBtn}
              title="Kurangi jumlah"
              aria-label="Kurangi jumlah"
            >
              <Minus size={13} strokeWidth={2.5} />
            </button>

            <span
              className="w-8 select-none text-center text-[13px] font-bold tabular-nums text-slate-900"
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
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>

          {isMaxStock && (
            <p className="mt-1 pl-1 text-[10.5px] text-amber-600">
              Batas stok tercapai
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-[11px] text-slate-400">Subtotal</p>
          <p className="text-[15px] font-bold tabular-nums tracking-tight text-slate-900">
            {formatRupiah(subtotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
