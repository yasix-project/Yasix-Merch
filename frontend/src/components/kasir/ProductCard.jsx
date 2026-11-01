import { ShoppingCart, Plus, Barcode, Tag } from "lucide-react";
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
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= (product.minStock || 10);
  const fullImageUrl = resolveImageUrl(product.imageUrl);

  return (
    <div
      onClick={() => !isOutOfStock && onAddToCart(product)}
      className={`group relative flex flex-col bg-white rounded-2xl border p-3 transition-all select-none ${
        isOutOfStock
          ? "border-slate-200 opacity-60 grayscale cursor-not-allowed bg-slate-50"
          : "border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer active:scale-[0.98]"
      }`}
    >
      {/* Badge Atas: Kategori & Status Stok */}
      <div className="flex items-center justify-between gap-1 mb-2 z-10">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 truncate max-w-[55%]">
          <Tag size={10} className="shrink-0 text-slate-400" />
          <span className="truncate">{product.category?.name || "Umum"}</span>
        </span>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
            isOutOfStock
              ? "bg-red-50 text-red-600 border border-red-200"
              : isLowStock
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {isOutOfStock
            ? "Habis"
            : isLowStock
              ? `Sisa ${product.stock}`
              : `Stok: ${product.stock}`}
        </span>
      </div>

      {/* Thumbnail Produk */}
      <div className="w-full h-28 bg-slate-100 rounded-xl mb-2.5 flex items-center justify-center overflow-hidden relative border border-slate-100">
        {fullImageUrl ? (
          <>
            <img
              src={fullImageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.nextElementSibling) {
                  e.target.nextElementSibling.style.display = "flex";
                }
              }}
            />
            <div className="hidden absolute inset-0 items-center justify-center bg-slate-100 text-slate-300">
              <ShoppingCart size={28} className="opacity-40" />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center text-slate-300">
            <ShoppingCart size={28} className="opacity-40" />
          </div>
        )}
      </div>

      {/* Info Produk & Harga */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {product.barcode && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mb-1">
              <Barcode size={12} className="text-slate-400" />
              <span>{product.barcode}</span>
            </div>
          )}
          <h3 className="font-semibold text-xs text-slate-800 line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-extrabold text-blue-600">
            {formatRupiah(Number(product.sellingPrice))}
          </span>
          {!isOutOfStock && (
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
              <Plus size={14} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
