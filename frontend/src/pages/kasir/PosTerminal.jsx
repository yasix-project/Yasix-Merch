import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { PackageX } from "lucide-react";

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
import PosProductFilter from "../../components/kasir/PosProductFilter";
import MobileCartFloatingBar from "../../components/kasir/MobileCartFloatingBar";
import PosKeyboardShortcuts from "../../components/kasir/PosKeyboardShortcuts";
import StrukPrinter from "../../components/shared/StrukPrinter";
import BarcodeScannerModal from "../../components/shared/BarcodeScannerModal";
import { showSuccessToast, showErrorToast, showWarningToast } from "../../utils/toast";

export default function PosTerminal() {
  const navigate = useNavigate();
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

    // Jika yang di-scan adalah Barcode/QR Invoice Pesanan Pre-Order (ORD-...)
    if (cleanCode.toUpperCase().startsWith("ORD-")) {
      showSuccessToast(`Mendeteksi pesanan pre-order: ${cleanCode}. Membuka antrean pesanan...`);
      navigate(`/kasir/pre-order?scan=${encodeURIComponent(cleanCode)}`);
      return;
    }

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
        {/* Top Control Bar Katalog (Modular Component) */}
        <PosProductFilter
          searchInputRef={searchInputRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchEnter={handleBarcodeScan}
          onOpenScanner={() => setIsBarcodeScannerOpen(true)}
          cartCount={cart.length}
          totalCartItems={totalCartItems}
          onOpenMobileCart={() => setIsMobileCartOpen(true)}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          lowStockCount={lowStockProducts.length}
          showLowStockBanner={showLowStockBanner}
          onDismissLowStockBanner={() => setShowLowStockBanner(false)}
        />

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

        {/* Bar Shortcut Keyboard Enterprise Kasir (Modular Component) */}
        <PosKeyboardShortcuts />
      </div>

      {/* Floating Mobile Cart Bar (Modular Component) */}
      <MobileCartFloatingBar
        isVisible={!isMobileCartOpen}
        cartLength={cart.length}
        totalCartItems={totalCartItems}
        finalTotal={finalTotal}
        onOpenMobileCart={() => setIsMobileCartOpen(true)}
      />

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
