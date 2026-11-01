import { Trash2, Plus, Minus } from "lucide-react";
import { formatRupiah } from "../../utils/formatters";

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-semibold text-xs text-slate-800 leading-tight flex-1">
          {item.itemName}
        </h4>
        <button
          onClick={() => onRemove(item.productId)}
          className="text-slate-300 hover:text-red-500 transition-colors p-0.5"
          title="Hapus Item"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-0.5">
        <div className="text-xs font-extrabold text-blue-600">
          {formatRupiah(Number(item.price))}
        </div>

        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => onDecrease(item.productId)}
            className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-xs text-slate-600 hover:text-blue-600 active:scale-95"
          >
            <Minus size={12} />
          </button>
          <span className="text-xs font-bold w-4 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onIncrease(item)}
            className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-xs text-slate-600 hover:text-blue-600 active:scale-95"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
