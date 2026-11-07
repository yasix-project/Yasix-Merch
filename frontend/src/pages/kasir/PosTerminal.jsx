import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Search,
  PackageX,
  Camera,
  QrCode,
  AlertTriangle,
  Keyboard,
  ShoppingBag,
  ArrowRight,
  X,
} from "lucide-react";

import { useProducts } from "../../hooks/admin/useProducts";
import { useCategories } from "../../hooks/admin/useCategories";
import { useTransactionMutations } from "../../hooks/admin/useTransactions";
import { usePosStore } from "../../store/posStore";
import { useShiftStore } from "../../store/shiftStore";
import { useAuthStore } from "../../store/authStore";

import ProductCard from "../../components/kasir/ProductCard";
import PosCart from "../../components/kasir/PosCart";
import PaymentModal from "../../components/kasir/PaymentModal";
import ReceiptModal from "../../components/kasir/ReceiptModal";
import StrukPrinter from "../../components/shared/StrukPrinter";
import BarcodeScannerModal from "../../components/shared/BarcodeScannerModal";
import { showSuccessToast, showErrorToast, showWarningToast } from "../../utils/toast";
import { formatRupiah } from "../../utils/formatters";

export default function PosTerminal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [memberCode, setMemberCode] = useState("");
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [showLowStockBanner, setShowLowStockBanner] = useState(true);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [latestTransaction, setLatestTransaction] = useState(null);
  const [printData, setPrintData] = useState([]);
  const strukRef = useRef();
  const searchInputRef = useRef(null);

  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: categories = [] } = useCategories();
  const { create: createTransaction } = useTransactionMutations();

  const user = useAuthStore((state) => state.user);
  const activeShift = useShiftStore((state) => state.activeShift);
  const { cart, addToCart, clearCart, getCartTotal } = usePosStore();

  const subtotal = getCartTotal();
  const effectiveDiscount = cart.length === 0 ? 0 : discountAmount;
  const finalTotal = Math.max(0, subtotal - effectiveDiscount);
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handlePrint = useReactToPrint({
    content: () => strukRef.current,
    documentTitle: "Struk_Kasir_Yasix",
  });

  const handleCloseReceipt = () => {
    setIsReceiptModalOpen(false);
    setLatestTransaction(null);
    setPrintData([]);
    clearCart();
    setMemberCode("");
    setVerifiedStudent(null);
    setVoucherCode("");
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setIsMobileCartOpen(false);
  };

  // Global Keyboard Shortcuts (Enterprise POS Workflow)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F2 / Ctrl+K: Fokus ke input pencarian produk
      if (e.key === "F2" || (e.ctrlKey && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      // F4: Buka modal pembayaran (Checkout)
      if (e.key === "F4") {
        e.preventDefault();
        if (
          cart.length > 0 &&
          !isPaymentModalOpen &&
          !isReceiptModalOpen &&
          !isBarcodeScannerOpen
        ) {
          setIsPaymentModalOpen(true);
        } else if (cart.length === 0) {
          showWarningToast("Keranjang belanja masih kosong.");
        }
        return;
      }

      // F9 / Ctrl+B: Toggle webcam barcode scanner
      if (e.key === "F9" || (e.ctrlKey && e.key.toLowerCase() === "b")) {
        e.preventDefault();
        setIsBarcodeScannerOpen((prev) => !prev);
        return;
      }

      // Escape: Tutup modal yang sedang terbuka
      if (e.key === "Escape") {
        if (isBarcodeScannerOpen) {
          setIsBarcodeScannerOpen(false);
        } else if (isPaymentModalOpen) {
          setIsPaymentModalOpen(false);
        } else if (isMobileCartOpen) {
          setIsMobileCartOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart.length, isPaymentModalOpen, isReceiptModalOpen, isBarcodeScannerOpen, isMobileCartOpen]);

  // Evaluasi stok menipis (<= 5 atau <= minStock)
  const lowStockProducts = products.filter(
    (p) => p.isActive !== false && p.stock > 0 && p.stock <= (p.minStock ?? 5)
  );

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
    if (product.stock <= 0) {
      showErrorToast(`Stok ${product.name} telah habis!`);
      return;
    }
    const currentInCart =
      cart.find((item) => item.productId === product.id)?.quantity || 0;
    if (currentInCart + 1 > product.stock) {
      showErrorToast(
        `Jumlah melebihi stok yang tersedia (${product.stock} pcs)!`
      );
      return;
    }
    addToCart({
      ...product,
      id: product.id,
      name: product.name,
      stock: product.stock,
      sellingPrice: Number(product.sellingPrice),
      price: Number(product.sellingPrice),
    });
    if (product.stock <= (product.minStock ?? 5)) {
      showWarningToast(
        `⚠️ Sisa stok ${product.name} menipis (${product.stock - (currentInCart + 1)} pcs).`
      );
    }
  };

  const handleBarcodeScan = (scannedCode) => {
    if (!scannedCode) return;
    const cleanCode = scannedCode.trim();

    // Temukan produk berdasarkan barcode atau ID
    const product = products.find(
      (p) =>
        p.isActive !== false &&
        (p.barcode === cleanCode ||
          p.id === cleanCode ||
          p.name?.toLowerCase() === cleanCode.toLowerCase())
    );

    if (product) {
      if (product.stock <= 0) {
        showErrorToast(`Stok ${product.name} telah habis!`);
        return;
      }
      handleAddToCart(product);
      showSuccessToast(`+1 ${product.name} dimasukkan ke keranjang`);
    } else {
      showErrorToast(`Produk dengan barcode/kode "${cleanCode}" tidak ditemukan.`);
    }
  };

  const handleProcessPayment = async (paymentDetails) => {
    const payload = {
      paymentMethod: paymentDetails.paymentMethod || "CASH",
      payAmount: Number(paymentDetails.payAmount),
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    if (memberCode?.trim()) payload.studentNis = memberCode.trim();
    if (appliedVoucher?.id || appliedVoucher?.voucherId) {
      payload.voucherId = appliedVoucher.id || appliedVoucher.voucherId;
    } else if (voucherCode?.trim()) {
      payload.voucherCode = voucherCode.trim();
    }
    if (activeShift?.id) payload.shiftId = activeShift.id;

    createTransaction.mutate(payload, {
      onSuccess: (res) => {
        setIsPaymentModalOpen(false);
        setIsMobileCartOpen(false);
        const savedTransaction = res?.data || res;
        const transactionForPrint = {
          ...savedTransaction,
          cashier: savedTransaction.cashier || { name: user?.name || "Kasir" },
          student: savedTransaction.student || verifiedStudent || null,
          items: savedTransaction.items?.length ? savedTransaction.items : cart,
        };
        setPrintData([transactionForPrint]);
        setLatestTransaction(transactionForPrint);
        setIsReceiptModalOpen(true);
        showSuccessToast("Transaksi berhasil diproses!");
      },
      onError: (err) => {
        const errorMsg =
          err.response?.data?.message ||
          "Gagal memproses transaksi. Cek kembali ketersediaan stok produk.";
        showErrorToast(errorMsg);
      },
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-slate-100 relative">
      <div className="hidden">
        <StrukPrinter ref={strukRef} transactions={printData} />
      </div>

      {/* Sisi Kiri: Katalog Produk */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-50 border-r border-slate-200/90 overflow-hidden relative">
        {/* Top Control Bar Katalog */}
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
                    handleBarcodeScan(searchQuery.trim());
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
              onClick={() => setIsBarcodeScannerOpen(true)}
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
              onClick={() => setIsMobileCartOpen(true)}
              className="lg:hidden relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition shrink-0 active:scale-95 border border-slate-200/80"
              title="Lihat Keranjang Belanja"
            >
              <ShoppingBag size={18} />
              {cart.length > 0 && (
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
          {lowStockProducts.length > 0 && showLowStockBanner && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  <strong>Peringatan Kasir:</strong> Ada {lowStockProducts.length} produk dengan stok menipis (≤ 5 pcs).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowLowStockBanner(false)}
                className="text-[11px] text-amber-700 hover:text-amber-950 font-bold ml-2 underline cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}
        </div>

        {/* Grid Katalog Produk */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 pb-24 lg:pb-4 [scrollbar-width:thin]">
          {loadingProducts ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              <span className="animate-pulse font-medium text-sm">
                Memuat katalog Yasix Merch...
              </span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center text-slate-400 text-center py-12">
              <PackageX size={48} className="mb-2 text-slate-300" strokeWidth={1.5} />
              <p className="font-bold text-slate-700 text-sm">
                Produk tidak ditemukan
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Coba sesuaikan kata kunci pencarian atau ganti kategori.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3.5">
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

        {/* Bar Shortcut Keyboard Enterprise Kasir (Desktop Only) */}
        <div className="hidden sm:flex px-4 py-2 bg-white border-t border-slate-200/80 items-center justify-between text-[11px] text-slate-500 shrink-0 shadow-2xs">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-0.5">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <Keyboard size={13} className="text-slate-400" /> Kasir Cepat:
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
                F2
              </kbd>
              <span>Cari</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
                F4
              </kbd>
              <span>Bayar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
                F9
              </kbd>
              <span>Scan Barcode</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
                Esc
              </kbd>
              <span>Tutup Modal</span>
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hidden md:inline">
            ● Retail POS Aktif
          </span>
        </div>
      </div>

      {/* Floating Mobile Cart Bar (Hanya tampil di Mobile saat ada barang di keranjang) */}
      {cart.length > 0 && !isMobileCartOpen && (
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
                  {cart.length} Item • {totalCartItems} Pcs
                </p>
                <p className="text-base font-black text-white tracking-tight truncate leading-tight mt-0.5">
                  {formatRupiah(finalTotal)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileCartOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 px-3.5 py-2.5 text-xs font-bold text-white transition shadow-md shadow-blue-600/30 shrink-0"
            >
              <span>Keranjang & Bayar</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Sisi Kanan: Panel Keranjang Kasir (Side-by-side di Desktop, Drawer di Mobile) */}
      <PosCart
        memberCode={memberCode}
        setMemberCode={setMemberCode}
        verifiedStudent={verifiedStudent}
        setVerifiedStudent={setVerifiedStudent}
        voucherCode={voucherCode}
        setVoucherCode={setVoucherCode}
        appliedVoucher={appliedVoucher}
        setAppliedVoucher={setAppliedVoucher}
        discountAmount={discountAmount}
        setDiscountAmount={setDiscountAmount}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
        isProcessing={createTransaction.isPending}
        isMobileOpen={isMobileCartOpen}
        onCloseMobile={() => setIsMobileCartOpen(false)}
      />

      {/* Modal Pembayaran */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={finalTotal}
        onProcessPayment={handleProcessPayment}
        isProcessing={createTransaction.isPending}
      />

      {/* Modal Struk Thermal di Layar Kasir */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={handleCloseReceipt}
        transaction={latestTransaction}
        onPrint={handlePrint}
      />

      {/* Modal Scan Barcode Produk via Webcam */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onScan={handleBarcodeScan}
        title="Scan Barcode Produk (Webcam)"
        description="Arahkan barcode produk ke webcam laptop. Scanner akan otomatis mendeteksi dan memasukkan produk ke keranjang kasir."
        continuous={true}
      />
    </div>
  );
}
