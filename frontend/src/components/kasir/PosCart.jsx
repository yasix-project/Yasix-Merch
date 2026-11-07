import { useState } from "react";
import {
  ShoppingBag,
  CreditCard,
  Trash2,
  Loader2,
  Camera,
  X,
  UserCheck,
  Tag,
} from "lucide-react";
import CartItem from "./CartItem";
import { formatRupiah } from "../../utils/formatters";
import { usePosStore } from "../../store/posStore";
import { studentService } from "../../api/studentService";
import { voucherService } from "../../api/voucherService";
import BarcodeScannerModal from "../shared/BarcodeScannerModal";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const inputClass =
  "w-full rounded-xl bg-slate-50 py-2.5 pl-3 pr-20 text-xs font-medium text-slate-800 ring-1 ring-slate-200/90 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600";

export default function PosCart({
  memberCode,
  setMemberCode,
  verifiedStudent,
  setVerifiedStudent,
  voucherCode,
  setVoucherCode,
  appliedVoucher,
  setAppliedVoucher,
  discountAmount = 0,
  setDiscountAmount,
  onOpenPayment,
  isProcessing,
  isMobileOpen = false,
  onCloseMobile,
}) {
  const [isMemberScannerOpen, setIsMemberScannerOpen] = useState(false);
  const [isCheckingMember, setIsCheckingMember] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const {
    cart,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
  } = usePosStore();

  const subtotal = getCartTotal();
  const finalTotal = Math.max(0, subtotal - (discountAmount || 0));
  const isEmpty = cart.length === 0;
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleIncrease = (item) => {
    addToCart({
      id: item.productId,
      stock: item.maxStock,
      sellingPrice: item.price,
      price: item.price,
      name: item.itemName,
    });
  };

  const handleCheckMember = async (codeToCheck) => {
    const code = (codeToCheck || memberCode || "").trim();
    if (!code) {
      showErrorToast("Masukkan NIS atau Scan QR Member terlebih dahulu");
      return;
    }

    try {
      setIsCheckingMember(true);
      const res = await studentService.getById(code);
      const student = res?.data?.data || res?.data || res;
      if (student && student.name) {
        setVerifiedStudent(student);
        setMemberCode(student.nis || code);
        showSuccessToast(
          `Member: ${student.name} (${student.points || 0} Poin)`
        );
      } else {
        showErrorToast("Data siswa/member tidak ditemukan.");
        setVerifiedStudent(null);
      }
    } catch (err) {
      showErrorToast(
        err?.response?.data?.message ||
          "Data siswa/member dengan NIS atau QR tersebut tidak ditemukan."
      );
      setVerifiedStudent(null);
    } finally {
      setIsCheckingMember(false);
    }
  };

  const handleMemberScan = (scannedCode) => {
    const code = (scannedCode || "").trim();
    if (!code) return;
    setMemberCode(code);
    handleCheckMember(code);
  };

  const handleApplyVoucher = async () => {
    const code = (voucherCode || "").trim().toUpperCase();
    if (!code) {
      showErrorToast("Masukkan kode voucher diskon terlebih dahulu");
      return;
    }

    if (subtotal <= 0) {
      showErrorToast("Tambahkan barang ke keranjang sebelum menggunakan voucher");
      return;
    }

    try {
      setIsValidatingVoucher(true);
      const res = await voucherService.validate(code, subtotal);
      const data = res?.data?.data || res?.data || res;

      if (data && data.discountAmount !== undefined) {
        setAppliedVoucher(data);
        if (setDiscountAmount) {
          setDiscountAmount(Number(data.discountAmount));
        }
        showSuccessToast(
          `Voucher ${data.code} aktif! Diskon ${formatRupiah(data.discountAmount)}`
        );
      } else {
        showErrorToast("Voucher tidak valid atau tidak dapat digunakan.");
      }
    } catch (err) {
      showErrorToast(
        err?.response?.data?.message || "Kode voucher tidak valid atau sudah kadaluwarsa."
      );
      setAppliedVoucher(null);
      if (setDiscountAmount) setDiscountAmount(0);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    if (setDiscountAmount) setDiscountAmount(0);
    showSuccessToast("Voucher telah dihapus.");
  };

  const handleClearAll = () => {
    clearCart();
    setAppliedVoucher(null);
    setVoucherCode("");
    if (setDiscountAmount) setDiscountAmount(0);
  };

  return (
    <>
      {/* Backdrop Gelap untuk Mode Drawer Mobile */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Panel Keranjang Kasir (Responsive Desktop Split + Mobile Slide Drawer) */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex h-full w-full sm:w-[420px] flex-col bg-white border-l border-slate-200/90 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-20 lg:h-full lg:w-[380px] xl:w-[420px] 2xl:w-[440px] lg:translate-x-0 lg:shadow-md shrink-0 overflow-hidden ${
          isMobileOpen
            ? "translate-x-0"
            : "translate-x-full lg:translate-x-0 pointer-events-none lg:pointer-events-auto"
        }`}
      >
        {/* Header Panel */}
        <header className="shrink-0 flex items-center justify-between px-4 py-3 sm:py-3.5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <ShoppingBag size={15} strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-sm font-bold leading-tight text-slate-900">
                Keranjang Belanja
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Terminal Kasir POS</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold tabular-nums text-blue-700 border border-blue-200/60">
              {cart.length} Item ({totalQuantity} pcs)
            </span>

            {/* Tombol Tutup Drawer di Mobile */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition lg:hidden"
              title="Tutup Keranjang & Kembali ke Katalog"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* Daftar Item Keranjang (Scrollable) */}
        <div className="flex-1 min-h-0 space-y-2.5 overflow-y-auto bg-slate-50/70 p-3 sm:p-3.5 [scrollbar-width:thin]">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
              <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-300 ring-1 ring-slate-200/80 shadow-xs">
                <ShoppingBag size={26} strokeWidth={1.5} />
              </span>
              <p className="text-sm font-bold text-slate-700">
                Keranjang masih kosong
              </p>
              <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-slate-400">
                Pilih barang dari katalog produk atau pindai barcode dengan scanner webcam.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onIncrease={handleIncrease}
                onDecrease={decreaseQuantity}
                onRemove={removeFromCart}
              />
            ))
          )}
        </div>

        {/* Checkout Panel Bawah (Fixed, Never Cut Off) */}
        <div className="shrink-0 border-t border-slate-200/90 bg-white p-3.5 sm:p-4 space-y-3 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
          {/* Baris Member Siswa */}
          <div>
            {verifiedStudent ? (
              <div className="flex items-center justify-between p-2.5 bg-blue-50/90 border border-blue-200 rounded-xl text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0 shadow-xs">
                    <UserCheck size={14} />
                  </span>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 text-xs truncate">
                      {verifiedStudent.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      NIS: {verifiedStudent.nis || "-"} •{" "}
                      <span className="text-blue-700 font-bold">
                        {verifiedStudent.points || 0} Poin
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVerifiedStudent(null);
                    setMemberCode("");
                  }}
                  className="text-slate-400 hover:text-red-500 p-1 shrink-0 rounded-lg hover:bg-red-50 transition"
                  title="Batalkan Member"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="NIS atau Scan QR Member..."
                  value={memberCode}
                  onChange={(e) => setMemberCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCheckMember();
                    }
                  }}
                  className={inputClass}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsMemberScannerOpen(true)}
                    title="Scan QR Member Siswa via Webcam"
                    className="rounded-lg p-1 text-blue-600 hover:bg-blue-100 transition"
                  >
                    <Camera size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCheckMember()}
                    disabled={isCheckingMember}
                    className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition disabled:opacity-50 border border-blue-200"
                  >
                    {isCheckingMember ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      "Cek"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Baris Voucher Diskon */}
          <div>
            {appliedVoucher ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0 shadow-xs">
                    <Tag size={13} />
                  </span>
                  <div className="truncate">
                    <p className="font-bold text-emerald-950 text-xs truncate">
                      Voucher: {appliedVoucher.code} ({appliedVoucher.discountPct}%)
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold">
                      Hemat {formatRupiah(appliedVoucher.discountAmount || discountAmount)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="text-slate-400 hover:text-red-500 p-1 shrink-0 rounded-lg hover:bg-red-50 transition"
                  title="Hapus Voucher"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Kode Voucher Diskon (cth: GTNIC2026)"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyVoucher();
                    }
                  }}
                  className={`${inputClass} uppercase placeholder:normal-case`}
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  disabled={isValidatingVoucher || isEmpty}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200 disabled:opacity-50"
                >
                  {isValidatingVoucher ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    "Gunakan"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Ringkasan Finansial Tagihan */}
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800 tabular-nums">
                {formatRupiah(subtotal)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Diskon Voucher</span>
                <span className="tabular-nums">- {formatRupiah(discountAmount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-dashed border-slate-200 pt-2">
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Total Tagihan
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Termasuk PPN jika ada
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-blue-600 tabular-nums tracking-tight">
                {formatRupiah(finalTotal)}
              </span>
            </div>
          </div>

          {/* Tombol Aksi Keranjang */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isEmpty || isProcessing}
              title="Kosongkan Keranjang"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-slate-400 border border-slate-200 outline-none transition hover:bg-red-50 hover:text-red-500 hover:border-red-200 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              <Trash2 size={17} strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={onOpenPayment}
              disabled={isEmpty || isProcessing}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 outline-none transition active:scale-[0.98] disabled:pointer-events-none disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CreditCard size={16} strokeWidth={2} />
                  <span>Proses Pembayaran</span>
                  <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded font-bold ml-1">
                    F4
                  </kbd>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Scanner QR/NIS Siswa via Webcam */}
        <BarcodeScannerModal
          isOpen={isMemberScannerOpen}
          onClose={() => setIsMemberScannerOpen(false)}
          onScan={handleMemberScan}
          title="Scan Kartu Pelajar / QR Member"
          description="Arahkan Barcode NIS pada kartu pelajar atau QR Member Siswa ke depan webcam laptop."
          continuous={false}
        />
      </aside>
    </>
  );
}
