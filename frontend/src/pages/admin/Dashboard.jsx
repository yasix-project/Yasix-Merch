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
      {/* Header Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

        {/* Action Controls: Filter Presets, Bulan, & Tanggal */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Control Mode */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterMode("preset")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === "preset"
                  ? "bg-white text-dark shadow-xs font-bold"
                  : "text-slate-500 hover:text-dark"
              }`}
            >
              Rentang Cepat
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("month")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === "month"
                  ? "bg-white text-dark shadow-xs font-bold"
                  : "text-slate-500 hover:text-dark"
              }`}
            >
              Pilih Bulan
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("date")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === "date"
                  ? "bg-white text-dark shadow-xs font-bold"
                  : "text-slate-500 hover:text-dark"
              }`}
            >
              Pilih Tanggal
            </button>
          </div>

          {/* Input Kontrol sesuai Mode */}
          {filterMode === "preset" && (
            <select
              id="filter-rentang"
              value={presetFilter}
              onChange={(e) => setPresetFilter(e.target.value)}
              className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
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
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs font-semibold text-slate-700 outline-none cursor-pointer bg-transparent"
                aria-label="Pilih bulan dan tahun analitik"
              />
            </div>
          )}

          {filterMode === "date" && (
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-semibold text-slate-700 outline-none cursor-pointer bg-transparent"
                aria-label="Pilih tanggal spesifik analitik"
              />
            </div>
          )}
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
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="w-full py-2.5 bg-accent text-dark text-xs font-bold rounded-xl hover:bg-yellow-400 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              <Download size={14} />
              <span>Unduh CSV ({activeFilterInfo.label})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
