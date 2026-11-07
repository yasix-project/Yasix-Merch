const prisma = require("../config/prisma");

const validateVoucherService = async (code, subtotal) => {
  const voucher = await prisma.voucher.findUnique({
    where: { code },
  });

  if (!voucher) {
    throw new Error("Kode voucher tidak ditemukan.");
  }

  if (!voucher.isActive) {
    throw new Error("Voucher sudah tidak aktif.");
  }

  if (new Date(voucher.validUntil) < new Date()) {
    throw new Error("Voucher telah kadaluwarsa.");
  }

  if (Number(subtotal) < Number(voucher.minPurchase)) {
    throw new Error(
      `Minimal pembelian untuk voucher ini adalah Rp ${voucher.minPurchase}`,
    );
  }

  const discountPct = Number(voucher.discountPct || 0);
  let discountAmount = (Number(subtotal) * discountPct) / 100;

  if (voucher.maxDiscount && discountAmount > Number(voucher.maxDiscount)) {
    discountAmount = Number(voucher.maxDiscount);
  }

  return {
    voucherId: voucher.id,
    code: voucher.code,
    discountPct,
    discountAmount,
    minPurchase: Number(voucher.minPurchase || 0),
  };
};

const createVoucherService = async (data) => {
  const { code, discountPct, maxDiscount, minPurchase, validUntil } = data;

  const existing = await prisma.voucher.findUnique({ where: { code } });
  if (existing) {
    throw new Error("Kode voucher sudah digunakan.");
  }

  return await prisma.voucher.create({
    data: {
      code,
      discountPct: parseFloat(discountPct),
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
      validUntil: new Date(validUntil),
    },
  });
};

// Penukaran Poin Siswa Menjadi Voucher Diskon (100 Poin = Diskon 10% maks. Rp10.000)
const redeemPointsToVoucherService = async (studentId, options = {}) => {
  return await prisma.$transaction(async (tx) => {
    const student = await tx.user.findUnique({ where: { id: studentId } });

    if (!student || student.role !== "SISWA") {
      throw new Error("Akun siswa tidak ditemukan.");
    }

    const REQUIRED_POINTS = 100;
    if (student.points < REQUIRED_POINTS) {
      throw new Error(
        `Poin tidak cukup. Diperlukan minimal ${REQUIRED_POINTS} poin (Poin Anda: ${student.points}).`,
      );
    }

    // Kurangi poin siswa
    await tx.user.update({
      where: { id: studentId },
      data: { points: student.points - REQUIRED_POINTS },
    });

    // Buat kode voucher unik khusus siswa tersebut
    const code = `REDEEM-${student.nis || "STU"}-${Date.now().toString().slice(-4)}`;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // Berlaku 30 hari

    // Diskon yang dihasilkan berbentuk 10% (bukan 0%)
    const rawDiscountPct = Number(options?.discountPct);
    const discountPct = !isNaN(rawDiscountPct) && rawDiscountPct > 0 ? rawDiscountPct : 10;
    const maxDiscount = Number(options?.maxDiscount ?? 10000);
    const minPurchase = Number(options?.minPurchase ?? 20000);

    const voucher = await tx.voucher.create({
      data: {
        code,
        studentId,
        discountPct, // 10%
        maxDiscount,
        minPurchase,
        validUntil,
        isActive: true,
      },
    });

    return {
      voucher,
      remainingPoints: student.points - REQUIRED_POINTS,
    };
  });
};

// --- ENDPOINT BARU: GET ALL & GET BY ID ---
const getAllVouchers = async () => {
  return await prisma.voucher.findMany({
    include: {
      student: {
        select: {
          id: true,
          name: true,
          nis: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
};

const getVoucherById = async (id) => {
  return await prisma.voucher.findUnique({
    where: { id },
  });
};

const updateVoucher = async (id, data) => {
  const updatePayload = {};

  if (data.code) {
    updatePayload.code = data.code;
  }

  if (data.discountPct !== undefined && data.discountPct !== null) {
    updatePayload.discountPct = Number(data.discountPct);
  }

  if (data.maxDiscount !== undefined && data.maxDiscount !== null) {
    updatePayload.maxDiscount = Number(data.maxDiscount);
  }

  if (data.minPurchase !== undefined && data.minPurchase !== null) {
    updatePayload.minPurchase = Number(data.minPurchase);
  }

  if (data.validUntil) {
    const parsedDate = new Date(data.validUntil);
    if (!isNaN(parsedDate.getTime())) {
      updatePayload.validUntil = parsedDate;
    }
  }

  if (data.isActive !== undefined) {
    updatePayload.isActive = data.isActive;
  }

  return await prisma.voucher.update({
    where: { id },
    data: updatePayload,
  });
};

const deleteVoucher = async (id) => {
  return await prisma.voucher.delete({
    where: { id },
  });
};

module.exports = {
  getAllVouchers,
  getVoucherById,
  validateVoucherService,
  createVoucherService,
  redeemPointsToVoucherService,
  updateVoucher,
  deleteVoucher,
};
