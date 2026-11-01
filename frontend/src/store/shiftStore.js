import { create } from "zustand";

// Helper agar JSON.parse aman dan tidak membuat aplikasi crash jika data rusak
const getStoredShift = () => {
  try {
    const shift = localStorage.getItem("activeShift");
    return shift ? JSON.parse(shift) : null;
  } catch (error) {
    console.error("Gagal membaca data shift dari localStorage:", error);
    localStorage.removeItem("activeShift");
    return null;
  }
};

export const useShiftStore = create((set, get) => ({
  // Status awal shift dibaca langsung dari localStorage
  activeShift: getStoredShift(),

  /**
   * Buka sesi shift baru
   * @param {Object} shiftData - { id, startTime, startCash, cashierId, cashierName }
   */
  openShift: (shiftData) => {
    const newShift = {
      id: shiftData.id || `SHIFT-${Date.now()}`,
      startTime: shiftData.startTime || new Date().toISOString(),
      startCash: Number(shiftData.startCash) || 0,
      cashierId: shiftData.cashierId || null,
      cashierName: shiftData.cashierName || null,
      status: "OPEN",
    };

    localStorage.setItem("activeShift", JSON.stringify(newShift));
    set({ activeShift: newShift });
  },

  /**
   * Tutup sesi shift kasir
   */
  closeShift: () => {
    localStorage.removeItem("activeShift");
    set({ activeShift: null });
  },

  /**
   * Update data shift yang sedang berjalan jika dibutuhkan
   * (Misal: sinkronisasi catatan atau rekap total cash dari backend)
   */
  updateShift: (partialData) => {
    const currentShift = get().activeShift;
    if (!currentShift) return;

    const updatedShift = { ...currentShift, ...partialData };
    localStorage.setItem("activeShift", JSON.stringify(updatedShift));
    set({ activeShift: updatedShift });
  },

  /**
   * Helper selector untuk memeriksa apakah kasir sedang berada dalam shift aktif
   */
  isShiftOpen: () => Boolean(get().activeShift),
}));
