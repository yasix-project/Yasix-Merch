import { useState } from "react";
import { ImageOff, Plus } from "lucide-react";
import { formatRupiah } from "../../utils/formatters";
import { resolveFileUrl } from "../../utils/imageUrl";

export default function ProductCard({ product, onAddToCart }) {
  const [imgFailed, setImgFailed] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= (product.minStock ?? 5);
  const fullImageUrl = resolveFileUrl(product.imageUrl);
  const showImage = fullImageUrl && !imgFailed;

  const handleActivate = () => {
    if (!isOutOfStock) onAddToCart(product);
  };

  return (
    <div
      role="button"
      tabIndex={isOutOfStock ? -1 : 0}
      aria-disabled={isOutOfStock}
      aria-label={`${product.name}, ${formatRupiah(Number(product.sellingPrice))}${
        isOutOfStock ? ", stok habis" : ""
      }`}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleActivate();
        }
      }}
      className={`group relative flex flex-col rounded-2xl sm:rounded-[22px] bg-white p-2 sm:p-2.5 ring-1 select-none outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-600 ${
        isOutOfStock
          ? "ring-slate-200/90 cursor-not-allowed bg-slate-50/60 opacity-75"
          : "ring-slate-200/80 cursor-pointer shadow-xs hover:-translate-y-0.5 hover:ring-blue-300/80 hover:shadow-md hover:shadow-slate-200/60 active:translate-y-0 active:scale-[0.98]"
      }`}
    >
      {/* Gambar Produk */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/70">
        {showImage ? (
          <img
            src={fullImageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className={`h-full w-full object-cover transition-transform duration-500 ease-out ${
              isOutOfStock ? "grayscale opacity-50" : "group-hover:scale-105"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageOff size={26} strokeWidth={1.5} />
          </div>
        )}

        {/* Indikator Stok Badge */}
        <span
          className={`absolute left-1.5 sm:left-2 top-1.5 sm:top-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 sm:py-1 text-[10px] sm:text-[10.5px] font-bold shadow-xs backdrop-blur-md ${
            isOutOfStock
              ? "bg-red-500 text-white"
              : isLowStock
              ? "bg-amber-500 text-white"
              : "bg-white/95 text-slate-700 border border-slate-200/60"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOutOfStock
                ? "bg-white"
                : isLowStock
                ? "bg-white animate-ping"
                : "bg-emerald-500"
            }`}
          />
          <span>
            {isOutOfStock
              ? "Habis"
              : isLowStock
              ? `Sisa ${product.stock}`
              : `${product.stock} pcs`}
          </span>
        </span>
      </div>

      {/* Informasi Produk */}
      <div className="flex flex-1 flex-col px-1 pb-0.5 pt-2 sm:pt-2.5">
        <p className="truncate text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {product.category?.name || "Umum"}
        </p>

        <h3
          className={`mt-0.5 line-clamp-2 min-h-[2.2rem] sm:min-h-[2.5rem] text-xs sm:text-[13px] font-bold leading-snug sm:leading-5 ${
            isOutOfStock ? "text-slate-400" : "text-slate-800 group-hover:text-blue-700 transition-colors"
          }`}
        >
          {product.name}
        </h3>

        {product.barcode && (
          <p className="mt-0.5 truncate font-mono text-[9.5px] sm:text-[10px] text-slate-400">
            {product.barcode}
          </p>
        )}

        <div className="mt-2.5 sm:mt-3 flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
          <div>
            <span
              className={`text-sm sm:text-base font-black tabular-nums tracking-tight ${
                isOutOfStock ? "text-slate-400 line-through" : "text-slate-900"
              }`}
            >
              {formatRupiah(Number(product.sellingPrice))}
            </span>
          </div>

          {!isOutOfStock && (
            <span
              aria-hidden="true"
              className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-slate-900 text-white shadow-xs transition-all duration-200 group-hover:bg-blue-600 group-hover:scale-105 active:scale-95"
            >
              <Plus size={15} strokeWidth={2.5} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
