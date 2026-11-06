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
      points: 145,
    },
    {
      nis: "20261002",
      name: "Aditya Wardhana - XII TKJ 2",
      email: "aditya@smkyadika6.sch.id",
      qrCodeMember: "MEMBER-20261002",
      points: 90,
    },
    {
      nis: "20261003",
      name: "Siti Nurhaliza - XI DKV 1",
      email: "siti.dkv@smkyadika6.sch.id",
      qrCodeMember: "MEMBER-20261003",
      points: 230,
    },
    {
      nis: "20261004",
      name: "Farhan Kurniawan - XI AKL",
      email: "farhan.akl@smkyadika6.sch.id",
      qrCodeMember: "MEMBER-20261004",
      points: 55,
    },
    {
      nis: "20261005",
      name: "Zahra Aulia - X MPLB",
      email: "zahra.mplb@smkyadika6.sch.id",
      qrCodeMember: "MEMBER-20261005",
      points: 20,
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
      stock: 45,
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
      validUntil: new Date("2027-12-31"),
      isActive: true,
    },
    {
      code: "GTNIC2026",
      discountPct: 10.0,
      maxDiscount: 10000,
      minPurchase: 30000,
      validUntil: new Date("2027-12-31"),
      isActive: true,
    },
    {
      code: "PELAJARJUARA",
      discountPct: 15.0,
      maxDiscount: 15000,
      minPurchase: 40000,
      validUntil: new Date("2027-12-31"),
      isActive: true,
    },
  ];

  for (const v of vouchersDef) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      update: v,
      create: v,
    });
  }
  console.log("✓ Voucher diskon siap.");

  // ==========================================
  // 5. SEED ORDER PRINT (DOKUMEN SISWA)
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
    },
    {
      orderNumber: "PRN-20261102-02",
      studentId: createdStudents["20261003"].id,
      fileUrl: "/uploads/prints/Proposal_KIK_DKV_Siti.pdf",
      fileName: "Proposal_KIK_DKV_Siti.pdf",
      pageCount: 16,
      colorType: "COLOR",
      paperSize: "A4",
      finishing: "Jilid Lakban",
      totalPrice: 24000,
      status: "READY",
      notes: "Sudah siap diambil di Business Center Yasix.",
    },
    {
      orderNumber: "PRN-20261103-03",
      studentId: createdStudents["20261002"].id,
      fileUrl: "/uploads/prints/Tugas_Makalah_Aditya.docx",
      fileName: "Tugas_Makalah_Aditya.docx",
      pageCount: 12,
      colorType: "BW",
      paperSize: "A4",
      finishing: "Staples Sudut",
      totalPrice: 6000,
      status: "PROCESSING",
      notes: "Sedang dalam antrean cetak mesin 1.",
    },
    {
      orderNumber: "PRN-20261104-04",
      studentId: createdStudents["20261005"].id,
      fileUrl: "/uploads/prints/Portofolio_Zahra.pdf",
      fileName: "Portofolio_Zahra.pdf",
      pageCount: 10,
      colorType: "COLOR",
      paperSize: "A4",
      finishing: "Tanpa Jilid",
      totalPrice: 15000,
      status: "PENDING",
      notes: "Menunggu giliran cetak mandiri.",
    },
  ];

  for (const po of printOrdersDef) {
    await prisma.printOrder.upsert({
      where: { orderNumber: po.orderNumber },
      update: po,
      create: po,
    });
  }
  console.log("✓ Order cetak mandiri siswa siap.");

  // ==========================================
  // 6. SEED SHIFT KASIR (HISTORIS & AKTIF HARI INI)
  // ==========================================
  // Cek apakah sudah ada shift kasir
  const existingShift = await prisma.cashierShift.findFirst({
    where: { cashierId: kasir1.id, endTime: null },
  });

  if (!existingShift) {
    // Shift kemarin (sudah ditutup)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(7, 30, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(15, 0, 0, 0);

    await prisma.cashierShift.create({
      data: {
        cashierId: kasir1.id,
        startCash: 100000,
        endCash: 485000,
        actualCash: 485000,
        difference: 0,
        startTime: yesterday,
        endTime: yesterdayEnd,
      },
    });

    // Shift aktif hari ini agar kasir langsung bisa transaksi tanpa modal blokir
    const today = new Date();
    today.setHours(7, 0, 0, 0);
    await prisma.cashierShift.create({
      data: {
        cashierId: kasir1.id,
        startCash: 150000,
        startTime: today,
        endTime: null, // Masih Aktif/Terbuka
      },
    });
    console.log("✓ Shift kasir aktif hari ini & historis kemarin siap.");
  }

  // ==========================================
  // 7. SEED TRANSAKSI REALISTIS (UNTUK GRAFIK ANALITIK)
  // ==========================================
  const pastTransactions = [
    {
      invoiceNumber: "INV-20261101-001",
      cashierId: kasir1.id,
      studentId: createdStudents["20261001"].id,
      subtotal: 35000,
      discountAmount: 0,
      totalAmount: 35000,
      payAmount: 40000,
      changeAmount: 5000,
      paymentMethod: "CASH",
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      items: [
        {
          productId: createdProducts["899550010001"].id, // Tote Bag KIK
          itemName: "Tote Bag Kanvas Karya KIK DKV",
          price: 35000,
          quantity: 1,
          subtotal: 35000,
        },
      ],
    },
    {
      invoiceNumber: "INV-20261102-002",
      cashierId: kasir1.id,
      studentId: createdStudents["20261002"].id,
      subtotal: 21500,
      discountAmount: 0,
      totalAmount: 21500,
      payAmount: 21500,
      changeAmount: 0,
      paymentMethod: "QRIS",
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      items: [
        {
          productId: createdProducts["899770010002"].id, // Kaos Kaki
          itemName: "Kaos Kaki Putih Logo Yadika 6",
          price: 15000,
          quantity: 1,
          subtotal: 15000,
        },
        {
          productId: createdProducts["899886670007"].id, // Teh Pucuk
          itemName: "Teh Pucuk Harum 350ml",
          price: 4000,
          quantity: 1,
          subtotal: 4000,
        },
        {
          productId: createdProducts["899886620002"].id, // Penghapus
          itemName: "Penghapus Joyko Hitam B-40",
          price: 2500,
          quantity: 1,
          subtotal: 2500,
        },
      ],
    },
    {
      invoiceNumber: "INV-20261103-003",
      cashierId: kasir1.id,
      studentId: createdStudents["20261003"].id,
      subtotal: 44000,
      discountAmount: 2200,
      totalAmount: 41800,
      payAmount: 50000,
      changeAmount: 8200,
      paymentMethod: "CASH",
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      items: [
        {
          productId: createdProducts["899770010001"].id, // Dasi
          itemName: "Dasi Formal SMK Yadika 6",
          price: 20000,
          quantity: 1,
          subtotal: 20000,
        },
        {
          productId: createdProducts["899770010003"].id, // Lanyard
          itemName: "Lanyard & ID Card Holder Yadika 6",
          price: 18000,
          quantity: 1,
          subtotal: 18000,
        },
        {
          productId: createdProducts["899550010003"].id, // Sticker Pack
          itemName: "Sticker Pack Hologram KIK",
          price: 6000,
          quantity: 1,
          subtotal: 6000,
        },
      ],
    },
    {
      invoiceNumber: "INV-20261104-004",
      cashierId: kasir2.id,
      studentId: createdStudents["20261004"].id,
      subtotal: 18000,
      discountAmount: 0,
      totalAmount: 18000,
      payAmount: 20000,
      changeAmount: 2000,
      paymentMethod: "CASH",
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      items: [
        {
          productId: createdProducts["899123456702"].id, // Buku SiDu
          itemName: "Buku Tulis Sidu 38 Lembar",
          price: 4500,
          quantity: 2,
          subtotal: 9000,
        },
        {
          productId: createdProducts["899123456701"].id, // Pensil
          itemName: "Pensil 2B Faber-Castell",
          price: 4000,
          quantity: 1,
          subtotal: 4000,
        },
        {
          productId: createdProducts["899886630003"].id, // Penggaris
          itemName: "Penggaris Butterfly 30cm Transparan",
          price: 5000,
          quantity: 1,
          subtotal: 5000,
        },
      ],
    },
    {
      invoiceNumber: "INV-20261105-005",
      cashierId: kasir1.id,
      studentId: createdStudents["20261005"].id,
      subtotal: 28500,
      discountAmount: 0,
      totalAmount: 28500,
      payAmount: 28500,
      changeAmount: 0,
      paymentMethod: "QRIS",
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      items: [
        {
          productId: createdProducts["899770010004"].id, // Topi
          itemName: "Topi Upacara SMK Yadika 6",
          price: 25000,
          quantity: 1,
          subtotal: 25000,
        },
        {
          productId: createdProducts["899600160018"].id, // Le Minerale
          itemName: "Le Minerale 600ml",
          price: 3500,
          quantity: 1,
          subtotal: 3500,
        },
      ],
    },
  ];

  for (const t of pastTransactions) {
    const existing = await prisma.transaction.findUnique({
      where: { invoiceNumber: t.invoiceNumber },
    });
    if (!existing) {
      await prisma.transaction.create({
        data: {
          invoiceNumber: t.invoiceNumber,
          cashierId: t.cashierId,
          studentId: t.studentId,
          subtotal: t.subtotal,
          discountAmount: t.discountAmount,
          totalAmount: t.totalAmount,
          payAmount: t.payAmount,
          changeAmount: t.changeAmount,
          paymentMethod: t.paymentMethod,
          status: t.status,
          createdAt: t.createdAt,
          items: {
            create: t.items,
          },
        },
      });
    }
  }
  console.log("✓ Transaksi historis multi-hari siap untuk analitik dashboard.");

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
