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

export default function KelolaSiswa() {
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
        },
        onError: (err) =>
          alert(err.response?.data?.message || "Gagal menyimpan data siswa."),
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

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedIds.length} data siswa terpilih?`,
      )
    ) {
      bulkRemove.mutate(selectedIds, {
        onSuccess: (failedIds) => {
          updateSelectedIds(failedIds);
          if (failedIds.length > 0) {
            alert(`${failedIds.length} data siswa gagal dihapus.`);
          }
        },
        onError: () => alert("Sebagian atau seluruh data siswa gagal dihapus."),
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
      header: "Nama Siswa",
      render: (s) => (
        <div>
          <span className="font-bold text-dark block">{s.name}</span>
          <span className="text-[11px] text-slate-400">{s.email}</span>
        </div>
      ),
    },
    {
      header: "NIS",
      cellClassName: "font-mono font-medium text-slate-600",
      render: (s) => s.nis || "-",
    },
    {
      header: "Kode QR Member",
      cellClassName: "font-mono text-[11px] text-slate-500",
      render: (s) => (
        <div className="flex items-center gap-1.5">
          <QrCode size={13} className="text-primary" />
          <span>{s.qrCodeMember || "-"}</span>
        </div>
      ),
    },
    {
      header: "Poin Loyalitas",
      render: (s) => (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
          <Award size={12} /> {s.points || 0} Poin
        </span>
      ),
    },
    {
      header: "Terdaftar",
      cellClassName: "font-mono text-slate-400 text-[11px]",
      render: (s) => formatDate(s.createdAt),
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
            onClick={() => {
              if (window.confirm(`Hapus data siswa "${s.name}"?`)) {
                remove.mutate(s.id, {
                  onSuccess: () =>
                    updateSelectedIds((prev) =>
                      prev.filter((item) => item !== s.id),
                    ),
                  onError: () => alert("Gagal menghapus data siswa."),
                });
              }
            }}
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
