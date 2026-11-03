import { create } from "zustand";

/**
 * Zustand Store untuk Mengelola State Modal Konfirmasi Global
 */
export const useConfirmStore = create((set, get) => ({
  isOpen: false,
  title: "Konfirmasi Tindakan",
  message: "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmText: "Lanjutkan",
  cancelText: "Batal",
  variant: "primary", // 'danger' | 'warning' | 'primary' | 'info'
  isLoading: false,
  resolver: null,

  /**
   * Membuka modal konfirmasi secara imperative dan mengembalikan Promise<boolean>
   * @param {Object} options
   * @param {string} options.title - Judul modal
   * @param {string|React.ReactNode} options.message - Pesan penjelasan
   * @param {string} [options.confirmText="Lanjutkan"] - Label tombol konfirmasi
   * @param {string} [options.cancelText="Batal"] - Label tombol batal
   * @param {'danger'|'warning'|'primary'|'info'} [options.variant="primary"] - Tema warna
   * @returns {Promise<boolean>}
   */
  openConfirm: (options = {}) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        title: options.title || "Konfirmasi Tindakan",
        message: options.message || "Apakah Anda yakin ingin melanjutkan tindakan ini?",
        confirmText: options.confirmText || "Lanjutkan",
        cancelText: options.cancelText || "Batal",
        variant: options.variant || "primary",
        isLoading: false,
        resolver: resolve,
      });
    });
  },

  handleConfirm: () => {
    const { resolver } = get();
    if (resolver) {
      resolver(true);
    }
    set({
      isOpen: false,
      resolver: null,
      isLoading: false,
    });
  },

  handleCancel: () => {
    const { resolver } = get();
    if (resolver) {
      resolver(false);
    }
    set({
      isOpen: false,
      resolver: null,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));

/**
 * Standalone helper untuk memicu konfirmasi di luar komponen React (misal di store/service)
 */
export const confirmDialog = (options) => {
  return useConfirmStore.getState().openConfirm(options);
};
