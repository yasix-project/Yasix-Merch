// src/pages/admin/Dashboard.jsx
import { useState, useMemo } from "react";
import {
  Wallet,
  ShoppingCart,
  Users,
  ArrowUpRight,
  Loader2,
  Download,
  Calendar,
} from "lucide-react";

import Button from "../../components/ui/Button";
import StatCard from "../../components/admin/StatCard";
import SalesBarChart from "../../components/admin/SalesBarChart";
import CategoryDonutChart from "../../components/admin/CategoryDonutChart";

import { useAnalytics } from "../../hooks/admin/useAnalytics";
import { formatRupiah } from "../../utils/formatters";
import { downloadCsv } from "../../utils/exportCsv";
import { showWarningToast, showSuccessToast } from "../../utils/toast";

export default function Dashboard() {
  const [filterMode, setFilterMode] = useState("preset"); // "preset" | "month" | "date"
  const [presetFilter, setPresetFilter] = useState("7days");
  const [selectedMonth, setSelectedMonth] = useState("2026-11");
  const [selectedDate, setSelectedDate] = useState("2026-11-08");

  // Konstruksi payload parameter filter untuk hook analitik
  const filterParams = useMemo(() => {
    if (filterMode === "month") {
      return { filter: "month", month: selectedMonth };
    }
    if (filterMode === "date") {
      return { filter: "date", date: selectedDate };
    }
    return { filter: presetFilter };
  }, [filterMode, presetFilter, selectedMonth, selectedDate]);

  const { dashboard, sales } = useAnalytics(filterParams);
  const { data: dashboardData, isLoading: isLoadingMetrics } = dashboard;
  const { data: salesData, isLoading: isLoadingSales } = sales;

  // Pemetaan Data Riil (Nilai 0 jika belum ada data, tanpa angka fiktif)
  const metrics = dashboardData?.metrics || {
    totalPendapatan: 0,
    totalTransaksi: 0,
    totalSiswa: 0,
    labaBersih: 0,
    trendPendapatan: undefined,
    trendTransaksi: undefined,
    trendSiswa: undefined,
    trendLaba: undefined,
  };

  const chartSalesData = Array.isArray(salesData)
    ? salesData
    : salesData?.chartData || [];
  const detailedTransactions = salesData?.transactions || [];
  const chartCategoryData = dashboardData?.categoryData || [];

  const isLoading = isLoadingMetrics || isLoadingSales;

  // Label perbandingan tren dinamis sesuai periode yang dipilih
  const trendLabel = useMemo(() => {
    if (filterMode === "month") return "vs bulan sebelumnya";
    if (filterMode === "date") return "vs hari sebelumnya";
    if (presetFilter === "30days") return "vs 30 hari sebelumnya";
    if (presetFilter === "thisMonth") return "vs bulan sebelumnya";
    if (presetFilter === "lastMonth") return "vs 2 bulan lalu";
    if (presetFilter === "today") return "vs kemarin";
    return "vs 7 hari sebelumnya";
  }, [filterMode, presetFilter]);

  // Label & suffix nama file ekspor CSV sesuai filter aktif
  const activeFilterInfo = useMemo(() => {
    if (filterMode === "month") {
      const [y, m] = selectedMonth.split("-");
      const monthDate = new Date(Number(y), Number(m) - 1, 1);
      const label = new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      }).format(monthDate);
      return { label: `Bulan ${label}`, suffix: `bulan-${selectedMonth}` };
    }
    if (filterMode === "date") {
      const [y, m, d] = selectedDate.split("-");
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      const label = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(dateObj);
      return { label: `Tanggal ${label}`, suffix: `tanggal-${selectedDate}` };
    }
    const presetLabels = {
      "7days": "7 Hari Terakhir",
      "30days": "30 Hari Terakhir",
      thisMonth: "Bulan Ini",
      lastMonth: "Bulan Lalu",
      today: "Hari Ini",
    };
    return {
      label: presetLabels[presetFilter] || "7 Hari Terakhir",
      suffix: presetFilter,
    };
  }, [filterMode, selectedMonth, selectedDate, presetFilter]);

  const handleDownloadCsv = () => {
    if (
      (!detailedTransactions || detailedTransactions.length === 0) &&
      (!chartSalesData || chartSalesData.length === 0)
    ) {
      showWarningToast("Belum ada data penjualan pada periode yang dipilih.");
      return;
    }

    try {
      if (detailedTransactions && detailedTransactions.length > 0) {
        // Ekspor rincian transaksi lengkap untuk pembukuan kasir & rekonsiliasi
        const headers = [
          "No",
          "No. Faktur",
          "Tanggal & Waktu",
          "Kasir",
          "Pelanggan / Siswa",
          "Metode Bayar",
          "Rincian Produk",
          "Total Belanja (Rp)",
          "Margin Bersih (Rp)",
        ];
        const rows = detailedTransactions.map((tx, idx) => [
          idx + 1,
          tx.invoiceNumber,
          tx.formattedDate,
          tx.cashierName,
          tx.studentName,
          tx.paymentMethod,
          tx.itemsSummary,
          tx.totalAmount,
          tx.margin,
        ]);
        downloadCsv(
          `laporan-penjualan-yasix-${activeFilterInfo.suffix}`,
          headers,
          rows,
        );
      } else {
        // Fallback: Ekspor rekapitulasi grafik harian
        const headers = ["Tanggal / Jam", "Omset (Pendapatan)", "Margin (Keuntungan)"];
        const rows = chartSalesData.map((d) => [
          d.date || "-",
          d.pendapatan || 0,
          d.keuntungan || 0,
        ]);
        downloadCsv(
          `laporan-penjualan-yasix-${activeFilterInfo.suffix}`,
          headers,
          rows,
        );
      }
      showSuccessToast(
        `Laporan CSV (${activeFilterInfo.label}) berhasil diunduh.`,
      );
    } catch {
      showWarningToast("Gagal memproses ekspor CSV.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 size={40} className="animate-spin text-primary mb-4" />
        <p className="text-sm font-semibold">Memuat Data Analitik...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header Top Bar: Konsisten dengan halaman admin lainnya */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan performa penjualan dan operasional YasixMerch &bull;{" "}
            <span className="font-semibold text-primary">
              {activeFilterInfo.label}
            </span>
          </p>
        </div>

        {/* Action Button: Export CSV di Header konsisten dengan seluruh halaman admin */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadCsv}
        >
          <Download size={15} className="text-slate-500" />
          <span>Export CSV ({activeFilterInfo.label})</span>
        </Button>
      </div>

      {/* Filter Bar Konsisten: Desain & Wadah Sama dengan Halaman Lain */}
      <div className="bg-bright p-2 rounded-2xl border border-slate-200 shadow-sm shadow-dark/5 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        {/* Tab Mode Filter: Konsisten dengan Tab FilterBar */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto w-full md:w-auto">
          <button
            type="button"
            onClick={() => setFilterMode("preset")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === "preset"
                ? "bg-dark text-white shadow-md shadow-dark/25 font-bold"
                : "text-slate-500 hover:bg-sky/60 hover:text-dark"
            }`}
          >
            {filterMode === "preset" && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
            Rentang Cepat
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("month")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === "month"
                ? "bg-dark text-white shadow-md shadow-dark/25 font-bold"
                : "text-slate-500 hover:bg-sky/60 hover:text-dark"
            }`}
          >
            {filterMode === "month" && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
            Pilih Bulan
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("date")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === "date"
                ? "bg-dark text-white shadow-md shadow-dark/25 font-bold"
                : "text-slate-500 hover:bg-sky/60 hover:text-dark"
            }`}
          >
            {filterMode === "date" && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
            Pilih Tanggal
          </button>
        </div>

        {/* Input Kontrol Filter: Lebar & Posisi Konsisten */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            {filterMode === "preset" && (
              <select
                id="filter-rentang"
                value={presetFilter}
                onChange={(e) => setPresetFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium text-dark bg-white border border-slate-200 rounded-xl outline-none hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all cursor-pointer"
                aria-label="Pilihan rentang waktu cepat"
              >
                <option value="7days">7 Hari Terakhir</option>
                <option value="30days">30 Hari Terakhir</option>
                <option value="thisMonth">Bulan Ini</option>
                <option value="lastMonth">Bulan Lalu</option>
                <option value="today">Hari Ini</option>
              </select>
            )}

            {filterMode === "month" && (
              <div className="relative flex items-center">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={15}
                />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium text-dark bg-white border border-slate-200 rounded-xl outline-none hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all cursor-pointer"
                  aria-label="Pilih bulan dan tahun analitik"
                />
              </div>
            )}

            {filterMode === "date" && (
              <div className="relative flex items-center">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={15}
                />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium text-dark bg-white border border-slate-200 rounded-xl outline-none hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all cursor-pointer"
                  aria-label="Pilih tanggal spesifik analitik"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pendapatan"
          value={formatRupiah(metrics.totalPendapatan)}
          icon={Wallet}
          trend={metrics.trendPendapatan}
          trendLabel={trendLabel}
        />
        <StatCard
          title="Total Transaksi"
          value={metrics.totalTransaksi.toLocaleString("id-ID")}
          icon={ShoppingCart}
          trend={metrics.trendTransaksi}
          trendLabel={trendLabel}
        />
        <StatCard
          title="Siswa/Pelanggan"
          value={metrics.totalSiswa.toLocaleString("id-ID")}
          icon={Users}
          trend={metrics.trendSiswa}
          trendLabel="Total terdaftar"
        />
        <StatCard
          title="Laba Bersih"
          value={formatRupiah(metrics.labaBersih)}
          icon={ArrowUpRight}
          trend={metrics.trendLaba}
          trendLabel={trendLabel}
        />
      </div>

      {/* Row 2: Bar Chart Utama */}
      <SalesBarChart data={chartSalesData} />

      {/* Row 3: Donut Chart & Ringkasan Penjualan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryDonutChart data={chartCategoryData} />
        </div>

        {/* Quick Info Card */}
        <div className="bg-dark rounded-2xl p-6 text-white border border-slate-700 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-full text-sky border border-white/10 inline-block">
              Unit Produksi
            </span>
            <h3 className="text-lg font-bold text-white pt-2">
              Laporan Penjualan
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              Unduh rincian penjualan aktual sesuai periode yang dipilih (
              <span className="font-semibold text-accent">
                {activeFilterInfo.label}
              </span>
              ) untuk kebutuhan pembukuan kasir dan rekonsiliasi stok.
            </p>
          </div>

          <div className="pt-6">
            <Button
              variant="amber"
              className="w-full"
              onClick={handleDownloadCsv}
            >
              <Download size={14} />
              <span>Unduh CSV ({activeFilterInfo.label})</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
