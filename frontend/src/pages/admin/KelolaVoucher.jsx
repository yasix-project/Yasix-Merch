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

export default function KelolaVoucher() {
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
        },
        onError: (err) =>
          alert(err.response?.data?.message || "Gagal menyimpan voucher."),
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
      { onError: () => alert("Gagal mengubah status voucher.") },
    );
  };

  const handleBulkDeactivate = () => {
    if (
      window.confirm(
        `Yakin ingin menonaktifkan ${selectedIds.length} voucher terpilih?`,
      )
    ) {
      bulkDeactivate.mutate(selectedIds, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleBulkActivate = () => {
    if (
      window.confirm(
        `Yakin ingin mengaktifkan kembali ${selectedIds.length} voucher terpilih?`,
      )
    ) {
      bulkActivate.mutate(selectedIds, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Hapus ${selectedIds.length} voucher terpilih secara permanen?`,
      )
    ) {
      bulkRemove.mutate(selectedIds, {
        onSuccess: (failedIds) => {
          setSelectedIds(failedIds);
          if (failedIds.length > 0) {
            alert(`${failedIds.length} voucher gagal dihapus.`);
          }
        },
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
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md text-primary">
            <Ticket size={16} />
          </div>
          <span className="font-bold font-mono text-dark tracking-wide">
            {v.code}
          </span>
        </div>
      ),
    },
    {
      header: "Detail Diskon",
      render: (v) => (
        <div>
          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
            Diskon {v.discountPct}%
          </span>
          {v.maxDiscount > 0 && (
            <p className="text-[10px] text-slate-500 mt-1">
              Maks. {formatRupiah(v.maxDiscount)}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Minimal Belanja",
      cellClassName: "font-mono font-medium text-slate-600",
      render: (v) => formatRupiah(v.minPurchase),
    },
    {
      header: "Berakhir Pada",
      cellClassName: "font-mono text-slate-500 text-[11px]",
      render: (v) => formatDate(v.validUntil),
    },
    {
      header: "Status",
      render: (v) => {
        const isExpired = new Date(v.validUntil) < new Date();
        const active = v.isActive && !isExpired;

        return active ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={11} /> Aktif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-600">
            <XCircle size={11} /> {isExpired ? "Kedaluwarsa" : "Nonaktif"}
          </span>
        );
      },
    },
    {
      header: "Aksi",
      className: "text-center",
      render: (v) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => handleToggleStatus(v)}
            disabled={
              toggleStatus.isPending && toggleStatus.variables?.id === v.id
            }
            className={`p-1.5 rounded transition-colors ${
              !v.isActive
                ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
            }`}
            title={v.isActive ? "Nonaktifkan Voucher" : "Aktifkan Voucher"}
          >
            <Power size={15} />
          </button>

          <button
            onClick={() => {
              setEditingVoucher(v);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
            title="Edit"
          >
            <Edit3 size={15} />
          </button>

          <button
            onClick={() => {
              if (window.confirm("Yakin ingin menghapus voucher ini?"))
                remove.mutate(v.id, {
                  onSuccess: (_data, id) =>
                    setSelectedIds((prev) =>
                      prev.filter((item) => item !== id),
                    ),
                });
            }}
            className="p-1.5 text-slate-400 hover:text-danger hover:bg-danger/10 rounded transition-colors"
            title="Hapus"
          >
            <Trash2 size={15} />
          </button>
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
