import { useConfirmStore } from "../store/confirmStore";

/**
 * Custom Hook untuk memanggil modal konfirmasi global
 *
 * Contoh penggunaan:
 * ```javascript
 * const confirm = useConfirm();
 *
 * const handleDelete = async () => {
 *   const isConfirmed = await confirm({
 *     title: "Hapus Produk",
 *     message: "Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.",
 *     confirmText: "Ya, Hapus",
 *     cancelText: "Batal",
 *     variant: "danger",
 *   });
 *
 *   if (isConfirmed) {
 *     // jalankan aksi hapus
 *   }
 * };
 * ```
 */
export function useConfirm() {
  const openConfirm = useConfirmStore((state) => state.openConfirm);
  return openConfirm;
}

export default useConfirm;
