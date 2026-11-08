import { useState, useMemo } from "react";
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  RefreshCw,
  Package,
} from "lucide-react";
import {
  useKatalogProducts,
  useKatalogCategories,
} from "../../hooks/siswa/useStudentTransactions";
import { useStudentCartStore } from "../../store/studentCartStore";
import { formatRupiah } from "../../utils/formatters";
import { resolveFileUrl } from "../../utils/imageUrl";
import CartDrawerModal from "../../components/siswa/CartDrawerModal";
import OrderSuccessModal from "../../components/siswa/OrderSuccessModal";
import Button from "../../components/ui/Button";

export default function SiswaKatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  const { data: products = [], isLoading, isFetching, refetch } =
    useKatalogProducts();
  const { data: categories = [] } = useKatalogCategories();

  const {
    cart,
    addToCart,
    updateQuantity,
    getTotalItems,
    getSubtotal,
  } = useStudentCartStore();

  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  // Filter produk berdasarkan pencarian & kategori
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (item.isActive === false) return false;

      const matchesSearch =
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategoryId === "ALL" ||
        item.categoryId === selectedCategoryId ||
        item.category?.id === selectedCategoryId;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategoryId]);

  const handleOrderSuccess = (order) => {
    setSuccessOrder(order);
  };

  return (
    <div className="space-y-4 pb-20 relative">
      {/* Header Katalog */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-primary" size={20} />
            Katalog YasixMerch
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pesan perlengkapan sekolah dan ATK online, bayar dan ambil di kasir YasixMerch.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-primary hover:border-primary/30 transition-colors shrink-0 cursor-pointer"
          title="Segarkan Katalog"
          aria-label="Segarkan katalog"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Bar Pencarian */}
      <div className="relative">
        <label htmlFor="katalog-search-input" className="sr-only">
          Cari perlengkapan sekolah
        </label>
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="katalog-search-input"
          type="text"
          placeholder="Cari buku, pulpen, seragam, KIK..."
          aria-label="Cari buku, pulpen, seragam, KIK"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-2xs transition-all"
        />
      </div>

      {/* Filter Kategori Horizontal */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
        <button
          type="button"
          onClick={() => setSelectedCategoryId("ALL")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-[11px] cursor-pointer ${
            selectedCategoryId === "ALL"
              ? "bg-primary text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua Produk
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-[11px] cursor-pointer ${
              selectedCategoryId === cat.id
                ? "bg-primary text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid Produk */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 bg-white rounded-3xl border border-slate-200">
          <RefreshCw size={22} className="animate-spin text-primary" />
          <span>Memuat etalase produk...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-14 px-4 bg-white rounded-3xl border border-slate-200 text-center text-xs space-y-2">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Package size={24} />
          </div>
          <p className="font-bold text-slate-800 text-sm">
            Produk Tidak Ditemukan
          </p>
          <p className="text-slate-400 max-w-xs mx-auto text-[11px]">
            Coba kata kunci lain atau pilih kategori yang berbeda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => {
            const cartItem = cart.find((i) => i.productId === product.id);
            const inCartQty = cartItem ? cartItem.quantity : 0;
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;

            const imageUrl = resolveFileUrl(product.imageUrl);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all group"
              >
                {/* Gambar Produk */}
                <div className="w-full aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <ShoppingBag size={32} className="text-slate-300" />
                  )}

                  {/* Tag Kategori */}
                  {product.category?.name && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[9px] font-bold text-slate-600 shadow-2xs">
                      {product.category.name}
                    </span>
                  )}

                  {/* Badge Stok Habis / Menipis */}
                  {isOutOfStock ? (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-danger text-white text-[9px] font-extrabold shadow-2xs">
                      Habis
                    </span>
                  ) : isLowStock ? (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-accent text-dark text-[9px] font-extrabold shadow-2xs">
                      Sisa {product.stock}
                    </span>
                  ) : null}
                </div>

                {/* Deskripsi & Harga */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Stok: {product.stock}
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-sm font-black text-primary block">
                      {formatRupiah(product.sellingPrice)}
                    </span>

                    {/* Tombol Aksi Keranjang */}
                    {isOutOfStock ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2 bg-slate-100 text-slate-400 text-[11px] font-bold rounded-xl cursor-not-allowed"
                      >
                        Habis
                      </button>
                    ) : inCartQty > 0 ? (
                      <div className="flex items-center justify-between bg-primary/10 rounded-xl p-1 border border-primary/20">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product.id, inCartQty - 1)
                          }
                          aria-label="Kurangi jumlah dalam keranjang"
                          className="w-8 h-8 rounded-lg bg-white text-primary flex items-center justify-center shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-black text-primary px-1">
                          {inCartQty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product.id, inCartQty + 1)
                          }
                          disabled={inCartQty >= product.stock}
                          aria-label="Tambah jumlah dalam keranjang"
                          className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-2xs hover:bg-primary-hover disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => addToCart(product, 1)}
                        className="w-full py-2 text-[11px] font-bold rounded-xl gap-1 shadow-2xs"
                      >
                        <Plus size={13} />
                        <span>Pesan</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Bar (Bisa dioperasikan keyboard) */}
      {totalItems > 0 && (
        <div className="fixed bottom-16 sm:bottom-18 left-1/2 -translate-x-1/2 w-full max-w-lg px-3 z-30 animate-in slide-in-from-bottom duration-200">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Buka keranjang belanja: ${totalItems} item seharga ${formatRupiah(subtotal)}`}
            className="w-full bg-primary text-white p-3 rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-between cursor-pointer border border-white/20 hover:bg-primary-hover transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-dark font-black text-[10px] flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              </div>
              <div className="leading-tight">
                <span className="text-xs font-extrabold block">
                  {formatRupiah(subtotal)}
                </span>
                <span className="text-[10px] text-sky block">
                  {totalItems} item dalam keranjang
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-primary font-bold text-xs shadow-xs">
              <ShoppingBag size={13} />
              <span>Checkout</span>
            </div>
          </button>
        </div>
      )}

      {/* Modal Keranjang */}
      <CartDrawerModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Modal Tiket Sukses */}
      <OrderSuccessModal
        isOpen={Boolean(successOrder)}
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
      />
    </div>
  );
}
