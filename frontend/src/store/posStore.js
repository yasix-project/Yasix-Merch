import { create } from "zustand";

export const usePosStore = create((set, get) => ({
  cart: [], // State untuk menampung array produk yang dibeli

  // 1. Tambah Barang ke Keranjang (atau tambah qty jika sudah ada)
  addToCart: (product) => {
    const { cart } = get();
    const existingItem = cart.find((item) => item.productId === product.id);

    // Cek apakah stok produk ada
    if (product.stock <= 0) {
      alert(`Maaf, stok ${product.name} sedang kosong!`);
      return;
    }

    if (existingItem) {
      // Jika barang sudah ada di keranjang, tambah quantity-nya
      // Tapi pastikan dulu tidak melebihi stok gudang
      if (existingItem.quantity < product.stock) {
        set({
          cart: cart.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  subtotal: (item.quantity + 1) * item.price,
                }
              : item,
          ),
        });
      } else {
        alert(`Stok maksimal untuk ${product.name} sudah tercapai.`);
      }
    } else {
      // Jika barang belum ada, masukkan sebagai item baru
      set({
        cart: [
          ...cart,
          {
            productId: product.id,
            itemName: product.name,
            price: Number(product.sellingPrice),
            quantity: 1,
            subtotal: Number(product.sellingPrice),
            maxStock: product.stock, // Simpan info stok asli untuk validasi UI
          },
        ],
      });
    }
  },

  // 2. Kurangi Quantity Barang
  decreaseQuantity: (productId) => {
    const { cart, removeFromCart } = get();
    const existingItem = cart.find((item) => item.productId === productId);

    if (existingItem?.quantity > 1) {
      // Jika qty lebih dari 1, kurangi 1
      set({
        cart: cart.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
                subtotal: (item.quantity - 1) * item.price,
              }
            : item,
        ),
      });
    } else {
      // Jika qty tinggal 1 dan tombol minus ditekan, hapus barang dari keranjang
      removeFromCart(productId);
    }
  },

  // 3. Hapus 1 Jenis Barang Sepenuhnya dari Keranjang
  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.productId !== productId),
    }));
  },

  // 4. Kosongkan Seluruh Keranjang (Dipakai saat Batal atau Selesai Checkout)
  clearCart: () => {
    set({ cart: [] });
  },

  // 5. Getter: Hitung Total Harga Secara Real-time
  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + item.subtotal, 0);
  },

  // 6. Getter: Hitung Total Jumlah Barang
  getTotalItems: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },
}));
