// src/services/analytics.service.js
const prisma = require("../config/prisma");

/**
 * Menghitung rentang tanggal saat ini dan periode sebelumnya berdasarkan filter / bulan / tanggal
 * Mendukung filter preset ('7days', '30days', 'thisMonth', 'lastMonth', 'today'),
 * serta filter spesifik bulan ('YYYY-MM') dan tanggal ('YYYY-MM-DD').
 */
const getDateRanges = (filterParams = "7days") => {
  const now = new Date();
  let currentStart, currentEnd, prevStart, prevEnd;

  let filter = "7days";
  let month = null;
  let date = null;
  let startDate = null;
  let endDate = null;

  if (typeof filterParams === "string") {
    filter = filterParams;
    if (/^\d{4}-\d{2}$/.test(filterParams)) {
      filter = "month";
      month = filterParams;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(filterParams)) {
      filter = "date";
      date = filterParams;
    }
  } else if (typeof filterParams === "object" && filterParams !== null) {
    filter = filterParams.filter || "7days";
    month = filterParams.month || (/^\d{4}-\d{2}$/.test(filter) ? filter : null);
    date = filterParams.date || (/^\d{4}-\d{2}-\d{2}$/.test(filter) ? filter : null);
    startDate = filterParams.startDate || null;
    endDate = filterParams.endDate || null;
  }

  if (filter === "custom" && startDate && endDate) {
    currentStart = new Date(startDate);
    currentStart.setHours(0, 0, 0, 0);

    currentEnd = new Date(endDate);
    currentEnd.setHours(23, 59, 59, 999);

    const duration = currentEnd.getTime() - currentStart.getTime();
    prevEnd = new Date(currentStart.getTime() - 1);
    prevStart = new Date(prevEnd.getTime() - duration);
  } else if ((filter === "date" || date) && date) {
    // Filter tanggal spesifik (YYYY-MM-DD)
    const [y, m, d] = date.split("-").map(Number);
    currentStart = new Date(y, m - 1, d, 0, 0, 0, 0);
    currentEnd = new Date(y, m - 1, d, 23, 59, 59, 999);

    prevStart = new Date(y, m - 1, d - 1, 0, 0, 0, 0);
    prevEnd = new Date(y, m - 1, d - 1, 23, 59, 59, 999);
  } else if ((filter === "month" || month) && month) {
    // Filter bulan spesifik (YYYY-MM)
    const [y, m] = month.split("-").map(Number);
    currentStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
    currentEnd = new Date(y, m, 0, 23, 59, 59, 999); // Hari terakhir bulan yang dipilih

    prevStart = new Date(y, m - 2, 1, 0, 0, 0, 0);
    prevEnd = new Date(y, m - 1, 0, 23, 59, 59, 999);
  } else if (filter === "today") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    prevStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    prevEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
  } else if (filter === "lastMonth") {
    currentStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    currentEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
    prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
  } else if (filter === "thisMonth") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (filter === "30days") {
    currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - 30);
    currentStart.setHours(0, 0, 0, 0);

    currentEnd = new Date(now);
    currentEnd.setHours(23, 59, 59, 999);

    prevEnd = new Date(currentStart);
    prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);

    prevStart = new Date(currentStart);
    prevStart.setDate(prevStart.getDate() - 30);
    prevStart.setHours(0, 0, 0, 0);
  } else {
    // Default: 7days
    currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - 7);
    currentStart.setHours(0, 0, 0, 0);

    currentEnd = new Date(now);
    currentEnd.setHours(23, 59, 59, 999);

    prevEnd = new Date(currentStart);
    prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);

    prevStart = new Date(currentStart);
    prevStart.setDate(prevStart.getDate() - 7);
    prevStart.setHours(0, 0, 0, 0);
  }

  const isSingleDay = filter === "date" || filter === "today" || (date !== null && filter !== "month");

  return { currentStart, currentEnd, prevStart, prevEnd, isSingleDay };
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

const getDashboardMetricsService = async (filterParams = "7days") => {
  const { currentStart, currentEnd, prevStart, prevEnd } = getDateRanges(filterParams);

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
    KEBUTUHAN_SISWA: "#10A352",
    MERCHANDISE: "#8B5CF6",
    JASA_PRINT: "#EC4899",
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
      value: percentage, // Persentase untuk chart & visualisasi porsi
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

const getSalesReportService = async (filterParams = "7days") => {
  const { currentStart, currentEnd, isSingleDay } = getDateRanges(filterParams);

  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: { gte: currentStart, lte: currentEnd },
      status: "COMPLETED",
    },
    include: {
      cashier: {
        select: { id: true, name: true, email: true },
      },
      student: {
        select: { id: true, name: true, nis: true },
      },
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const salesGroupMap = {};
  let totalPeriodRevenue = 0;
  let totalPeriodHpp = 0;

  const detailedTransactions = transactions.map((tx) => {
    const txTotal = Number(tx.totalAmount);
    totalPeriodRevenue += txTotal;

    let txHpp = 0;
    const itemNames = tx.items
      .map((it) => {
        if (it.product) {
          txHpp += Number(it.product.hpp) * it.quantity;
        }
        return `${it.itemName} (${it.quantity}x)`;
      })
      .join(", ");

    totalPeriodHpp += txHpp;
    const txMargin = txTotal - txHpp;

    // Kunci grup grafik: jika single day, agregasi per jam; jika multi-hari/bulan, per tanggal
    const groupKey = isSingleDay
      ? `${String(new Date(tx.createdAt).getHours()).padStart(2, "0")}:00`
      : new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
        }).format(tx.createdAt);

    if (!salesGroupMap[groupKey]) {
      salesGroupMap[groupKey] = { date: groupKey, pendapatan: 0, keuntungan: 0 };
    }

    salesGroupMap[groupKey].pendapatan += txTotal;
    salesGroupMap[groupKey].keuntungan += txMargin;

    return {
      id: tx.id,
      invoiceNumber: tx.invoiceNumber,
      createdAt: tx.createdAt,
      formattedDate: new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(tx.createdAt)
        .replace(/\./g, ":"),
      cashierName: tx.cashier?.name || "Kasir",
      studentName: tx.student?.name || "Umum / Non-Member",
      studentNis: tx.student?.nis || "-",
      paymentMethod: tx.paymentMethod,
      itemsSummary: itemNames || "-",
      subtotal: Number(tx.subtotal),
      discountAmount: Number(tx.discountAmount),
      totalAmount: txTotal,
      hpp: txHpp,
      margin: txMargin,
    };
  });

  const chartData = Object.values(salesGroupMap);

  return {
    chartData,
    transactions: detailedTransactions,
    summary: {
      totalPendapatan: totalPeriodRevenue,
      totalKeuntungan: totalPeriodRevenue - totalPeriodHpp,
      totalTransaksi: transactions.length,
      currentStart,
      currentEnd,
    },
  };
};

module.exports = {
  getDashboardMetricsService,
  getSalesReportService,
};
