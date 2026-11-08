// src/services/analytics.service.js
const prisma = require("../config/prisma");

/**
 * Menghitung rentang tanggal saat ini dan periode sebelumnya berdasarkan filter
 * @param {'7days' | '30days' | 'thisMonth'} filter
 */
const getDateRanges = (filter = "7days") => {
  const now = new Date();
  let currentStart, prevStart, prevEnd;

  if (filter === "30days") {
    currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - 30);
    currentStart.setHours(0, 0, 0, 0);

    prevEnd = new Date(currentStart);
    prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);

    prevStart = new Date(currentStart);
    prevStart.setDate(prevStart.getDate() - 30);
    prevStart.setHours(0, 0, 0, 0);
  } else if (filter === "thisMonth") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    prevEnd = new Date(currentStart);
    prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);

    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  } else {
    // Default: 7days
    currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - 7);
    currentStart.setHours(0, 0, 0, 0);

    prevEnd = new Date(currentStart);
    prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);

    prevStart = new Date(currentStart);
    prevStart.setDate(prevStart.getDate() - 7);
    prevStart.setHours(0, 0, 0, 0);
  }

  const currentEnd = new Date();
  currentEnd.setHours(23, 59, 59, 999);

  return { currentStart, currentEnd, prevStart, prevEnd };
};

/**
 * Menghitung persentase perubahan dari nilai sebelumnya
 */
const calculateTrend = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const getDashboardMetricsService = async (filter = "7days") => {
  const { currentStart, currentEnd, prevStart, prevEnd } = getDateRanges(filter);

  // --- 1. AMBIL TRANSAKSI PERIODE AKTIF SESUAI FILTER ---
  const currentTransactions = await prisma.transaction.findMany({
    where: {
      createdAt: { gte: currentStart, lte: currentEnd },
      status: "COMPLETED",
    },
    include: {
      items: {
        include: {
          product: { include: { category: true } },
        },
      },
    },
  });

  // --- 2. AMBIL TRANSAKSI PERIODE SEBELUMNYA (UNTUK TREND REAL-TIME) ---
  const prevTransactions = await prisma.transaction.findMany({
    where: {
      createdAt: { gte: prevStart, lte: prevEnd },
      status: "COMPLETED",
    },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  // --- 3. AMBIL SEMUA KATEGORI DARI DATABASE ---
  const allCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // Hitung metrik periode berjalan
  let currentRevenue = 0;
  let currentHpp = 0;

  // Inisialisasi peta penjualan kategori: Munculkan SEMUA kategori terlebih dahulu
  const categorySalesMap = {};
  allCategories.forEach((cat) => {
    categorySalesMap[cat.id] = {
      id: cat.id,
      name: cat.name,
      type: cat.type,
      totalNominal: 0,
      totalItemsSold: 0,
    };
  });

  currentTransactions.forEach((tx) => {
    currentRevenue += Number(tx.totalAmount);
    tx.items.forEach((item) => {
      if (item.product) {
        currentHpp += Number(item.product.hpp) * item.quantity;

        const catId = item.product.categoryId || item.product.category?.id;
        const itemNominal = Number(item.price) * item.quantity;

        if (catId && categorySalesMap[catId]) {
          categorySalesMap[catId].totalNominal += itemNominal;
          categorySalesMap[catId].totalItemsSold += item.quantity;
        } else {
          const fallbackId = "other";
          if (!categorySalesMap[fallbackId]) {
            categorySalesMap[fallbackId] = {
              id: fallbackId,
              name: item.product.category?.name || "Lainnya",
              type: "LAINNYA",
              totalNominal: 0,
              totalItemsSold: 0,
            };
          }
          categorySalesMap[fallbackId].totalNominal += itemNominal;
          categorySalesMap[fallbackId].totalItemsSold += item.quantity;
        }
      }
    });
  });

  const currentProfit = currentRevenue - currentHpp;

  // Hitung metrik periode sebelumnya
  let prevRevenue = 0;
  let prevHpp = 0;
  prevTransactions.forEach((tx) => {
    prevRevenue += Number(tx.totalAmount);
    tx.items.forEach((item) => {
      if (item.product) {
        prevHpp += Number(item.product.hpp) * item.quantity;
      }
    });
  });
  const prevProfit = prevRevenue - prevHpp;

  // --- 4. HITUNG PERSENTASE SETIAP KATEGORI DARI TOTAL PENJUALAN ---
  const totalCategorySales = Object.values(categorySalesMap).reduce(
    (sum, c) => sum + c.totalNominal,
    0,
  );

  const categoryColors = {
    ATK: "#FFC800",
    KIK_PRODUCT: "#1C62C4",
    MINUMAN: "#38BDF8",
    MAKANAN: "#F97316",
    SERAGAM: "#10A352",
    MERCHANDISE: "#8B5CF6",
    LAINNYA: "#0F2B5B",
  };

  const defaultPalette = [
    "#1C62C4",
    "#38BDF8",
    "#FFC800",
    "#10A352",
    "#8B5CF6",
    "#F97316",
    "#EC4899",
    "#0F2B5B",
  ];

  // Seluruh kategori dimunculkan, lalu dihitung persentasenya
  const categoryData = Object.values(categorySalesMap).map((cat, idx) => {
    const percentage =
      totalCategorySales > 0
        ? Number(((cat.totalNominal / totalCategorySales) * 100).toFixed(1))
        : 0;

    return {
      id: cat.id,
      name: cat.name,
      value: percentage, // Persentase (misal: 42.5) untuk chart & visualisasi porsi
      nominal: cat.totalNominal, // Nominal rupiah aktual
      itemsSold: cat.totalItemsSold,
      color:
        categoryColors[cat.type] ||
        defaultPalette[idx % defaultPalette.length],
    };
  });

  // Urutkan kategori terlaris (nominal/persentase terbesar ke terkecil)
  categoryData.sort((a, b) => b.nominal - a.nominal);

  // --- 5. METRIK PENDUKUNG ---
  const pendingPrintOrders = await prisma.printOrder.count({
    where: { status: "PENDING" },
  });

  const totalSiswa = await prisma.user.count({
    where: { role: "SISWA" },
  });

  let lowStockCount = 0;
  try {
    lowStockCount = await prisma.product.count({
      where: {
        stock: { lte: 5 },
      },
    });
  } catch {
    lowStockCount = 0;
  }

  const metrics = {
    totalPendapatan: currentRevenue,
    totalTransaksi: currentTransactions.length,
    totalSiswa: totalSiswa,
    labaBersih: currentProfit,
    trendPendapatan: calculateTrend(currentRevenue, prevRevenue),
    trendTransaksi: calculateTrend(
      currentTransactions.length,
      prevTransactions.length,
    ),
    trendSiswa: 0,
    trendLaba: calculateTrend(currentProfit, prevProfit),
    pendingPrintOrders,
    lowStockCount,
  };

  return { metrics, categoryData };
};

const getSalesReportService = async (filter = "7days") => {
  const { currentStart, currentEnd } = getDateRanges(filter);

  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: { gte: currentStart, lte: currentEnd },
      status: "COMPLETED",
    },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const salesByDate = {};

  transactions.forEach((tx) => {
    const dateStr = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(tx.createdAt);

    if (!salesByDate[dateStr]) {
      salesByDate[dateStr] = { date: dateStr, pendapatan: 0, keuntungan: 0 };
    }

    salesByDate[dateStr].pendapatan += Number(tx.totalAmount);

    let hpp = 0;
    tx.items.forEach((item) => {
      if (item.product) {
        hpp += Number(item.product.hpp) * item.quantity;
      }
    });

    salesByDate[dateStr].keuntungan += Number(tx.totalAmount) - hpp;
  });

  return Object.values(salesByDate);
};

module.exports = {
  getDashboardMetricsService,
  getSalesReportService,
};
