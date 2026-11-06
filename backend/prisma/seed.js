const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Seed Users (Admin, Kasir, Siswa) - Idempotent
  const admin = await prisma.user.upsert({
    where: { email: "admin@smkyadika6.sch.id" },
    update: {
      password: hashedPassword,
    },
    create: {
      name: "Admin YasixMerch",
      email: "admin@smkyadika6.sch.id",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const kasir = await prisma.user.upsert({
    where: { email: "kasir@smkyadika6.sch.id" },
    update: {
      password: hashedPassword,
    },
    create: {
      name: "Kasir Shift 1",
      email: "kasir@smkyadika6.sch.id",
      password: hashedPassword,
      role: "KASIR",
    },
  });

  const siswa = await prisma.user.upsert({
    where: { email: "siswa@smkyadika6.sch.id" },
    update: {
      password: hashedPassword,
    },
    create: {
      nis: "20261001",
      name: "Siswa Demo",
      email: "siswa@smkyadika6.sch.id",
      password: hashedPassword,
      role: "SISWA",
      qrCodeMember: "MEMBER-20261001",
      points: 50,
    },
  });

  // 2. Seed Categories - Idempotent
  let catATK = await prisma.category.findFirst({
    where: { name: "Alat Tulis Kantor" },
  });
  if (!catATK) {
    catATK = await prisma.category.create({
      data: {
        name: "Alat Tulis Kantor",
        type: "ATK",
      },
    });
  }

  let catPrint = await prisma.category.findFirst({
    where: { name: "Jasa Cetak & Dokumen" },
  });
  if (!catPrint) {
    catPrint = await prisma.category.create({
      data: {
        name: "Jasa Cetak & Dokumen",
        type: "JASA_PRINT",
      },
    });
  }

  // 3. Seed Sample Products - Idempotent (Upsert by barcode)
  await prisma.product.upsert({
    where: { barcode: "899123456701" },
    update: {},
    create: {
      categoryId: catATK.id,
      barcode: "899123456701",
      name: "Pensil 2B Faber-Castell",
      hpp: 3000,
      margin: 33.33,
      sellingPrice: 4000,
      stock: 50,
      minStock: 10,
    },
  });

  await prisma.product.upsert({
    where: { barcode: "899123456702" },
    update: {},
    create: {
      categoryId: catATK.id,
      barcode: "899123456702",
      name: "Buku Tulis Sidu 38 Lembar",
      hpp: 3500,
      margin: 28.57,
      sellingPrice: 4500,
      stock: 100,
      minStock: 15,
    },
  });

  console.log("✅ Seed data berhasil dibuat/diperbarui!");
}

main()
  .catch((e) => {
    console.error("❌ Gagal menjalankan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
