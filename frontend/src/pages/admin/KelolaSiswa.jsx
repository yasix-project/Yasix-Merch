// src/pages/admin/KelolaSiswa.jsx
import { useState } from "react";
import { Plus, Edit3, Trash2, Users, Award, QrCode } from "lucide-react";

import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import FilterBar from "../../components/ui/FilterBar";
import StatCard from "../../components/admin/StatCard";
import StudentFormModal from "../../components/admin/StudentFormModal";
import FloatingBulkBar from "../../components/admin/FloatingBulkBar";

import useDebounce from "../../hooks/admin/useDebounce";
import {
  useStudentMutations,
  useStudents,
} from "../../hooks/admin/useStudents";
import { formatDate } from "../../utils/formatters";
import { useConfirm } from "../../hooks/useConfirm";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toast";

export default function KelolaSiswa() {
  const confirm = useConfirm();
  const [searchQuery, setSearchQuery] = useState("");
  const [selection, setSelection] = useState({ search: "", ids: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const debouncedSearch = useDebounce(searchQuery);
  const selectedIds = selection.search === debouncedSearch ? selection.ids : [];
  const updateSelectedIds = (updater) => {
    setSelection(({ search, ids }) => {
      const currentIds = search === debouncedSearch ? ids : [];
      return {
        search: debouncedSearch,
        ids: typeof updater === "function" ? updater(currentIds) : updater,
      };
    });
  };

  // 1. Fetch Data Siswa
  const {
    data: studentsData,
    isLoading,
    isError,
    error,
  } = useStudents({ search: debouncedSearch });

  const students = studentsData?.data || [];
  const totalStudents = studentsData?.pagination?.totalData || students.length;

  // 2. Mutations
  const { save, remove, bulkRemove } = useStudentMutations();

  const handleSave = (data) => {
    save.mutate(
      { id: editingStudent?.id, data },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingStudent(null);
          showSuccessToast(
            editingStudent
              ? "Data siswa berhasil diperbarui!"
              : "Data siswa baru berhasil ditambahkan!",
          );
        },
        onError: (err) =>
          showErrorToast(
            err.response?.data?.message || "Gagal menyimpan data siswa.",
          ),
      },
    );
  };

  // 3. Selection Handlers
  const handleSelectAll = (e) => {
    updateSelectedIds(e.target.checked ? students.map((s) => s.id) : []);
  };

  const handleSelectRow = (id) => {
    updateSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleDeleteStudent = async (student) => {
    const isConfirmed = await confirm({
      title: "Hapus Siswa",
      message: `Apakah Anda yakin ingin menghapus data siswa "${student.name}"?`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
    });

    if (isConfirmed) {
      remove.mutate(student.id, {
        onSuccess: () => {
          updateSelectedIds((prev) => prev.filter((item) => item !== student.id));
          showSuccessToast(`Data siswa "${student.name}" berhasil dihapus.`);
        },
        onError: () => showErrorToast("Gagal menghapus data siswa."),
      });
    }
  };

  const handleBulkDelete = async () => {
    const isConfirmed = await confirm({
      title: "Hapus Siswa Massal",
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} data siswa terpilih? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus Semua",
      cancelText: "Batal",
      variant: "danger",
    });

    if (isConfirmed) {
      bulkRemove.mutate(selectedIds, {
        onSuccess: (failedIds) => {
          updateSelectedIds(failedIds);
          if (failedIds.length > 0) {
            showWarningToast(`${failedIds.length} data siswa gagal dihapus.`);
          } else {
            showSuccessToast("Seluruh data siswa terpilih berhasil dihapus.");
          }
        },
        onError: () =>
          showErrorToast("Sebagian atau seluruh data siswa gagal dihapus."),
      });
    }
  };

  // Metriks Total Poin
  const totalPoints = students.reduce(
    (acc, item) => acc + Number(item.points || 0),
    0,
  );

  // 4. Konfigurasi Kolom Tabel
  const columns = [
    {
      header: "Identitas Siswa",
      render: (s) => (
        <div>
          <span className="font-bold text-dark">{s.name}</span>
          <br />
          <span className="text-xs text-slate-400 font-mono">
            NIS: {s.nis || "-"}
          </span>
        </div>
      ),
    },
    {
      header: "Kelas & Jurusan",
      render: (s) => (
        <span className="text-slate-600 font-medium">
          {s.class || "-"} {s.major ? `(${s.major})` : ""}
        </span>
      ),
    },
    {
      header: "Saldo Poin",
      cellClassName: "font-mono font-bold text-dark",
      render: (s) => (
        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-200">
          {(s.points || 0).toLocaleString("id-ID")} Poin
        </span>
      ),
    },
    {
      header: "QR Member Token",
      render: (s) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <QrCode size={14} className="text-primary shrink-0" />
          <span className="truncate max-w-[120px]">{s.barcode || s.id}</span>
        </div>
      ),
    },
    {
      header: "Terdaftar",
      cellClassName: "font-mono text-slate-500",
      render: (s) => formatDate(s.createdAt || new Date()),
    },
    {
      header: "Aksi",
      className: "text-center",
      render: (s) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => {
              setEditingStudent(s);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
            title="Edit Siswa"
          >
            <Edit3 size={15} />
          </button>

          <button
            onClick={() => handleDeleteStudent(s)}
            className="p-1.5 text-slate-400 hover:text-danger hover:bg-danger/10 rounded transition-colors"
            title="Hapus Siswa"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">
            Kelola Data Siswa
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen akun member siswa, pengelolaan poin, dan identitas QR
            Member
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingStudent(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} /> Tambah Siswa Baru
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Siswa Terdaftar"
          value={totalStudents}
          icon={Users}
          trendLabel="Anggota Member Active"
        />
        <StatCard
          title="Total Poin Beredar"
          value={totalPoints.toLocaleString("id-ID")}
          icon={Award}
          trendLabel="Poin Siap Ditukar Voucher"
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Cari nama, NIS, atau email siswa..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Tabel Siswa */}
      <Table
        columns={columns}
        data={students}
        keyField="id"
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.response?.data?.message || error?.message}
        emptyMessage="Tidak ada data siswa ditemukan."
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
      />

      {/* Floating Bulk Action Bar */}
      <FloatingBulkBar
        selectedCount={selectedIds.length}
        itemLabel="Siswa Terpilih"
        onDelete={handleBulkDelete}
        onClear={() => updateSelectedIds([])}
        isDeleting={bulkRemove.isPending}
      />

      {/* Modal Form */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitData={handleSave}
        initialData={editingStudent}
        isSubmitting={save.isPending}
      />
    </div>
  );
}
