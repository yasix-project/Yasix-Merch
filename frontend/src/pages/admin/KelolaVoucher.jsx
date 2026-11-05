import { useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Ticket,
  CheckCircle2,
  XCircle,
  Power,
  Ban,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import FilterBar from "../../components/ui/FilterBar";
import BulkActionBar from "../../components/ui/BulkActionBar";
import StatCard from "../../components/admin/StatCard";
import VoucherFormModal from "../../components/admin/VoucherFormModal";

import {
  useVoucherMutations,
  useVouchers,
} from "../../hooks/admin/useVouchers";
import { formatRupiah, formatDate } from "../../utils/formatters";
import { useConfirm } from "../../hooks/useConfirm";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toast";

export default function KelolaVoucher() {
  const confirm = useConfirm();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  // 1. Fetch Data
  const { data: vouchers = [], isLoading, isError, error } = useVouchers();

  // 2. Mutations
  const {
    save,
    remove,
    bulkRemove,
    toggleStatus,
    bulkActivate,
    bulkDeactivate,
  } = useVoucherMutations();

  const handleSave = (data) => {
    save.mutate(
      { id: editingVoucher?.id, data },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingVoucher(null);
          showSuccessToast(
            editingVoucher
              ? "Voucher berhasil diperbarui!"
              : "Voucher baru berhasil dibuat!",
          );
        },
        onError: (err) =>
          showErrorToast(
            err.response?.data?.message || "Gagal menyimpan voucher.",
          ),
      },
    );
  };

  // 3. Filters & Handlers
  const filteredData = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeVouchersCount = vouchers.filter(
    (v) => v.isActive && new Date(v.validUntil) > new Date(),
  ).length;

  const handleSelectAll = (e) =>
    setSelectedIds(e.target.checked ? filteredData.map((v) => v.id) : []);
  const handleSelectRow = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const handleToggleStatus = (voucher) => {
    toggleStatus.mutate(
      { id: voucher.id, currentStatus: voucher.isActive },
      {
        onSuccess: () => {
          showSuccessToast(
            `Voucher "${voucher.code}" berhasil ${
              voucher.isActive ? "dinonaktifkan" : "diaktifkan"
            }.`,
          );
        },
        onError: () => showErrorToast("Gagal mengubah status voucher."),
      },
    );
  };

  const handleBulkDeactivate = async () => {
    const isConfirmed = await confirm({
      title: "Nonaktifkan Voucher Massal",
      message: `Apakah Anda yakin ingin menonaktifkan ${selectedIds.length} voucher terpilih?`,
      confirmText: "Ya, Nonaktifkan",
      cancelText: "Batal",
      variant: "warning",
    });

    if (isConfirmed) {
      bulkDeactivate.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([]);
          showSuccessToast(
            `${selectedIds.length} voucher berhasil dinonaktifkan.`,
          );
        },
        onError: () => showErrorToast("Gagal menonaktifkan beberapa voucher."),
      });
    }
  };

  const handleBulkActivate = async () => {
    const isConfirmed = await confirm({
      title: "Aktifkan Voucher Massal",
      message: `Apakah Anda yakin ingin mengaktifkan kembali ${selectedIds.length} voucher terpilih?`,
      confirmText: "Ya, Aktifkan",
      cancelText: "Batal",
      variant: "primary",
    });

    if (isConfirmed) {
      bulkActivate.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([]);
          showSuccessToast(`${selectedIds.length} voucher berhasil diaktifkan.`);
        },
        onError: () => showErrorToast("Gagal mengaktifkan beberapa voucher."),
      });
    }
  };

  const handleDeleteVoucher = async (v) => {
    const isConfirmed = await confirm({
      title: "Hapus Voucher",
      message: `Apakah Anda yakin ingin menghapus voucher "${v.code}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
    });

    if (isConfirmed) {
      remove.mutate(v.id, {
        onSuccess: (_data, id) => {
          setSelectedIds((prev) => prev.filter((item) => item !== id));
          showSuccessToast("Voucher berhasil dihapus.");
        },
        onError: () => showErrorToast("Gagal menghapus voucher."),
      });
    }
  };

  const handleBulkDelete = async () => {
    const isConfirmed = await confirm({
      title: "Hapus Voucher Massal",
      message: `Hapus ${selectedIds.length} voucher terpilih secara permanen? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus Semua",
      cancelText: "Batal",
      variant: "danger",
    });

    if (isConfirmed) {
      bulkRemove.mutate(selectedIds, {
        onSuccess: (failedIds) => {
          setSelectedIds(failedIds);
          if (failedIds.length > 0) {
            showWarningToast(`${failedIds.length} voucher gagal dihapus.`);
          } else {
            showSuccessToast("Seluruh voucher terpilih berhasil dihapus.");
          }
        },
        onError: () =>
          showErrorToast("Sebagian atau seluruh voucher gagal dihapus."),
      });
    }
  };

  // LOGIKA KONSISTENSI SEPERTI DI PRODUK: Cek apakah semua yang dicentang berstatus NONAKTIF
  const selectedVouchers = vouchers.filter((v) => selectedIds.includes(v.id));
  const areAllInactive =
    selectedVouchers.length > 0 &&
    selectedVouchers.every((v) => v.isActive === false);

  // 4. Konfigurasi Kolom Tabel
  const columns = [
    {
      header: "Kode Voucher",
      render: (v) => (
        <div>
          <span className="font-bold text-dark font-mono text-base tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {v.code}
          </span>
          <br />
          <span className="text-xs text-slate-500 mt-1 inline-block">
            {v.student ? `Voucher Siswa (${v.student.name})` : (v.studentId ? "Voucher Poin Siswa" : "Promo Toko / Umum")}
          </span>
        </div>
      ),
    },
    {
      header: "Potongan (%)",
      cellClassName: "font-mono font-bold text-dark",
      render: (v) => (
        <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-xs font-semibold border border-emerald-200">
          {Number(v.discountPct || 0)}%
        </span>
      ),
    },
    {
      header: "Maks. Potongan",
      cellClassName: "font-mono font-semibold text-slate-700 text-xs",
      render: (v) =>
        v.maxDiscount && Number(v.maxDiscount) > 0 ? (
          <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {formatRupiah(v.maxDiscount)}
          </span>
        ) : (
          <span className="text-slate-400 italic">Tanpa Batas</span>
        ),
    },
    {
      header: "Min. Belanja",
      cellClassName: "font-mono text-slate-600 text-xs",
      render: (v) =>
        v.minPurchase && Number(v.minPurchase) > 0
          ? formatRupiah(v.minPurchase)
          : "Tanpa Minimum",
    },
    {
      header: "Masa Berlaku",
      cellClassName: "font-mono text-slate-500 text-xs",
      render: (v) => formatDate(v.validUntil),
    },
    {
      header: "Status",
      className: "text-center",
      render: (v) => {
        const isExpired = new Date(v.validUntil) < new Date();
        if (isExpired) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <XCircle size={12} className="text-slate-400" /> Kedaluwarsa
            </span>
          );
        }
        return v.isActive ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-500" /> Aktif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle size={12} className="text-red-500" /> Nonaktif
          </span>
        );
      },
    },
    {
      header: "Aksi",
      className: "text-center",
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            size="xs"
            variant="outline"
            onClick={() => handleToggleStatus(v)}
            className={`p-1.5 h-7 w-7 rounded ${
              v.isActive
                ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
            title={v.isActive ? "Nonaktifkan Voucher" : "Aktifkan Voucher"}
          >
            <Power size={13} />
          </Button>

          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              setEditingVoucher(v);
              setIsModalOpen(true);
            }}
            className="p-1.5 h-7 w-7 text-slate-500 hover:text-primary hover:bg-primary/10 rounded"
            title="Edit"
          >
            <Edit3 size={13} />
          </Button>

          <Button
            size="xs"
            variant="outline"
            onClick={() => handleDeleteVoucher(v)}
            className="p-1.5 h-7 w-7 text-slate-500 hover:text-danger hover:bg-danger/10 rounded"
            title="Hapus"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  const isStatusLoading = bulkActivate.isPending || bulkDeactivate.isPending;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">
            Kelola Voucher Promo
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Atur diskon dan program loyalitas siswa
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingVoucher(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} /> Buat Voucher
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Voucher Promo"
          value={vouchers.length}
          icon={Ticket}
          trendLabel="Promo Terdaftar"
        />
        <StatCard
          title="Promo Aktif"
          value={activeVouchersCount}
          icon={CheckCircle2}
          trendLabel="Bisa digunakan di Kasir"
        />
      </div>

      <FilterBar
        searchPlaceholder="Cari kode voucher..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Table
        columns={columns}
        data={filteredData}
        keyField="id"
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.response?.data?.message || error?.message}
        emptyMessage="Tidak ada data voucher."
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        rowClassName={(v) =>
          !v.isActive || new Date(v.validUntil) < new Date()
            ? "bg-slate-50/80 opacity-70"
            : ""
        }
      />

      {/* BULK ACTION BAR YANG DINAMIS (KONSISTEN DENGAN PRODUK) */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        itemLabel="Voucher Terpilih"
      >
        {areAllInactive ? (
          <Button
            variant="primary"
            size="xs"
            onClick={handleBulkActivate}
            isLoading={isStatusLoading}
            className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30 focus-visible:ring-emerald-300 active:scale-95"
          >
            {!isStatusLoading && <Power size={14} />}
            Aktifkan Terpilih
          </Button>
        ) : (
          <Button
            variant="amber"
            size="xs"
            onClick={handleBulkDeactivate}
            isLoading={isStatusLoading}
            className="shadow-amber-900/30 focus-visible:ring-amber-300 active:scale-95"
          >
            {!isStatusLoading && <Ban size={14} />}
            Nonaktifkan Terpilih
          </Button>
        )}

        <Button
          variant="danger"
          size="xs"
          onClick={handleBulkDelete}
          isLoading={bulkRemove.isPending}
          className="shadow-red-900/30 focus-visible:ring-red-300 active:scale-95"
        >
          {!bulkRemove.isPending && <Trash2 size={14} />}
          Hapus Massal
        </Button>
      </BulkActionBar>

      <VoucherFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitData={handleSave}
        initialData={editingVoucher}
        isSubmitting={save.isPending}
      />
    </div>
  );
}
