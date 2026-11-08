// src/pages/admin/Dashboard.jsx
import { useState } from "react";
import {
  Wallet,
  ShoppingCart,
  Users,
  ArrowUpRight,
  Loader2,
  Download,
} from "lucide-react";

import StatCard from "../../components/admin/StatCard";
import SalesBarChart from "../../components/admin/SalesBarChart";
import CategoryDonutChart from "../../components/admin/CategoryDonutChart";

import { useAnalytics } from "../../hooks/admin/useAnalytics";
import { formatRupiah } from "../../utils/formatters";
import { downloadCsv } from "../../utils/exportCsv";
import { showWarningToast, showSuccessToast } from "../../utils/toast";

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState("7days");

  const { dashboard, sales } = useAnalytics(dateFilter);
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

  const chartSalesData = salesData || [];
  const chartCategoryData = dashboardData?.categoryData || [];

  const isLoading = isLoadingMetrics || isLoadingSales;

  const trendLabel =
    dateFilter === "30days"
      ? "vs 30 hari sebelumnya"
      : dateFilter === "thisMonth"
      ? "vs bulan sebelumnya"
      : "vs 7 hari sebelumnya";

  const handleDownloadCsv = () => {
    if (!chartSalesData || chartSalesData.length === 0) {
      showWarningToast("Belum ada data penjualan pada rentang waktu ini.");
      return;
    }

    try {
      const headers = ["Tanggal", "Omset (Pendapatan)", "Margin (Keuntungan)"];
      const rows = chartSalesData.map((d) => [
        d.date || "-",
        d.pendapatan || 0,
        d.keuntungan || 0,
      ]);
      downloadCsv(`laporan-penjualan-yasix-${dateFilter}`, headers, rows);
      showSuccessToast("Laporan CSV berhasil diunduh.");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan performa penjualan dan operasional YasixMerch
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <label htmlFor="filter-rentang" className="sr-only">Rentang Waktu Analitik</label>
          <select
            id="filter-rentang"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="7days">7 Hari Terakhir</option>
            <option value="30days">30 Hari Terakhir</option>
            <option value="thisMonth">Bulan Ini</option>
          </select>
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
              Unduh rincian penjualan aktual sesuai rentang tanggal yang dipilih untuk kebutuhan pembukuan kasir dan rekonsiliasi stok.
            </p>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="w-full py-2.5 bg-accent text-dark text-xs font-bold rounded-xl hover:bg-yellow-400 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              <Download size={14} />
              <span>Unduh Laporan Penjualan (.CSV)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
