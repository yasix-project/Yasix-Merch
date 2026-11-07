import { create } from "zustand";
import { persist } from "zustand/middleware";
import { showWarningToast } from "../utils/toast";

export const useStudentCartStore = create(
  persist(
    (set, get) => ({
      cart: [], // Array item: [{ productId, product, quantity, price, subtotal }]
      appliedVoucher: null, // { voucherId, code, discountPct, discountAmount, minPurchase }

      // Helper internal untuk memvalidasi syarat minimal voucher saat keranjang berubah
      _revalidateVoucher: (newCart) => {
        const { appliedVoucher } = get();
        if (!appliedVoucher) return;

        const newSubtotal = newCart.reduce((sum, item) => sum + item.subtotal, 0);
        const minPurchase = Number(appliedVoucher.minPurchase || 0);

        if (newCart.length === 0) {
          set({ appliedVoucher: null });
        } else if (minPurchase > 0 && newSubtotal < minPurchase) {
          set({ appliedVoucher: null });
          showWarningToast(
            `Voucher "${appliedVoucher.code}" dilepas otomatis karena subtotal belanja di bawah syarat minimal.`,
          );
        }
      },

      // 1. Tambah Produk ke Keranjang
      addToCart: (product, qty = 1) => {
        const { cart } = get();
        const existing = cart.find((i) => i.productId === product.id);

        if (!product.stock || product.stock <= 0) {
          showWarningToast(`Maaf, stok ${product.name} sedang habis!`);
          return;
        }

        const price = Number(product.sellingPrice || 0);

        if (existing) {
          const newQty = existing.quantity + qty;
          if (newQty > product.stock) {
            showWarningToast(
              `Maksimal stok tersedia untuk ${product.name} adalah ${product.stock}`,
            );
            return;
          }
          set({
            cart: cart.map((i) =>
              i.productId === product.id
                ? {
                    ...i,
                    quantity: newQty,
                    subtotal: newQty * price,
                  }
                : i,
            ),
          });
        } else {
          set({
            cart: [
              ...cart,
              {
                productId: product.id,
                product: {
                  id: product.id,
                  name: product.name,
                  sellingPrice: price,
                  stock: product.stock,
                  imageUrl: product.imageUrl,
                  category: product.category,
                },
                price,
                quantity: qty,
                subtotal: qty * price,
              },
            ],
          });
        }
      },

      // 2. Ubah Kuantitas
      updateQuantity: (productId, quantity) => {
        const { cart, removeFromCart } = get();
        if (quantity <= 0) {
          removeFromCart(productId);
          return;
        }

        const item = cart.find((i) => i.productId === productId);
        if (item && quantity > item.product.stock) {
          showWarningToast(
            `Maksimal stok tersedia untuk ${item.product.name} adalah ${item.product.stock}`,
          );
          return;
        }

        const newCart = cart.map((i) =>
          i.productId === productId
            ? {
                ...i,
                quantity,
                subtotal: quantity * i.price,
              }
            : i,
        );

        set({ cart: newCart });
        get()._revalidateVoucher(newCart);
      },

      // 3. Hapus 1 Item dari Keranjang
      removeFromCart: (productId) => {
        const newCart = get().cart.filter((i) => i.productId !== productId);
        set({ cart: newCart });
        get()._revalidateVoucher(newCart);
      },

      // 4. Kosongkan Keranjang
      clearCart: () => {
        set({ cart: [], appliedVoucher: null });
      },

      // 5. Atur Voucher
      setAppliedVoucher: (voucher) => set({ appliedVoucher: voucher }),
      removeAppliedVoucher: () => set({ appliedVoucher: null }),

      // 6. Getters
      getTotalItems: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().cart.reduce((sum, item) => sum + item.subtotal, 0);
      },

      getFinalTotal: () => {
        const subtotal = get().getSubtotal();
        const voucher = get().appliedVoucher;
        if (!voucher || !voucher.discountAmount) return subtotal;
        return Math.max(0, subtotal - Number(voucher.discountAmount));
      },
    }),
    {
      name: "yasix_student_cart",
    },
  ),
);
