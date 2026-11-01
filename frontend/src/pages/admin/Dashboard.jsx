// src/pages/admin/Dashboard.jsx
import { useState } from "react";
import {
  Wallet,
  ShoppingCart,
  Users,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

import StatCard from "../../components/admin/StatCard";
import SalesBarChart from "../../components/admin/SalesBarChart";
import CategoryDonutChart from "../../components/admin/CategoryDonutChart";

import { useAnalytics } from "../../hooks/admin/useAnalytics";
import { formatRupiah } from "../../utils/formatters";

// --- FALLBACK DUMMY DATA ---
const dummySalesData = [
  { date: "1 Jul", pendapatan: 450000, keuntungan: 180000 },
  { date: "2 Jul", pendapatan: 620000, keuntungan: 250000 },
  { date: "3 Jul", pendapatan: 380000, keuntungan: 120000 },
  { date: "4 Jul", pendapatan: 890000, keuntungan: 340000 },
  { date: "5 Jul", pendapatan: 750000, keuntungan: 290000 },
  { date: "6 Jul", pendapatan: 980000, keuntungan: 410000 },
  { date: "7 Jul", pendapatan: 540000, keuntungan: 210000 },
];

const dummyCategoryData = [
  { name: "Makanan ringan", value: 42, color: "#1C62C4" },
  { name: "Minuman", value: 28, color: "#38BDF8" },
  { name: "ATK & Alat Tulis", value: 18, color: "#FFC800" },
  { name: "Merchandise", value: 12, color: "#0F2B5B" },
];
// -----------------------------

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState("7days");

  const { dashboard, sales } = useAnalytics(dateFilter);
  const { data: dashboardData, isLoading: isLoadingMetrics } = dashboard;
  const { data: salesData, isLoading: isLoadingSales } = sales;

  // Pemetaan Data (Gunakan data asli jika ada, jika tidak pakai dummy)
  const metrics = dashboardData?.metrics || {
    totalPendapatan: 4610000,
    totalTransaksi: 1136,
    totalSiswa: 567,
    labaBersih: 1800000,
    trendPendapatan: 12.5,
    trendTransaksi: -0.8,
    trendSiswa: 4.2,
    trendLaba: 8.1,
  };

  const chartSalesData = salesData || dummySalesData;
  const chartCategoryData = dashboardData?.categoryData || dummyCategoryData;

  const isLoading = isLoadingMetrics || isLoadingSales;

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
          <p className="text-xs text-slate-400 mt-0.5">
            Ringkasan performa penjualan Yasix Merch
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white px-3 py-2 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600 shadow-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
        />
        <StatCard
          title="Total Transaksi"
          value={metrics.totalTransaksi.toLocaleString("id-ID")}
          icon={ShoppingCart}
          trend={metrics.trendTransaksi}
        />
        <StatCard
          title="Siswa/Pelanggan"
          value={metrics.totalSiswa.toLocaleString("id-ID")}
          icon={Users}
          trend={metrics.trendSiswa}
        />
        <StatCard
          title="Laba Bersih"
          value={formatRupiah(metrics.labaBersih)}
          icon={ArrowUpRight}
          trend={metrics.trendLaba}
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
        <div className="bg-linear-to-br from-dark to-primary rounded-2xl p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-full text-cyan border border-white/10">
              Informasi Aktif
            </span>
            <h3 className="text-lg font-bold text-white pt-2">
              Status Operasional
            </h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              Business Center SMK Yadika 6 saat ini beroperasi dengan baik.
              Pantau terus grafik penjualan untuk melihat performa HPP dan Laba
              secara aktual.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <button className="w-full py-2.5 bg-accent text-dark text-xs font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-sm">
              Unduh Laporan Lengkap (.CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
