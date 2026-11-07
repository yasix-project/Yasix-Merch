import { Search, X, Camera, QrCode, ShoppingBag, AlertTriangle } from "lucide-react";

export default function PosProductFilter({
  searchInputRef,
  searchQuery,
  setSearchQuery,
  onSearchEnter,
  onOpenScanner,
  cartCount = 0,
  totalCartItems = 0,
  onOpenMobileCart,
  categories = [],
  selectedCategory = "Semua",
  setSelectedCategory,
  lowStockCount = 0,
  showLowStockBanner = true,
  onDismissLowStockBanner,
}) {
  return (
    <div className="p-3 sm:p-4 bg-white border-b border-slate-200/90 shadow-2xs z-10 space-y-2.5 sm:space-y-3 shrink-0">
      <div className="flex items-center gap-2">
        {/* Input Pencarian Produk */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={17}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari nama, SKU, atau Barcode..."
            className="w-full pl-10 pr-16 sm:pr-20 py-2 sm:py-2.5 bg-slate-100/90 border border-slate-200/80 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-xs sm:text-sm font-medium outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                onSearchEnter(searchQuery.trim());
                setSearchQuery("");
              }
            }}
            autoFocus
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
                title="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-300 pointer-events-none hidden sm:inline">
              F2
            </span>
          </div>
        </div>

        {/* Tombol Scanner Webcam */}
        <button
          type="button"
          onClick={onOpenScanner}
          title="Scan Barcode via Webcam [F9]"
          className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-all shrink-0 active:scale-95 shadow-2xs"
        >
          <Camera size={15} className="text-blue-600" />
          <span className="hidden md:inline">Scan Webcam</span>
          <span className="text-[10px] font-mono text-blue-600 bg-blue-100 px-1 py-0.5 rounded font-bold hidden sm:inline">
            F9
          </span>
        </button>

        {/* Tombol Demo Barcode HP */}
        <a
          href="/demo"
          target="_blank"
          rel="noopener noreferrer"
          title="Buka Lembar Barcode Produk & KTA Siswa untuk diarahkan ke Webcam"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all shrink-0 active:scale-95 shadow-2xs"
        >
          <QrCode size={15} className="text-emerald-600" />
          <span className="hidden xl:inline">📱 Barcode HP (/demo)</span>
          <span className="xl:hidden">📱 Barcode</span>
        </a>

        {/* Tombol Keranjang Mobile di Header */}
        <button
          type="button"
          onClick={onOpenMobileCart}
          className="lg:hidden relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition shrink-0 active:scale-95 border border-slate-200/80"
          title="Lihat Keranjang Belanja"
        >
          <ShoppingBag size={18} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white px-1 shadow-xs animate-pulse">
              {totalCartItems}
            </span>
          )}
        </button>
      </div>

      {/* Baris Kategori Produk (Horizontal Touch Scroll) */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory("Semua")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === "Semua"
              ? "bg-blue-600 text-white shadow-xs shadow-blue-500/30 ring-2 ring-blue-600/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
          }`}
        >
          Semua Produk
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.name
                ? "bg-blue-600 text-white shadow-xs shadow-blue-500/30 ring-2 ring-blue-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Banner Peringatan Stok Menipis */}
      {lowStockCount > 0 && showLowStockBanner && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              <strong>Peringatan Kasir:</strong> Ada {lowStockCount} produk dengan stok menipis (≤ 5 pcs).
            </span>
          </div>
          <button
            type="button"
            onClick={onDismissLowStockBanner}
            className="text-[11px] text-amber-700 hover:text-amber-950 font-bold ml-2 underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
