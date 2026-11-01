import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { Search, PackageX } from "lucide-react";

import { useProducts } from "../../hooks/admin/useProducts";
import { useCategories } from "../../hooks/admin/useCategories";
import { useTransactionMutations } from "../../hooks/admin/useTransactions";
import { usePosStore } from "../../store/posStore";
import { useShiftStore } from "../../store/shiftStore";
import { useAuthStore } from "../../store/authStore";

import ProductCard from "../../components/kasir/ProductCard";
import PosCart from "../../components/kasir/PosCart";
import PaymentModal from "../../components/kasir/PaymentModal";
import StrukPrinter from "../../components/shared/StrukPrinter";

export default function PosTerminal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [memberCode, setMemberCode] = useState("");
  const [voucherCode, setVoucherCode] = useState("");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [printData, setPrintData] = useState([]);
  const strukRef = useRef();

  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: categories = [] } = useCategories();
  const { create: createTransaction } = useTransactionMutations();

  const user = useAuthStore((state) => state.user);
  const activeShift = useShiftStore((state) => state.activeShift);
  const { cart, addToCart, clearCart, getCartTotal } = usePosStore();

  const handlePrint = useReactToPrint({
    content: () => strukRef.current,
    documentTitle: "Struk_Kasir_Yasix",
    onAfterPrint: () => {
      setPrintData([]);
      clearCart();
      setMemberCode("");
      setVoucherCode("");
    },
  });

  useEffect(() => {
    if (printData.length > 0) {
      handlePrint();
    }
  }, [printData, handlePrint]);

  const filteredProducts = products.filter((item) => {
    if (item.isActive === false) return false;
    const categoryName = item.category?.name || "";
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua" || categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      id: product.id,
      name: product.name,
      stock: product.stock,
      sellingPrice: Number(product.sellingPrice),
      price: Number(product.sellingPrice),
    });
  };

  const handleProcessPayment = async (paymentDetails) => {
    const payload = {
      paymentMethod: paymentDetails.paymentMethod,
      payAmount: Number(paymentDetails.payAmount),
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    if (memberCode?.trim()) payload.studentNis = memberCode.trim();
    if (voucherCode?.trim()) payload.voucherCode = voucherCode.trim();
    if (activeShift?.id) payload.shiftId = activeShift.id;

    createTransaction.mutate(payload, {
      onSuccess: (res) => {
        setIsPaymentModalOpen(false);
        const savedTransaction = res?.data || res;
        const transactionForPrint = {
          ...savedTransaction,
          cashier: savedTransaction.cashier || { name: user?.name || "Kasir" },
          items: savedTransaction.items?.length ? savedTransaction.items : cart,
        };
        setPrintData([transactionForPrint]);
      },
      onError: (err) => {
        const errorMsg =
          err.response?.data?.message ||
          "Gagal memproses transaksi. Cek kembali ketersediaan stok produk.";
        alert(errorMsg);
      },
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] -mt-4 -mx-4 lg:-mx-8 overflow-hidden bg-slate-100">
      <div className="hidden">
        <StrukPrinter ref={strukRef} transactions={printData} />
      </div>

      {/* Sisi Kiri: Katalog Produk */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 border-r border-slate-200">
        <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10 space-y-3">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari nama produk atau Scan Barcode..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("Semua")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === "Semua"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua Produk
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.name
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loadingProducts ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              <span className="animate-pulse font-medium text-sm">
                Memuat katalog Yasix Merch...
              </span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center text-slate-400 text-center">
              <PackageX size={44} className="mb-2 opacity-40 text-slate-500" />
              <p className="font-semibold text-slate-600 text-sm">
                Produk tidak ditemukan
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Coba sesuaikan kata kunci pencarian atau kategori.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sisi Kanan: Panel Keranjang */}
      <PosCart
        memberCode={memberCode}
        setMemberCode={setMemberCode}
        voucherCode={voucherCode}
        setVoucherCode={setVoucherCode}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
        isProcessing={createTransaction.isPending}
      />

      {/* Modal Pembayaran */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={getCartTotal()}
        onProcessPayment={handleProcessPayment}
        isProcessing={createTransaction.isPending}
      />
    </div>
  );
}
