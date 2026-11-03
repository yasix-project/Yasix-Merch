import { useState } from "react";
import { Plus, Edit3, Trash2, FolderTree } from "lucide-react";

import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import FilterBar from "../../components/ui/FilterBar";
import BulkActionBar from "../../components/ui/BulkActionBar";
import StatCard from "../../components/admin/StatCard";
import CategoryTypeModal from "../../components/admin/CategoryTypeModal";
import CategoryFormModal from "../../components/admin/CategoryFormModal";

import {
  useCategories,
  useCategoryMutations,
} from "../../hooks/admin/useCategories";
import { formatDate } from "../../utils/formatters";
import { useConfirm } from "../../hooks/useConfirm";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toast";

export default function KelolaKategori() {
  const confirm = useConfirm();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // State Modal
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategoryType, setSelectedCategoryType] = useState("");

  // 1. Fetch Data
  const { data: categories = [], isLoading, isError, error } = useCategories();

  // 2. Mutations
  const { save, remove, bulkRemove } = useCategoryMutations();

  const handleSave = (data) => {
    save.mutate(
      { id: editingCategory?.id, data },
      {
        onSuccess: () => {
          setIsFormModalOpen(false);
          setEditingCategory(null);
          showSuccessToast(
            editingCategory
              ? "Kategori berhasil diperbarui!"
              : "Kategori baru berhasil ditambahkan!",
          );
        },
        onError: (err) =>
          showErrorToast(
            err.response?.data?.message || "Gagal menyimpan kategori.",
          ),
      },
    );
  };

  // 3. Handlers
  const handleAddNewCategory = () => {
    setEditingCategory(null);
    setSelectedCategoryType("");
    setIsTypeModalOpen(true); // Buka modal pilih tipe dulu
  };

  const handleTypeSelected = (type) => {
    setSelectedCategoryType(type);
    setIsTypeModalOpen(false);
    setIsFormModalOpen(true); // Lanjut ke form pengisian
  };

  const handleDeleteCategory = async (cat) => {
    const isConfirmed = await confirm({
      title: "Hapus Kategori",
      message: `Apakah Anda yakin ingin menghapus kategori "${cat.name}"? Pastikan tidak ada produk di dalamnya.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
    });

    if (isConfirmed) {
      remove.mutate(cat.id, {
        onSuccess: () => {
          setSelectedIds((prev) => prev.filter((item) => item !== cat.id));
          showSuccessToast("Kategori berhasil dihapus.");
        },
        onError: (err) =>
          showErrorToast(
            err.response?.data?.message ||
              "Gagal menghapus kategori. Pastikan tidak ada produk di dalamnya.",
          ),
      });
    }
  };

  const handleBulkDelete = async () => {
    const isConfirmed = await confirm({
      title: "Hapus Massal Kategori",
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} kategori terpilih?`,
      confirmText: "Ya, Hapus Semua",
      cancelText: "Batal",
      variant: "danger",
    });

    if (isConfirmed) {
      bulkRemove.mutate(selectedIds, {
        onSuccess: (failedIds) => {
          setSelectedIds(failedIds);
          if (failedIds.length > 0) {
            showWarningToast(`${failedIds.length} kategori gagal dihapus.`);
          } else {
            showSuccessToast("Seluruh kategori terpilih berhasil dihapus.");
          }
        },
        onError: () => showErrorToast("Gagal menghapus beberapa kategori."),
      });
    }
  };

  const filteredData = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? filteredData.map((c) => c.id) : []);
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // 4. Kolom Tabel (Dengan Badge Tipe Kategori)
  const columns = [
    {
      header: "Nama Kategori",
      render: (cat) => (
        <div>
          <span className="font-bold text-dark">{cat.name}</span>
          <br />
          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-semibold border border-slate-200/60">
            {cat.type || "LAINNYA"}
          </span>
        </div>
      ),
    },
    {
      header: "Deskripsi",
      render: (cat) => (
        <span
          className="text-slate-500 truncate max-w-xs block"
          title={cat.description}
        >
          {cat.description || (
            <span className="italic text-slate-400">Tidak ada deskripsi</span>
          )}
        </span>
      ),
    },
    {
      header: "Tanggal Dibuat",
      cellClassName: "font-mono text-slate-500",
      render: (cat) => formatDate(cat.createdAt || new Date()),
    },
    {
      header: "Aksi",
      className: "text-center",
      render: (cat) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => {
              setEditingCategory(cat);
              setIsFormModalOpen(true); // Edit langsung buka form
            }}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
            title="Edit"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => handleDeleteCategory(cat)}
            className="p-1.5 text-slate-400 hover:text-danger hover:bg-danger/10 rounded transition-colors"
            title="Hapus"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Kelola Kategori</h1>
          <p className="text-sm text-slate-500">
            Klasifikasikan produk dan atur sifat stok (Barang Fisik vs Jasa Cetak).
          </p>
        </div>
        <Button onClick={handleAddNewCategory}>
          <Plus size={16} /> Tambah Kategori
        </Button>
      </div>

      {/* Grid Ringkasan / Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Kategori"
          value={categories.length}
          icon={FolderTree}
        />
        <StatCard
          title="Tipe Fisik"
          value={categories.filter((c) => c.type === "FISIK").length}
          icon={FolderTree}
        />
        <StatCard
          title="Tipe Cetak"
          value={categories.filter((c) => c.type === "CETAK").length}
          icon={FolderTree}
        />
        <StatCard
          title="Tipe Lainnya"
          value={categories.filter((c) => c.type === "LAINNYA").length}
          icon={FolderTree}
        />
      </div>

      {/* Bar Pencarian */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Cari kategori berdasarkan nama..."
      />

      {/* Tabel Data Utama */}
      <Table
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        selectable
        selectedIds={selectedIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
      />

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        itemLabel="Kategori Terpilih"
      >
        <Button
          variant="danger"
          size="xs"
          onClick={handleBulkDelete}
          isLoading={bulkRemove.isPending}
          className="shadow-red-900/30 focus-visible:ring-red-300 active:scale-95"
        >
          <Trash2 size={14} /> Hapus Massal
        </Button>
      </BulkActionBar>

      {/* MODAL 1: Pilih Tipe Kategori */}
      <CategoryTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSelectType={handleTypeSelected}
      />

      {/* MODAL 2: Form Input Kategori */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCategory(null);
        }}
        initialData={editingCategory}
        categoryType={selectedCategoryType}
        onSubmit={handleSave}
        isLoading={save.isPending}
      />
    </div>
  );
}
