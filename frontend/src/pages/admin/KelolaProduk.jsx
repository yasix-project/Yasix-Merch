// src/pages/admin/KelolaProduk.jsx
import { useState } from "react";
import {
  Plus,
  Download,
  Package,
  Boxes,
  AlertTriangle,
  PackageCheck,
} from "lucide-react";

import Button from "../../components/ui/Button";
import StatCard from "../../components/admin/StatCard";
import ProductFormModal from "../../components/admin/ProductFormModal";
import ProductFilterBar from "../../components/admin/ProductFilterBar";
import ProductTable from "../../components/admin/ProductTable";
import FloatingBulkBar from "../../components/admin/FloatingBulkBar";

import { useCategories } from "../../hooks/admin/useCategories";
import {
  useProductMutations,
  useProducts,
} from "../../hooks/admin/useProducts";
import { formatRupiah, exportProductsToCSV } from "../../utils/formatters";
import { useConfirm } from "../../hooks/useConfirm";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toast";

export default function KelolaProduk() {
  const confirm = useConfirm();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // 1. Queries
  const { data: products = [], isLoading, isError, error } = useProducts();
  const { data: categories = [] } = useCategories();

  // 2. Mutations
  const {
    save,
    toggleActive,
    remove,
    bulkDeactivate,
    bulkActivate,
    bulkRemove,
  } = useProductMutations();

  const handleSave = (data) => {
    save.mutate(
      { id: editingProduct?.id, data },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingProduct(null);
          showSuccessToast(
            editingProduct
              ? "Produk berhasil diperbarui!"
              : "Produk baru berhasil ditambahkan!",
          );
        },
        onError: (err) =>
          showErrorToast(
            err.response?.data?.message || "Gagal menyimpan data produk.",
          ),
      },
    );
  };

  // 3. Action Handlers
  const handleToggleActive = async (product) => {
    const isActivating = product.isActive === false;
    const actionText = isActivating ? "mengaktifkan kembali" : "menonaktifkan";

    const isConfirmed = await confirm({
      title: isActivating ? "Aktifkan Produk" : "Nonaktifkan Produk",
      message: `Apakah Anda yakin ingin ${actionText} produk "${product.name}"?`,
      confirmText: isActivating ? "Ya, Aktifkan" : "Ya, Nonaktifkan",
      cancelText: "Batal",
      variant: isActivating ? "primary" : "warning",
    });

    if (isConfirmed) {
      toggleActive.mutate(
        { id: product.id, isActive: product.isActive },
        {
          onSuccess: () => {
            showSuccessToast(
              `Produk "${product.name}" berhasil ${
                isActivating ? "diaktifkan" : "dinonaktifkan"
              }.`,
            );
          },
          onError: (err) =>
            showErrorToast(
              err.response?.data?.message || "Gagal mengubah status produk.",
            ),
        },
      );
    }
  };

  const handleBulkDeactivate = async () => {
    const isConfirmed = await confirm({
      title: "Nonaktifkan Produk Massal",
      message: `Apakah Anda yakin ingin menonaktifkan ${selectedIds.length} produk terpilih?`,
      confirmText: "Ya, Nonaktifkan Semua",
      cancelText: "Batal",
      variant: "warning",
    });

    if (isConfirmed) {
      bulkDeactivate.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([]);
          showSuccessToast(
            `${selectedIds.length} produk berhasil dinonaktifkan.`,
          );
        },
        onError: () => showErrorToast("Gagal menonaktifkan beberapa produk."),
      });
    }
  };

  const handleBulkActivate = async () => {
    const isConfirmed = await confirm({
      title: "Aktifkan Produk Massal",
      message: `Apakah Anda yakin ingin mengaktifkan kembali ${selectedIds.length} produk terpilih?`,
      confirmText: "Ya, Aktifkan Semua",
      cancelText: "Batal",
      variant: "primary",
    });

    if (isConfirmed) {
      bulkActivate.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([]);
          showSuccessToast(`${selectedIds.length} produk berhasil diaktifkan.`);
        },
        onError: () => showErrorToast("Gagal mengaktifkan beberapa produk."),
      });
    }
  };

  const handleDeleteProduct = async (id) => {
    const isConfirmed = await confirm({
      title: "Hapus Produk",
      message:
        "Apakah Anda yakin ingin menghapus produk ini dari database? Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
    });

    if (isConfirmed) {
      remove.mutate(id, {
        onSuccess: (_data, removedId) => {
          setSelectedIds((prev) => prev.filter((item) => item !== removedId));
          showSuccessToast("Produk berhasil dihapus dari database.");
        },
        onError: () => showErrorToast("Gagal menghapus produk dari database."),
      });
    }
  };

  const handleBulkDelete = async () => {
    const isConfirmed = await confirm({
      title: "Hapus Produk Massal",
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} produk terpilih? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus Semua",
      cancelText: "Batal",
      variant: "danger",
    });

    if (isConfirmed) {
      bulkRemove.mutate(selectedIds, {
        onSuccess: (failedIds) => {
          setSelectedIds(failedIds);
          if (failedIds.length > 0) {
            showWarningToast(`${failedIds.length} produk gagal dihapus.`);
          } else {
            showSuccessToast("Seluruh produk terpilih berhasil dihapus.");
          }
        },
        onError: () =>
          showErrorToast("Sebagian atau seluruh produk gagal dihapus."),
      });
    }
  };

  // 4. Selection & Dynamic Status Check
  const filteredProducts = products.filter((item) => {
    const categoryName = item.category?.name || item.category || "";
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua" || categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isAllSelected =
    filteredProducts.length > 0 &&
    selectedIds.length === filteredProducts.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Cek apakah item yang dipilih semuanya berstatus nonaktif (untuk toggle opsi bulk bar)
  const selectedProductObjects = products.filter((p) =>
    selectedIds.includes(p.id),
  );
  const areAllInactive =
    selectedProductObjects.length > 0 &&
    selectedProductObjects.every((p) => p.isActive === false);

  // 5. Stat Card Calculations
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce(
    (acc, item) => acc + (item.hpp || 0) * (item.stock || 0),
    0,
  );
  const lowStockCount = products.filter(
    (item) => (item.stock || 0) <= (item.minStock || 5),
  ).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">
            Kelola Inventaris & Produk
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen stok, kalkulasi margin, dan pemantauan aset Yasix Merch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportProductsToCSV(products, selectedIds)}
          >
            <Download size={15} className="text-slate-500" /> Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Tambah Produk Baru
          </Button>
        </div>
      </div>

      {/* Reusable Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Varian"
          value={totalProducts}
          icon={Package}
          trendLabel="Produk Terdaftar"
        />
        <StatCard
          title="Nilai Aset Modal"
          value={formatRupiah(totalInventoryValue)}
          icon={Boxes}
          trendLabel="Berdasarkan HPP x Stok"
        />
        <StatCard
          title="Stok Kritis"
          value={lowStockCount}
          icon={AlertTriangle}
          trendLabel={
            lowStockCount > 0 ? "Perlu Restock Segera" : "Semua Stok Aman"
          }
        />
        <StatCard
          title="Kategori Terdata"
          value={categories.length}
          icon={PackageCheck}
          trendLabel="Sektor Barang"
        />
      </div>

      {/* Filter Bar */}
      <ProductFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      {/* Table */}
      <ProductTable
        products={filteredProducts}
        isLoading={isLoading}
        isError={isError}
        error={error}
        selectedIds={selectedIds}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        onToggleActive={handleToggleActive}
        onEdit={(p) => {
          setEditingProduct(p);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteProduct}
      />

      {/* Floating Bulk Action Bar */}
      <FloatingBulkBar
        selectedCount={selectedIds.length}
        areAllInactive={areAllInactive}
        onExport={() => exportProductsToCSV(products, selectedIds)}
        onDeactivate={handleBulkDeactivate}
        onActivate={handleBulkActivate}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedIds([])}
        isDeactivating={bulkDeactivate.isPending}
        isActivating={bulkActivate.isPending}
        isDeleting={bulkRemove.isPending}
      />

      {/* Modal Form */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitData={handleSave}
        initialData={editingProduct}
        isSubmitting={save.isPending}
      />
    </div>
  );
}
