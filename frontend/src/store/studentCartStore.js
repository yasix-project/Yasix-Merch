import { create } from "zustand";
import { persist } from "zustand/middleware";
import { showWarningToast } from "../utils/toast";

export const useStudentCartStore = create(
  persist(
    (set, get) => ({
      cart: [], // Array item: [{ productId, product, quantity, price, subtotal }]
      appliedVoucher: null, // { voucherId, code, discountPct, discountAmount }

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

        set({
          cart: cart.map((i) =>
            i.productId === productId
              ? {
                  ...i,
                  quantity,
                  subtotal: quantity * i.price,
                }
              : i,
          ),
        });
      },

      // 3. Hapus 1 Item dari Keranjang
      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((i) => i.productId !== productId),
        }));
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
