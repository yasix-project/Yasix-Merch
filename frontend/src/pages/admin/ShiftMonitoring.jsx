import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Wallet,
  StopCircle,
  UserSquare2,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import FilterBar from "../../components/ui/FilterBar";
import { EndShiftModal } from "../../components/admin/ShiftModals";

import { useShiftMutations, useShifts } from "../../hooks/admin/useShifts";
import { formatRupiah, formatDate } from "../../utils/formatters";

export default function MonitoringShift() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [selectedActiveShift, setSelectedActiveShift] = useState(null);

  // 1. Ambil Seluruh Shift
  const { data: allShifts = [], isLoading, isError, error } = useShifts();

  // Pisahkan: Aktif (endTime null) dan Selesai
  const activeShifts = allShifts.filter((s) => !s.endTime);
  const historyShifts = allShifts.filter((s) => s.endTime);

  // 2. Mutation Tutup Shift Paksa
  const { endShift } = useShiftMutations();

  // 3. Handlers
  const handleForceClose = (shiftData) => {
    setSelectedActiveShift(shiftData);
    setIsEndModalOpen(true);
  };

  const submitEndShift = (data, resetForm) => {
    const payload = {
      ...data,
      shiftId: selectedActiveShift?.id, // Payload untuk Admin Force Close
    };
    endShift.mutate(payload, {
      onSuccess: () => {
        setIsEndModalOpen(false);
        setSelectedActiveShift(null);
        resetForm();
      },
      onError: (err) =>
        alert(err.response?.data?.message || "Gagal menutup shift kasir."),
    });
  };

  const filteredHistory = historyShifts.filter((s) =>
    s.cashier?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // 4. Konfigurasi Kolom Tabel
  const columns = [
    {
      header: "Nama Kasir",
      render: (s) => (
        <span className="font-bold text-dark">
          {s.cashier?.name || "Unknown"}
        </span>
      ),
    },
    {
      header: "Waktu Shift",
      render: (s) => (
        <div className="text-[11px] font-mono text-slate-500">
          <div>Buka: {formatDate(s.startTime)}</div>
          <div>Tutup: {formatDate(s.endTime)}</div>
        </div>
      ),
    },
    {
      header: "Modal Awal",
      cellClassName: "font-mono font-medium text-slate-600",
      render: (s) => formatRupiah(s.startCash),
    },
    {
      header: "Kas Sistem",
      cellClassName: "font-mono font-bold text-blue-600",
      render: (s) => formatRupiah(s.endCash || 0),
    },
    {
      header: "Kas Fisik (Laci)",
      cellClassName: "font-mono font-bold text-slate-700",
      render: (s) => (s.actualCash !== null ? formatRupiah(s.actualCash) : "-"),
    },
    {
      header: "Selisih",
      className: "text-center",
      render: (s) => {
        if (s.difference === null || s.difference === undefined) return "-";
        const isMinus = s.difference < 0;
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
              isMinus
                ? "bg-red-50 text-red-600 border border-red-200"
                : s.difference > 0
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {isMinus ? "" : "+"}
            {formatRupiah(s.difference)}
          </span>
        );
      },
    },
    {
      header: "Status",
      render: () => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-600">
          <CheckCircle2 size={11} /> Selesai
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">
            Monitoring Shift Kasir
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau kasir yang sedang bertugas dan rekonsiliasi riwayat kas
          </p>
        </div>
      </div>

      {/* Kasir Aktif */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          Kasir Sedang Bertugas ({activeShifts.length})
        </h3>

        {activeShifts.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-sm text-slate-500">
            Tidak ada kasir yang sedang membuka shift saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeShifts.map((shift) => (
              <div
                key={shift.id}
                className="bg-white border border-blue-100 shadow-sm rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <UserSquare2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-dark text-sm">
                        {shift.cashier?.name || "Kasir"}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 mt-0.5">
                        <Clock size={11} /> {formatDate(shift.startTime)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg flex justify-between items-center border border-slate-100">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Wallet size={13} /> Modal Laci
                  </span>
                  <span className="text-sm font-bold text-dark font-mono">
                    {formatRupiah(shift.startCash)}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleForceClose(shift)}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <StopCircle size={15} /> Paksa Tutup Shift
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Shift */}
      <div className="pt-6 mt-6 border-t border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-700">
          Riwayat Shift Terselesaikan
        </h3>

        <FilterBar
          searchPlaceholder="Cari nama kasir..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <Table
          columns={columns}
          data={filteredHistory}
          keyField="id"
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.response?.data?.message || error?.message}
          emptyMessage="Belum ada riwayat shift."
        />
      </div>

      <EndShiftModal
        isOpen={isEndModalOpen}
        onClose={() => {
          setIsEndModalOpen(false);
          setSelectedActiveShift(null);
        }}
        onSubmitData={submitEndShift}
        systemExpectedCash={selectedActiveShift?.expectedEndCash || 0}
        isSubmitting={endShift.isPending}
      />
    </div>
  );
}
