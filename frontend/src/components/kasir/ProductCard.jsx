import { useState } from "react";
import { ImageOff, Plus } from "lucide-react";
import { formatRupiah } from "../../utils/formatters";

const BACKEND_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") ||
  "http://localhost:5000";

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function ProductCard({ product, onAddToCart }) {
  const [imgFailed, setImgFailed] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= (product.minStock ?? 10);
  const fullImageUrl = resolveImageUrl(product.imageUrl);
  const showImage = fullImageUrl && !imgFailed;

  const handleActivate = () => {
    if (!isOutOfStock) onAddToCart(product);
  };

  const stockTone = isLowStock
    ? { dot: "bg-amber-500", text: "text-amber-700" }
    : { dot: "bg-emerald-500", text: "text-slate-600" };

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
      className={`group relative flex flex-col rounded-[20px] bg-white p-2.5 ring-1 select-none outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-600 ${
        isOutOfStock
          ? "ring-slate-200 cursor-not-allowed"
          : "ring-slate-200/80 cursor-pointer shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:ring-slate-300 hover:shadow-[0_14px_28px_-14px_rgba(15,23,42,0.28)] active:translate-y-0 active:scale-[0.985]"
      }`}
    >
      {/* Gambar produk */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100">
        {showImage ? (
          <img
            src={fullImageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className={`h-full w-full object-cover transition-transform duration-500 ease-out ${
              isOutOfStock ? "grayscale opacity-60" : "group-hover:scale-[1.06]"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageOff size={26} strokeWidth={1.5} />
          </div>
        )}

        {/* Indikator stok melayang di atas gambar */}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 text-[10.5px] font-medium shadow-sm backdrop-blur-md">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOutOfStock ? "bg-red-500" : stockTone.dot
            }`}
          />
          <span className={isOutOfStock ? "text-red-600" : stockTone.text}>
            {isOutOfStock
              ? "Habis"
              : isLowStock
                ? `Sisa ${product.stock}`
                : `${product.stock} tersedia`}
          </span>
        </span>
      </div>

      {/* Informasi produk */}
      <div className="flex flex-1 flex-col px-1 pb-0.5 pt-3">
        <p className="truncate text-[11px] font-medium tracking-wide text-slate-400">
          {product.category?.name || "Umum"}
        </p>

        <h3
          className={`mt-0.5 line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-5 ${
            isOutOfStock ? "text-slate-400" : "text-slate-800"
          }`}
        >
          {product.name}
        </h3>

        {product.barcode && (
          <p className="mt-1 truncate font-mono text-[10px] text-slate-400">
            {product.barcode}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={`text-[15px] font-bold tabular-nums tracking-tight ${
              isOutOfStock ? "text-slate-400" : "text-slate-900"
            }`}
          >
            {formatRupiah(Number(product.sellingPrice))}
          </span>

          {!isOutOfStock && (
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition-all duration-300 group-hover:bg-blue-600 group-hover:rotate-90"
            >
              <Plus size={16} strokeWidth={2.25} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
