// backend/prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding data realistis YasixMerch (SMK Yadika 6)...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  // ==========================================
  // 1. SEED USERS (Admin, Kasir, Siswa)
  // ==========================================
  const admin = await prisma.user.upsert({
    where: { email: "admin@smkyadika6.sch.id" },
    update: { password: hashedPassword },
    create: {
      name: "Admin YasixMerch",
      email: "admin@smkyadika6.sch.id",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const kasir1 = await prisma.user.upsert({
    where: { email: "kasir@smkyadika6.sch.id" },
    update: { password: hashedPassword },
    create: {
      name: "Siti Rahmawati (Kasir Shift 1)",
      email: "kasir@smkyadika6.sch.id",
      password: hashedPassword,
      role: "KASIR",
    },
  });

  const kasir2 = await prisma.user.upsert({
    where: { email: "kasir2@smkyadika6.sch.id" },
    update: { password: hashedPassword },
    create: {
      name: "Rizky Ramadhan (Kasir Shift 2)",
      email: "kasir2@smkyadika6.sch.id",
      password: hashedPassword,
      role: "KASIR",
    },
  });

  const siswaList = [
    {
      nis: "20261001",
      name: "Budi Pratama - XII RPL 1",
      email: "siswa@smkyadika6.sch.id",
      qrCodeMember: "MEMBER-20261001",
      points: 215,
    },
    {
      nis: "20261002",
      name: "Aditya Wardhana - XII TKJ 2",
      email: "aditya@smkyadika6.sch.id",
      qrCodeMember: "MEMBER-20261002",
      points: 140,
    },
    {
      nis: "20261003",
      name: "Siti Nurhaliza - XI DKV 1",
      email: "siti.dkv@smkyadika6.sch.id",
      qrCodeMember: "MEMBER-20261003",
      points: 310,
    },
    {
      nis: "20261004",
      name: "Farhan Kurniawan - XI AKL",
      email: "farhan.akl@smkyadika6.sch.id",
      qrCodeMember: "MEMBER-20261004",
      points: 85,
    },
    {
      nis: "20261005",
      name: "Zahra Aulia - X MPLB",
      email: "zahra.mplb@smkyadika6.sch.id",
      qrCodeMember: "MEMBER-20261005",
      points: 45,
    },
  ];

  const createdStudents = {};
  for (const s of siswaList) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        nis: s.nis,
        name: s.name,
        qrCodeMember: s.qrCodeMember,
        points: s.points,
        password: hashedPassword,
      },
      create: {
        nis: s.nis,
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: "SISWA",
        qrCodeMember: s.qrCodeMember,
        points: s.points,
      },
    });
    createdStudents[s.nis] = student;
  }
  console.log("✓ Akun pengguna (Admin, 2 Kasir, 5 Siswa Member) siap.");

  // ==========================================
  // 2. SEED KATEGORI PRODUK
  // ==========================================
  const categoriesDef = [
    {
      name: "Alat Tulis Kantor & Sekolah",
      description: "Peralatan tulis dan perlengkapan harian belajar siswa.",
      type: "ATK",
    },
    {
      name: "Jasa Cetak & Dokumen",
      description: "Layanan cetak tugas, dokumen, laporan PKL mandiri.",
      type: "JASA_PRINT",
    },
    {
      name: "Produk Kreatif & KIK Siswa",
      description: "Karya kewirausahaan dan kreativitas siswa SMK Yadika 6.",
      type: "KIK_PRODUCT",
    },
    {
      name: "Seragam & Merchandise Yadika 6",
      description: "Atribut resmi sekolah, dasi, topi, kaos kaki, dan lanyard.",
      type: "KEBUTUHAN_SISWA",
    },
    {
      name: "Snack & Minuman Siswa",
      description: "Makanan ringan dan minuman pelepas dahaga koperasi.",
      type: "LAINNYA",
    },
  ];

  const createdCategories = {};
  for (const cat of categoriesDef) {
    let existing = await prisma.category.findFirst({
      where: { name: cat.name },
    });
    if (!existing) {
      existing = await prisma.category.create({
        data: cat,
      });
    }
    createdCategories[cat.type] = existing;
  }
  console.log("✓ 5 Kategori Produk siap.");

  // ==========================================
  // 3. SEED PRODUK DENGAN REAL BARCODE EAN-13
  // ==========================================
  const productsDef = [
    // ATK
    {
      catType: "ATK",
      barcode: "899123456701",
      name: "Pensil 2B Faber-Castell",
      description: "Pensil standar ujian nasional OMR kualitas terbaik.",
      hpp: 3000,
      margin: 33.33,
      sellingPrice: 4000,
      stock: 65,
      minStock: 10,
    },
    {
      catType: "ATK",
      barcode: "899123456702",
      name: "Buku Tulis Sidu 38 Lembar",
      description: "Buku catatan bergaris Sinar Dunia ukuran B5.",
      hpp: 3500,
      margin: 28.57,
      sellingPrice: 4500,
      stock: 120,
      minStock: 20,
    },
    {
      catType: "ATK",
      barcode: "899886610001",
      name: "Pulpen Standard AE7 0.5 Black",
      description: "Pulpen tinta hitam pekat mata pena jarum lancip.",
      hpp: 2200,
      margin: 36.36,
      sellingPrice: 3000,
      stock: 85,
      minStock: 15,
    },
    {
      catType: "ATK",
      barcode: "899886620002",
      name: "Penghapus Joyko Hitam B-40",
      description: "Penghapus pensil bersih tanpa debu hitam pekat.",
      hpp: 1500,
      margin: 33.33,
      sellingPrice: 2000,
      stock: 50,
      minStock: 10,
    },
    {
      catType: "ATK",
      barcode: "899886630003",
      name: "Penggaris Butterfly 30cm Transparan",
      description: "Mistar lurus plastik transparan 30 centimeter.",
      hpp: 3500,
      margin: 42.86,
      sellingPrice: 5000,
      stock: 40,
      minStock: 8,
    },
    {
      catType: "ATK",
      barcode: "899886640004",
      name: "Joyko Correction Tape (Tipe-X Kertas)",
      description: "Pita koreksi kertas cepat kering dan rapi 12 meter.",
      hpp: 6000,
      margin: 33.33,
      sellingPrice: 8000,
      stock: 35,
      minStock: 5,
    },
    {
      catType: "ATK",
      barcode: "899886660006",
      name: "Map Folio Kancing Transparan",
      description: "Map plastik kancing untuk menyimpan berkas dan tugas.",
      hpp: 2000,
      margin: 50.0,
      sellingPrice: 3000,
      stock: 75,
      minStock: 15,
    },
    // Atribut & Seragam
    {
      catType: "KEBUTUHAN_SISWA",
      barcode: "899770010001",
      name: "Dasi Formal SMK Yadika 6",
      description: "Dasi resmi berlogo bordir SMK Yadika 6 untuk seragam Senin.",
      hpp: 15000,
      margin: 33.33,
      sellingPrice: 20000,
      stock: 4, // Set low stock (< minStock) untuk demo alert stok
      minStock: 5,
    },
    {
      catType: "KEBUTUHAN_SISWA",
      barcode: "899770010002",
      name: "Kaos Kaki Putih Logo Yadika 6",
      description: "Kaos kaki rajut tebal bordir logo sekolah sebetis.",
      hpp: 10000,
      margin: 50.0,
      sellingPrice: 15000,
      stock: 60,
      minStock: 10,
    },
    {
      catType: "KEBUTUHAN_SISWA",
      barcode: "899770010003",
      name: "Lanyard & ID Card Holder Yadika 6",
      description: "Tali gantungan kartu pelajar berdesain modern.",
      hpp: 12000,
      margin: 50.0,
      sellingPrice: 18000,
      stock: 70,
      minStock: 10,
    },
    {
      catType: "KEBUTUHAN_SISWA",
      barcode: "899770010004",
      name: "Topi Upacara SMK Yadika 6",
      description: "Topi resmi upacara bendera bahan drill berkualitas.",
      hpp: 18000,
      margin: 38.89,
      sellingPrice: 25000,
      stock: 35,
      minStock: 5,
    },
    // Produk KIK Kreatif Siswa
    {
      catType: "KIK_PRODUCT",
      barcode: "899550010001",
      name: "Tote Bag Kanvas Karya KIK DKV",
      description: "Tas jinjing kanvas tebal dengan sablon ilustrasi orisinal siswa.",
      hpp: 25000,
      margin: 40.0,
      sellingPrice: 35000,
      stock: 30,
      minStock: 5,
    },
    {
      catType: "KIK_PRODUCT",
      barcode: "899550010002",
      name: "Gantungan Kunci Akrilik Yasix",
      description: "Merchandise akrilik dua sisi maskot YasixMerch.",
      hpp: 7000,
      margin: 42.86,
      sellingPrice: 10000,
      stock: 50,
      minStock: 10,
    },
    {
      catType: "KIK_PRODUCT",
      barcode: "899550010003",
      name: "Sticker Pack Hologram KIK",
      description: "Paket stiker tahan air efek hologram karya jurusan DKV.",
      hpp: 4000,
      margin: 50.0,
      sellingPrice: 6000,
      stock: 90,
      minStock: 15,
    },
    // Minuman & Snack
    {
      catType: "LAINNYA",
      barcode: "899600160018",
      name: "Le Minerale 600ml",
      description: "Air mineral pegunungan alami kaya mineral esensial.",
      hpp: 2500,
      margin: 40.0,
      sellingPrice: 3500,
      stock: 60,
      minStock: 12,
    },
    {
      catType: "LAINNYA",
      barcode: "899886670007",
      name: "Teh Pucuk Harum 350ml",
      description: "Minuman teh melati segar dengan ekstrak pucuk daun teh.",
      hpp: 3000,
      margin: 33.33,
      sellingPrice: 4000,
      stock: 48,
      minStock: 12,
    },
  ];

  const createdProducts = {};
  for (const p of productsDef) {
    const category = createdCategories[p.catType];
    const product = await prisma.product.upsert({
      where: { barcode: p.barcode },
      update: {
        name: p.name,
        description: p.description,
        hpp: p.hpp,
        margin: p.margin,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        minStock: p.minStock,
        categoryId: category.id,
        isActive: true,
      },
      create: {
        barcode: p.barcode,
        name: p.name,
        description: p.description,
        hpp: p.hpp,
        margin: p.margin,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        minStock: p.minStock,
        categoryId: category.id,
        isActive: true,
      },
    });
    createdProducts[p.barcode] = product;
  }
  console.log("✓ 16 Produk Realistis dengan Barcode EAN-13 siap.");

  // ==========================================
  // 4. SEED VOUCHER DISKON
  // ==========================================
  const vouchersDef = [
    {
      code: "YASIXHEMAT5",
      discountPct: 5.0,
      maxDiscount: 5000,
      minPurchase: 20000,
      validUntil: new Date("2027-12-31T23:59:59Z"),
      isActive: true,
    },
    {
      code: "GTNIC2026",
      discountPct: 10.0,
      maxDiscount: 10000,
      minPurchase: 30000,
      validUntil: new Date("2027-12-31T23:59:59Z"),
      isActive: true,
    },
    {
      code: "PELAJARJUARA",
      discountPct: 15.0,
      maxDiscount: 15000,
      minPurchase: 40000,
      validUntil: new Date("2027-12-31T23:59:59Z"),
      isActive: true,
    },
  ];

  const createdVouchers = {};
  for (const v of vouchersDef) {
    const voucher = await prisma.voucher.upsert({
      where: { code: v.code },
      update: v,
      create: v,
    });
    createdVouchers[v.code] = voucher;
  }
  console.log("✓ Voucher diskon siap.");

  // ==========================================
  // 5. SEED ORDER PRINT (DOKUMEN SISWA) HINGGA HARI INI 10 NOVEMBER 2026
  // ==========================================
  const printOrdersDef = [
    {
      orderNumber: "PRN-20261101-01",
      studentId: createdStudents["20261001"].id,
      fileUrl: "/uploads/prints/Laporan_PKL_Budi_Pratama.pdf",
      fileName: "Laporan_PKL_Budi_Pratama.pdf",
      pageCount: 36,
      colorType: "BW",
      paperSize: "A4",
      finishing: "Jilid Mika Biru",
      totalPrice: 18000,
      status: "COMPLETED",
      notes: "Selesai dicetak dan telah diambil.",
      createdAt: new Date("2026-11-01T08:00:00+07:00"),
    },
    {
      orderNumber: "PRN-20261105-02",
      studentId: createdStudents["20261003"].id,
      fileUrl: "/uploads/prints/Proposal_KIK_DKV_Siti.pdf",
      fileName: "Proposal_KIK_DKV_Siti.pdf",
      pageCount: 16,
      colorType: "COLOR",
      paperSize: "A4",
      finishing: "Jilid Lakban",
      totalPrice: 24000,
      status: "COMPLETED",
      notes: "Sudah diambil pada 5 November.",
      createdAt: new Date("2026-11-05T09:30:00+07:00"),
    },
    {
      orderNumber: "PRN-20261109-03",
      studentId: createdStudents["20261002"].id,
      fileUrl: "/uploads/prints/Tugas_Makalah_Jaringan_Aditya.docx",
      fileName: "Tugas_Makalah_Jaringan_Aditya.docx",
      pageCount: 12,
      colorType: "BW",
      paperSize: "A4",
      finishing: "Staples Sudut",
      totalPrice: 6000,
      status: "COMPLETED",
      notes: "Selesai dicetak kemarin sore.",
      createdAt: new Date("2026-11-09T14:15:00+07:00"),
    },
    // Antrean Cetak HARI INI (10 November 2026 - Deadline Day)
    {
      orderNumber: "PRN-20261110-01",
      studentId: createdStudents["20261001"].id,
      fileUrl: "/uploads/prints/Laporan_Akhir_Proyek_RPL_Budi.pdf",
      fileName: "Laporan_Akhir_Proyek_RPL_Budi.pdf",
      pageCount: 45,
      colorType: "BW",
      paperSize: "A4",
      finishing: "Jilid Mika Biru",
      totalPrice: 22500,
      status: "READY",
      notes: "Dokumen telah selesai dicetak mesin 1, menunggu diambil Budi.",
      createdAt: new Date("2026-11-10T08:30:00+07:00"),
    },
    {
      orderNumber: "PRN-20261110-02",
      studentId: createdStudents["20261003"].id,
      fileUrl: "/uploads/prints/Portofolio_Karya_DKV_Siti.pdf",
      fileName: "Portofolio_Karya_DKV_Siti.pdf",
      pageCount: 20,
      colorType: "COLOR",
      paperSize: "A4",
      finishing: "Jilid Spiral Kawat",
      totalPrice: 35000,
      status: "PROCESSING",
      notes: "Sedang dalam proses pencetakan printer warna.",
      createdAt: new Date("2026-11-10T09:15:00+07:00"),
    },
    {
      orderNumber: "PRN-20261110-03",
      studentId: createdStudents["20261005"].id,
      fileUrl: "/uploads/prints/Tugas_Administrasi_Zahra.pdf",
      fileName: "Tugas_Administrasi_Zahra.pdf",
      pageCount: 8,
      colorType: "BW",
      paperSize: "A4",
      finishing: "Staples Sudut",
      totalPrice: 4000,
      status: "PENDING",
      notes: "Baru masuk antrean cetak mandiri.",
      createdAt: new Date("2026-11-10T10:00:00+07:00"),
    },
  ];

  for (const po of printOrdersDef) {
    await prisma.printOrder.upsert({
      where: { orderNumber: po.orderNumber },
      update: po,
      create: po,
    });
  }
  console.log("✓ Order cetak mandiri siswa (historis & antrean aktif hari ini 10 Nov) siap.");

  // ==========================================
  // 6. SEED SHIFT KASIR (HISTORIS & AKTIF HARI INI 10 NOVEMBER 2026)
  // ==========================================
  // Tutup shift kasir gantung sebelumnya (jika ada) agar tidak konflik
  await prisma.cashierShift.updateMany({
    where: { endTime: null },
    data: {
      endTime: new Date("2026-11-09T16:00:00+07:00"),
      endCash: 520000,
      actualCash: 520000,
      difference: 0,
    },
  });

  // Shift historis 9 November 2026 (Kemarin)
  const shiftKemarin = await prisma.cashierShift.findFirst({
    where: {
      cashierId: kasir1.id,
      startTime: {
        gte: new Date("2026-11-09T00:00:00+07:00"),
        lt: new Date("2026-11-10T00:00:00+07:00"),
      },
    },
  });

  if (!shiftKemarin) {
    await prisma.cashierShift.create({
      data: {
        cashierId: kasir1.id,
        startCash: 100000,
        endCash: 520000,
        actualCash: 520000,
        difference: 0,
        startTime: new Date("2026-11-09T07:30:00+07:00"),
        endTime: new Date("2026-11-09T15:30:00+07:00"),
      },
    });
  }

  // Shift AKTIF HARI INI (10 November 2026 - Deadline Day)
  const shiftHariIni = await prisma.cashierShift.findFirst({
    where: {
      cashierId: kasir1.id,
      startTime: { gte: new Date("2026-11-10T00:00:00+07:00") },
    },
  });

  if (!shiftHariIni) {
    await prisma.cashierShift.create({
      data: {
        cashierId: kasir1.id,
        startCash: 150000,
        startTime: new Date("2026-11-10T07:00:00+07:00"),
        endTime: null, // Masih AKTIF / OPEN agar kasir bisa langsung bertransaksi
      },
    });
    console.log("✓ Shift kasir aktif hari ini (10 November 2026) dibuka (modal Rp 150.000).");
  } else {
    // Pastikan tetap aktif (endTime null)
    await prisma.cashierShift.update({
      where: { id: shiftHariIni.id },
      data: { endTime: null },
    });
    console.log("✓ Shift kasir aktif hari ini (10 November 2026) dipastikan OPEN.");
  }

  // ==========================================
  // 7. SEED TRANSAKSI REALISTIS MULTI-BULAN (AGUSTUS - 10 NOVEMBER 2026)
  // ==========================================
  const rawTxDefs = [
    // --- AGUSTUS 2026 (Awal Semester Ganjil & MPLS) ---
    { date: "2026-08-03T08:15:00", cashier: kasir1, student: "20261005", items: [ { bc: "899770010001", q: 1 }, { bc: "899770010004", q: 1 }, { bc: "899770010003", q: 1 } ], pay: "CASH" },
    { date: "2026-08-03T10:30:00", cashier: kasir1, student: "20261001", items: [ { bc: "899770010002", q: 2 }, { bc: "899123456702", q: 5 } ], pay: "QRIS" },
    { date: "2026-08-07T09:20:00", cashier: kasir2, student: "20261002", items: [ { bc: "899123456702", q: 3 }, { bc: "899886610001", q: 2 }, { bc: "899886620002", q: 1 } ], pay: "CASH" },
    { date: "2026-08-07T13:45:00", cashier: kasir2, student: null, items: [ { bc: "899550010001", q: 1 }, { bc: "899886670007", q: 2 } ], pay: "QRIS" },
    { date: "2026-08-12T07:45:00", cashier: kasir1, student: "20261003", items: [ { bc: "899770010004", q: 1 }, { bc: "899886630003", q: 1 } ], pay: "CASH" },
    { date: "2026-08-12T11:15:00", cashier: kasir1, student: "20261004", items: [ { bc: "899886640004", q: 1 }, { bc: "899123456701", q: 2 }, { bc: "899600160018", q: 1 } ], pay: "QRIS" },
    { date: "2026-08-18T08:30:00", cashier: kasir1, student: "20261005", items: [ { bc: "899550010003", q: 2 }, { bc: "899550010002", q: 1 } ], pay: "CASH" },
    { date: "2026-08-18T14:10:00", cashier: kasir2, student: null, items: [ { bc: "899770010003", q: 1 }, { bc: "899886660006", q: 2 } ], pay: "QRIS" },
    { date: "2026-08-22T09:40:00", cashier: kasir2, student: "20261001", items: [ { bc: "899123456702", q: 4 }, { bc: "899886610001", q: 1 } ], pay: "CASH" },
    { date: "2026-08-22T12:20:00", cashier: kasir1, student: "20261002", items: [ { bc: "899600160018", q: 2 }, { bc: "899886670007", q: 2 } ], pay: "CASH" },
    { date: "2026-08-28T10:05:00", cashier: kasir1, student: "20261003", items: [ { bc: "899550010001", q: 1 }, { bc: "899550010002", q: 2 } ], pay: "QRIS" },
    { date: "2026-08-28T15:00:00", cashier: kasir2, student: "20261004", items: [ { bc: "899886640004", q: 1 }, { bc: "899886630003", q: 1 } ], pay: "CASH" },

    // --- SEPTEMBER 2026 (Ujian Tengah Semester & Penugasan) ---
    { date: "2026-09-02T08:10:00", cashier: kasir1, student: "20261001", items: [ { bc: "899123456701", q: 3 }, { bc: "899886620002", q: 2 }, { bc: "899886630003", q: 1 } ], pay: "CASH" },
    { date: "2026-09-02T11:30:00", cashier: kasir1, student: "20261005", items: [ { bc: "899123456702", q: 2 }, { bc: "899886610001", q: 2 } ], pay: "QRIS" },
    { date: "2026-09-05T09:15:00", cashier: kasir2, student: "20261002", items: [ { bc: "899886660006", q: 3 }, { bc: "899886640004", q: 1 } ], pay: "CASH" },
    { date: "2026-09-05T13:40:00", cashier: kasir2, student: null, items: [ { bc: "899770010002", q: 1 }, { bc: "899770010001", q: 1 } ], pay: "QRIS" },
    { date: "2026-09-09T08:50:00", cashier: kasir1, student: "20261003", items: [ { bc: "899550010001", q: 1 }, { bc: "899550010003", q: 1 } ], pay: "CASH" },
    { date: "2026-09-09T12:15:00", cashier: kasir1, student: "20261004", items: [ { bc: "899600160018", q: 2 }, { bc: "899886670007", q: 1 } ], pay: "QRIS" },
    { date: "2026-09-14T07:55:00", cashier: kasir1, student: "20261001", items: [ { bc: "899770010003", q: 1 }, { bc: "899123456702", q: 2 } ], pay: "CASH" },
    { date: "2026-09-14T10:45:00", cashier: kasir2, student: "20261005", items: [ { bc: "899886610001", q: 3 }, { bc: "899886620002", q: 1 } ], pay: "QRIS" },
    { date: "2026-09-18T09:30:00", cashier: kasir2, student: null, items: [ { bc: "899550010002", q: 2 }, { bc: "899550010003", q: 2 } ], pay: "CASH" },
    { date: "2026-09-18T14:20:00", cashier: kasir1, student: "20261002", items: [ { bc: "899123456702", q: 4 }, { bc: "899886640004", q: 1 } ], pay: "QRIS" },
    { date: "2026-09-22T08:20:00", cashier: kasir1, student: "20261003", items: [ { bc: "899770010001", q: 1 }, { bc: "899770010004", q: 1 } ], pay: "CASH" },
    { date: "2026-09-22T11:40:00", cashier: kasir1, student: "20261004", items: [ { bc: "899886630003", q: 1 }, { bc: "899123456701", q: 2 } ], pay: "CASH" },
    { date: "2026-09-26T09:05:00", cashier: kasir2, student: "20261005", items: [ { bc: "899600160018", q: 3 }, { bc: "899886670007", q: 2 } ], pay: "QRIS" },
    { date: "2026-09-26T13:15:00", cashier: kasir2, student: "20261001", items: [ { bc: "899550010001", q: 1 }, { bc: "899886660006", q: 2 } ], pay: "CASH" },
    { date: "2026-09-30T08:40:00", cashier: kasir1, student: "20261002", items: [ { bc: "899770010002", q: 2 }, { bc: "899770010003", q: 1 } ], pay: "QRIS" },
    { date: "2026-09-30T10:50:00", cashier: kasir1, student: null, items: [ { bc: "899123456702", q: 3 }, { bc: "899886610001", q: 2 } ], pay: "CASH" },
    { date: "2026-09-30T14:30:00", cashier: kasir2, student: "20261003", items: [ { bc: "899550010003", q: 3 } ], pay: "CASH" },

    // --- OKTOBER 2026 (Bulan Penuh Penjualan & Kreativitas KIK) ---
    { date: "2026-10-02T08:15:00", cashier: kasir1, student: "20261001", items: [ { bc: "899123456702", q: 4 }, { bc: "899886610001", q: 2 } ], pay: "CASH" },
    { date: "2026-10-02T10:45:00", cashier: kasir1, student: "20261004", items: [ { bc: "899550010001", q: 1 }, { bc: "899550010002", q: 1 } ], pay: "QRIS" },
    { date: "2026-10-05T09:00:00", cashier: kasir2, student: "20261002", items: [ { bc: "899770010004", q: 1 }, { bc: "899770010001", q: 1 } ], pay: "CASH" },
    { date: "2026-10-05T13:20:00", cashier: kasir2, student: null, items: [ { bc: "899600160018", q: 2 }, { bc: "899886670007", q: 2 } ], pay: "QRIS" },
    { date: "2026-10-08T08:30:00", cashier: kasir1, student: "20261005", items: [ { bc: "899886640004", q: 1 }, { bc: "899886620002", q: 2 } ], pay: "CASH" },
    { date: "2026-10-08T11:15:00", cashier: kasir1, student: "20261003", items: [ { bc: "899770010002", q: 1 }, { bc: "899770010003", q: 1 } ], pay: "QRIS" },
    { date: "2026-10-12T07:50:00", cashier: kasir1, student: "20261001", items: [ { bc: "899770010001", q: 1 }, { bc: "899123456702", q: 2 } ], pay: "CASH" },
    { date: "2026-10-12T10:10:00", cashier: kasir2, student: "20261004", items: [ { bc: "899550010003", q: 2 }, { bc: "899886610001", q: 1 } ], pay: "QRIS" },
    { date: "2026-10-15T09:40:00", cashier: kasir2, student: null, items: [ { bc: "899550010001", q: 1 }, { bc: "899886670007", q: 1 } ], pay: "CASH" },
    { date: "2026-10-15T14:05:00", cashier: kasir1, student: "20261002", items: [ { bc: "899886660006", q: 2 }, { bc: "899886630003", q: 1 } ], pay: "QRIS" },
    { date: "2026-10-19T08:20:00", cashier: kasir1, student: "20261005", items: [ { bc: "899123456702", q: 3 }, { bc: "899123456701", q: 2 } ], pay: "CASH" },
    { date: "2026-10-19T11:35:00", cashier: kasir2, student: "20261003", items: [ { bc: "899770010004", q: 1 }, { bc: "899770010002", q: 1 } ], pay: "QRIS" },
    { date: "2026-10-22T09:10:00", cashier: kasir2, student: "20261001", items: [ { bc: "899550010002", q: 3 }, { bc: "899550010003", q: 2 } ], pay: "CASH" },
    { date: "2026-10-22T13:50:00", cashier: kasir1, student: null, items: [ { bc: "899600160018", q: 4 } ], pay: "QRIS" },
    { date: "2026-10-26T08:00:00", cashier: kasir1, student: "20261004", items: [ { bc: "899770010003", q: 1 }, { bc: "899886610001", q: 2 } ], pay: "CASH" },
    { date: "2026-10-26T10:30:00", cashier: kasir2, student: "20261002", items: [ { bc: "899550010001", q: 1 }, { bc: "899123456702", q: 2 } ], pay: "QRIS" },
    { date: "2026-10-29T09:25:00", cashier: kasir2, student: "20261005", items: [ { bc: "899886640004", q: 1 }, { bc: "899886660006", q: 3 } ], pay: "CASH" },
    { date: "2026-10-29T14:15:00", cashier: kasir1, student: null, items: [ { bc: "899770010001", q: 1 }, { bc: "899886670007", q: 2 } ], pay: "QRIS" },
    { date: "2026-10-31T08:45:00", cashier: kasir1, student: "20261003", items: [ { bc: "899550010003", q: 4 }, { bc: "899550010002", q: 1 } ], pay: "CASH" },
    { date: "2026-10-31T11:00:00", cashier: kasir2, student: "20261001", items: [ { bc: "899770010002", q: 1 }, { bc: "899600160018", q: 2 } ], pay: "QRIS" },
    { date: "2026-10-31T15:20:00", cashier: kasir2, student: "20261004", items: [ { bc: "899123456702", q: 5 }, { bc: "899886610001", q: 3 } ], pay: "CASH" },

    // --- NOVEMBER 2026 (1 s/d 8 November 2026) ---
    { date: "2026-11-01T08:30:00", cashier: kasir1, student: "20261001", items: [ { bc: "899550010001", q: 1 } ], pay: "CASH" },
    { date: "2026-11-01T11:00:00", cashier: kasir1, student: "20261005", items: [ { bc: "899123456702", q: 2 }, { bc: "899886610001", q: 1 } ], pay: "QRIS" },
    { date: "2026-11-01T14:20:00", cashier: kasir2, student: null, items: [ { bc: "899600160018", q: 3 } ], pay: "CASH" },
    { date: "2026-11-02T08:15:00", cashier: kasir1, student: "20261002", items: [ { bc: "899770010002", q: 1 }, { bc: "899886670007", q: 1 }, { bc: "899886620002", q: 1 } ], pay: "QRIS" },
    { date: "2026-11-02T10:45:00", cashier: kasir2, student: "20261003", items: [ { bc: "899123456701", q: 2 }, { bc: "899886630003", q: 1 } ], pay: "CASH" },
    { date: "2026-11-02T13:30:00", cashier: kasir2, student: null, items: [ { bc: "899550010003", q: 2 } ], pay: "QRIS" },
    { date: "2026-11-03T07:45:00", cashier: kasir1, student: "20261003", items: [ { bc: "899770010001", q: 1 }, { bc: "899770010003", q: 1 }, { bc: "899550010003", q: 1 } ], pay: "CASH", discPct: 5, vCode: "YASIXHEMAT5" },
    { date: "2026-11-03T11:20:00", cashier: kasir1, student: "20261004", items: [ { bc: "899123456702", q: 3 }, { bc: "899886610001", q: 2 } ], pay: "CASH" },
    { date: "2026-11-03T15:10:00", cashier: kasir2, student: "20261005", items: [ { bc: "899886640004", q: 1 }, { bc: "899600160018", q: 1 } ], pay: "QRIS" },
    { date: "2026-11-04T08:50:00", cashier: kasir2, student: "20261004", items: [ { bc: "899123456702", q: 2 }, { bc: "899123456701", q: 1 }, { bc: "899886630003", q: 1 } ], pay: "CASH" },
    { date: "2026-11-04T12:00:00", cashier: kasir1, student: null, items: [ { bc: "899550010001", q: 1 }, { bc: "899886670007", q: 2 } ], pay: "QRIS" },
    { date: "2026-11-04T14:40:00", cashier: kasir1, student: "20261001", items: [ { bc: "899770010002", q: 1 }, { bc: "899770010004", q: 1 } ], pay: "CASH" },
    { date: "2026-11-05T09:15:00", cashier: kasir1, student: "20261005", items: [ { bc: "899770010004", q: 1 }, { bc: "899600160018", q: 1 } ], pay: "QRIS" },
    { date: "2026-11-05T11:30:00", cashier: kasir2, student: "20261002", items: [ { bc: "899886660006", q: 2 }, { bc: "899886610001", q: 2 } ], pay: "CASH" },
    { date: "2026-11-05T15:00:00", cashier: kasir2, student: null, items: [ { bc: "899550010002", q: 2 } ], pay: "QRIS" },
    { date: "2026-11-06T08:10:00", cashier: kasir1, student: "20261001", items: [ { bc: "899123456702", q: 4 }, { bc: "899886640004", q: 1 } ], pay: "CASH" },
    { date: "2026-11-06T10:50:00", cashier: kasir1, student: "20261003", items: [ { bc: "899770010003", q: 1 }, { bc: "899550010003", q: 1 } ], pay: "QRIS" },
    { date: "2026-11-06T13:40:00", cashier: kasir2, student: "20261004", items: [ { bc: "899600160018", q: 2 }, { bc: "899886670007", q: 2 } ], pay: "CASH" },
    { date: "2026-11-07T08:40:00", cashier: kasir2, student: "20261002", items: [ { bc: "899550010001", q: 1 }, { bc: "899550010002", q: 1 } ], pay: "QRIS" },
    { date: "2026-11-07T11:15:00", cashier: kasir1, student: null, items: [ { bc: "899770010001", q: 1 }, { bc: "899770010002", q: 1 } ], pay: "CASH" },
    { date: "2026-11-07T14:30:00", cashier: kasir1, student: "20261005", items: [ { bc: "899123456702", q: 3 }, { bc: "899886620002", q: 1 } ], pay: "CASH" },
    { date: "2026-11-08T07:40:00", cashier: kasir1, student: "20261001", items: [ { bc: "899770010004", q: 1 }, { bc: "899770010001", q: 1 } ], pay: "CASH" },
    { date: "2026-11-08T09:20:00", cashier: kasir1, student: "20261002", items: [ { bc: "899123456702", q: 4 }, { bc: "899886610001", q: 2 }, { bc: "899886640004", q: 1 } ], pay: "QRIS" },
    { date: "2026-11-08T11:00:00", cashier: kasir1, student: "20261003", items: [ { bc: "899550010001", q: 1 }, { bc: "899550010003", q: 2 } ], pay: "QRIS" },
    { date: "2026-11-08T13:15:00", cashier: kasir2, student: "20261004", items: [ { bc: "899600160018", q: 2 }, { bc: "899886670007", q: 2 } ], pay: "CASH" },
    { date: "2026-11-08T15:30:00", cashier: kasir2, student: null, items: [ { bc: "899770010003", q: 1 }, { bc: "899886660006", q: 2 } ], pay: "CASH" },

    // --- 9 NOVEMBER 2026 (Kemarin) ---
    { date: "2026-11-09T08:15:00", cashier: kasir1, student: "20261001", items: [ { bc: "899123456701", q: 2 }, { bc: "899886620002", q: 1 }, { bc: "899886630003", q: 1 } ], pay: "CASH" },
    { date: "2026-11-09T10:20:00", cashier: kasir1, student: "20261003", items: [ { bc: "899550010001", q: 1 }, { bc: "899600160018", q: 1 } ], pay: "QRIS" },
    { date: "2026-11-09T12:30:00", cashier: kasir2, student: "20261002", items: [ { bc: "899123456702", q: 3 }, { bc: "899886610001", q: 2 } ], pay: "CASH" },
    { date: "2026-11-09T14:10:00", cashier: kasir2, student: "20261004", items: [ { bc: "899770010003", q: 1 }, { bc: "899770010002", q: 1 } ], pay: "QRIS", discPct: 10, vCode: "GTNIC2026" },
    { date: "2026-11-09T15:05:00", cashier: kasir2, student: null, items: [ { bc: "899886670007", q: 3 }, { bc: "899550010003", q: 1 } ], pay: "CASH" },

    // --- 10 NOVEMBER 2026 (HARI INI - DEADLINE DAY GTNIC 2026) ---
    // Pagi sebelum jam pelajaran (07:00 - 07:30)
    { date: "2026-11-10T07:25:00", cashier: kasir1, student: "20261005", items: [ { bc: "899123456701", q: 2 }, { bc: "899886620002", q: 1 } ], pay: "CASH" },
    { date: "2026-11-10T08:10:00", cashier: kasir1, student: "20261001", items: [ { bc: "899770010001", q: 1 }, { bc: "899770010004", q: 1 } ], pay: "QRIS" },
    // Jam Istirahat 1 (09:30 - 10:15) - Penjualan Padat ATK & Produk KIK
    { date: "2026-11-10T09:35:00", cashier: kasir1, student: "20261002", items: [ { bc: "899123456702", q: 3 }, { bc: "899886640004", q: 1 } ], pay: "CASH" },
    { date: "2026-11-10T09:50:00", cashier: kasir1, student: "20261003", items: [ { bc: "899550010001", q: 1 }, { bc: "899550010002", q: 1 }, { bc: "899886670007", q: 2 } ], pay: "QRIS", discPct: 10, vCode: "GTNIC2026" },
    { date: "2026-11-10T10:10:00", cashier: kasir1, student: null, items: [ { bc: "899886660006", q: 4 }, { bc: "899886610001", q: 2 } ], pay: "CASH" },
    // Siang Jam Istirahat Dzuhur & Makan (12:00 - 13:00)
    { date: "2026-11-10T12:05:00", cashier: kasir1, student: "20261004", items: [ { bc: "899550010003", q: 3 }, { bc: "899550010002", q: 2 } ], pay: "QRIS" },
    { date: "2026-11-10T12:25:00", cashier: kasir1, student: "20261001", items: [ { bc: "899600160018", q: 3 }, { bc: "899886670007", q: 2 }, { bc: "899886610001", q: 2 } ], pay: "CASH" },
    // Sore Hari Penyerahan Barang Pre-order & Penjualan Terakhir (13:45 - 16:00)
    { date: "2026-11-10T13:50:00", cashier: kasir2, student: "20261005", items: [ { bc: "899770010003", q: 1 }, { bc: "899770010002", q: 1 } ], pay: "CASH", discPct: 5, vCode: "YASIXHEMAT5" },
    { date: "2026-11-10T15:15:00", cashier: kasir2, student: "20261002", items: [ { bc: "899123456702", q: 2 }, { bc: "899123456701", q: 1 }, { bc: "899600160018", q: 1 } ], pay: "QRIS" },
    { date: "2026-11-10T16:00:00", cashier: kasir2, student: null, items: [ { bc: "899550010001", q: 1 } ], pay: "CASH" },

    // Pre-Order Siswa Hari Ini (Status: BOOKED & READY) untuk demonstrasi konter pengambilan
    { date: "2026-11-10T14:30:00", cashier: null, student: "20261004", items: [ { bc: "899550010001", q: 1 }, { bc: "899550010003", q: 2 } ], pay: "PAY_ON_PICKUP", status: "READY" },
    { date: "2026-11-10T15:45:00", cashier: null, student: "20261003", items: [ { bc: "899770010003", q: 1 }, { bc: "899770010001", q: 1 } ], pay: "PAY_ON_PICKUP", status: "BOOKED" },
  ];

  let txCounter = 1;
  for (const def of rawTxDefs) {
    const txDate = new Date(def.date);
    const dateFormatted = def.date.slice(0, 10).replace(/-/g, "");
    const invoiceNumber = `INV-${dateFormatted}-${String(txCounter).padStart(3, "0")}`;
    txCounter++;

    let subtotal = 0;
    const itemsData = [];

    for (const itemDef of def.items) {
      const product = createdProducts[itemDef.bc];
      if (product) {
        const itemPrice = Number(product.sellingPrice);
        const itemSubtotal = itemPrice * itemDef.q;
        subtotal += itemSubtotal;
        itemsData.push({
          productId: product.id,
          itemName: product.name,
          price: itemPrice,
          quantity: itemDef.q,
          subtotal: itemSubtotal,
        });
      }
    }

    if (itemsData.length === 0) continue;

    const discountAmount = def.discPct ? Math.round((subtotal * def.discPct) / 100) : 0;
    const totalAmount = subtotal - discountAmount;
    const isPreorder = def.pay === "PAY_ON_PICKUP" || def.status === "BOOKED";
    const payAmount = isPreorder ? null : (def.pay === "QRIS" ? totalAmount : Math.ceil(totalAmount / 10000) * 10000 || totalAmount + 5000);
    const changeAmount = isPreorder ? null : (payAmount - totalAmount);
    const studentUser = def.student && createdStudents[def.student] ? createdStudents[def.student] : null;
    const voucher = def.vCode && createdVouchers[def.vCode] ? createdVouchers[def.vCode] : null;

    const existing = await prisma.transaction.findUnique({
      where: { invoiceNumber },
    });

    if (!existing) {
      await prisma.transaction.create({
        data: {
          invoiceNumber,
          cashierId: def.cashier ? def.cashier.id : null,
          studentId: studentUser ? studentUser.id : null,
          voucherId: voucher ? voucher.id : null,
          subtotal,
          discountAmount,
          totalAmount,
          payAmount,
          changeAmount,
          paymentMethod: def.pay,
          status: def.status || "COMPLETED",
          createdAt: txDate,
          items: {
            create: itemsData,
          },
        },
      });
    }
  }
  console.log(`✓ ${rawTxDefs.length} Transaksi multi-bulan realistis (Agustus s/d 10 November 2026) siap untuk analitik dashboard.`);

  console.log("🎉 Seed data realistis YasixMerch selesai dieksekusi dengan sempurna!");
}

main()
  .catch((e) => {
    console.error("❌ Gagal menjalankan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
