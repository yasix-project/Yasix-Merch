const prisma = require("../config/prisma");

const createTransactionService = async (cashierId, transactionData) => {
  const {
    studentId,
    studentNis,
    memberCode,
    voucherId,
    voucherCode,
    paymentMethod,
    payAmount,
    items,
  } = transactionData;

  if (!items || items.length === 0) {
    throw new Error("Detail barang transaksi tidak boleh kosong.");
  }

  // Menggunakan Prisma $transaction untuk menjaga atomisitas data
  return await prisma.$transaction(async (tx) => {
    // Resolusi akun siswa dari ID, NIS, atau QR Code Member
    let resolvedStudentId = studentId;
    const identifier = (studentNis || memberCode || "").trim();
    if (!resolvedStudentId && identifier) {
      const student = await tx.user.findFirst({
        where: {
          role: "SISWA",
          OR: [
            { id: identifier },
            { nis: identifier },
            { qrCodeMember: identifier },
          ],
        },
      });
      if (student) {
        resolvedStudentId = student.id;
      }
    }

    // Resolusi Voucher dari Voucher Code jika voucherId tidak disediakan
    let resolvedVoucherId = voucherId;
    if (!resolvedVoucherId && voucherCode?.trim()) {
      const vCode = voucherCode.trim().toUpperCase();
      const voucher = await tx.voucher.findFirst({
        where: {
          code: vCode,
          isActive: true,
        },
      });
      if (voucher) {
        resolvedVoucherId = voucher.id;
      }
    }

    let subtotal = 0;
    const transactionItemsData = [];

    // 1. Validasi & Hitung Item Transaksi
    for (const item of items) {
      if (item.productId) {
        // Jika Item adalah Produk ATK
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(
            `Produk dengan ID ${item.productId} tidak ditemukan.`,
          );
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stok produk ${product.name} tidak mencukupi (Sisa: ${product.stock}).`,
          );
        }

        // Potong Stok Produk
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity },
        });

        const itemSubtotal = Number(product.sellingPrice) * item.quantity;
        subtotal += itemSubtotal;

        transactionItemsData.push({
          productId: product.id,
          itemName: product.name,
          price: product.sellingPrice,
          quantity: item.quantity,
          subtotal: itemSubtotal,
        });
      } else if (item.printOrderId) {
        // Jika Item adalah Order Print
        const printOrder = await tx.printOrder.findUnique({
          where: { id: item.printOrderId },
        });

        if (!printOrder) {
          throw new Error(`Order cetak tidak ditemukan.`);
        }

        // Pengecekan apakah order cetak sudah pernah dibayar/selesai
        if (printOrder.status === "COMPLETED") {
          throw new Error(
            `Order cetak (${printOrder.orderNumber}) sudah pernah diproses/dibayar sebelumnya.`,
          );
        }

        // Ubah Status Print Order menjadi COMPLETED
        await tx.printOrder.update({
          where: { id: item.printOrderId },
          data: { status: "COMPLETED" },
        });

        const itemSubtotal = Number(printOrder.totalPrice);
        subtotal += itemSubtotal;

        transactionItemsData.push({
          printOrderId: printOrder.id,
          itemName: `Print: ${printOrder.fileName}`,
          price: printOrder.totalPrice,
          quantity: 1,
          subtotal: itemSubtotal,
        });
      }
    }

    // 2. Kalkulasi Diskone & Voucher
    let discountAmount = 0;
    if (resolvedVoucherId) {
      const voucher = await tx.voucher.findUnique({
        where: { id: resolvedVoucherId },
      });

      if (
        voucher &&
        voucher.isActive &&
        new Date(voucher.validUntil) >= new Date()
      ) {
        if (subtotal >= Number(voucher.minPurchase)) {
          discountAmount = (subtotal * Number(voucher.discountPct)) / 100;
          if (
            voucher.maxDiscount &&
            discountAmount > Number(voucher.maxDiscount)
          ) {
            discountAmount = Number(voucher.maxDiscount);
          }
        }
      }
    }

    const totalAmount = subtotal - discountAmount;

    if (payAmount < totalAmount) {
      throw new Error(`Jumlah pembayaran kurang. Total: Rp ${totalAmount}`);
    }

    const changeAmount = payAmount - totalAmount;
    const invoiceNumber = `INV-${Date.now()}`;

    // 3. Simpan Transaksi Utama
    const newTransaction = await tx.transaction.create({
      data: {
        invoiceNumber,
        cashierId,
        studentId: resolvedStudentId || null,
        voucherId: resolvedVoucherId || null,
        subtotal,
        discountAmount,
        totalAmount,
        payAmount,
        changeAmount,
        paymentMethod: paymentMethod || "CASH",
        items: {
          create: transactionItemsData,
        },
      },
      include: {
        items: true,
        student: {
          select: { id: true, name: true, nis: true, points: true },
        },
      },
    });

    // 4. Tambah Poin ke Siswa (1 Poin per Kelipatan Rp 10.000)
    if (resolvedStudentId) {
      const earnedPoints = Math.floor(totalAmount / 10000);
      if (earnedPoints > 0) {
        await tx.user.update({
          where: { id: resolvedStudentId },
          data: { points: { increment: earnedPoints } },
        });
      }
    }

    return newTransaction;
  });
};

// --- PERBAIKAN 1: GET ALL TRANSACTIONS DENGAN PRINT ORDER ---
const getAllTransactionsService = async (user, query = {}) => {
  const whereCondition = {};

  if (user?.role === "SISWA" || query.mine === "true") {
    whereCondition.studentId = user.id;
  }

  if (query.status && query.status !== "ALL") {
    whereCondition.status = query.status;
  }

  if (query.preOrderOnly === "true") {
    whereCondition.invoiceNumber = { startsWith: "ORD-" };
  }

  return await prisma.transaction.findMany({
    where: whereCondition,
    include: {
      cashier: {
        select: { id: true, name: true, email: true },
      },
      student: {
        select: { id: true, name: true, nis: true },
      },
      voucher: true,
      items: {
        include: {
          product: {
            select: { name: true, barcode: true, imageUrl: true },
          },
          // INCLUDE PRINT ORDER DI SINI
          printOrder: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// --- PERBAIKAN 2: GET TRANSACTION BY ID DENGAN PRINT ORDER ---
const getTransactionByIdService = async (transactionId, user) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      cashier: {
        select: { id: true, name: true },
      },
      student: {
        select: { id: true, name: true, nis: true, points: true },
      },
      items: {
        include: {
          product: {
            select: { name: true, barcode: true, imageUrl: true },
          },
          // INCLUDE PRINT ORDER DI SINI
          printOrder: true,
        },
      },
      voucher: true,
    },
  });

  if (!transaction) {
    throw new Error("Transaksi tidak ditemukan.");
  }
  if (user && user.role === "SISWA" && transaction.studentId !== user.id) {
    throw new Error("Akses ditolak ke transaksi ini.");
  }

  return transaction;
};

// --- PERBAIKAN 3: LOGIKA CANCEL TRANSACTION YANG BENAR ---
const cancelTransactionService = async (transactionId, user) => {
  // 1. Ubah `prisma.order` menjadi `prisma.transaction`
  const existingTransaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      items: {
        include: {
          printOrder: true, // Sertakan printOrder untuk dibatalkan jika ada
        },
      },
    },
  });

  if (!existingTransaction) {
    throw new Error("Data transaksi tidak ditemukan.");
  }

  // 2. Validasi Status
  if (
    existingTransaction.status === "COMPLETED" ||
    existingTransaction.status === "CANCELLED"
  ) {
    throw new Error(
      `Transaksi tidak dapat dibatalkan karena berstatus ${existingTransaction.status}.`,
    );
  }

  // 3. Eksekusi Pembatalan
  const result = await prisma.$transaction(async (tx) => {
    // A. Ubah `tx.order` menjadi `tx.transaction`
    const cancelledTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: "CANCELLED",
      },
    });

    // B. Lakukan perulangan untuk setiap item
    for (const item of existingTransaction.items) {
      // Jika item berupa Produk Fisik, kembalikan stok
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }

      // Jika item berupa Jasa Print, batalkan status PrintOrder tersebut
      if (item.printOrderId) {
        await tx.printOrder.update({
          where: { id: item.printOrderId },
          data: {
            status: "CANCELLED",
          },
        });
      }
    }

    return cancelledTransaction;
  });

  return result;
};

// Pre-Order Mandiri Siswa (Timeout 1 Jam)
const studentPreOrderService = async (studentId, orderData) => {
  const { voucherId, paymentMethod, items } = orderData;

  return await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const transactionItemsData = [];

    for (const item of items) {
      if (item.productId) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product || product.stock < item.quantity) {
          throw new Error(
            `Stok produk ${product?.name || ""} tidak mencukupi.`,
          );
        }

        // Potong stok sementara
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity },
        });

        const itemSubtotal = Number(product.sellingPrice) * item.quantity;
        subtotal += itemSubtotal;

        transactionItemsData.push({
          productId: product.id,
          itemName: product.name,
          price: product.sellingPrice,
          quantity: item.quantity,
          subtotal: itemSubtotal,
        });
      }
    }

    // Kalkulasi voucher
    let discountAmount = 0;
    if (voucherId) {
      const voucher = await tx.voucher.findUnique({ where: { id: voucherId } });
      if (
        voucher &&
        voucher.isActive &&
        new Date(voucher.validUntil) >= new Date()
      ) {
        discountAmount = (subtotal * Number(voucher.discountPct)) / 100;
        if (
          voucher.maxDiscount &&
          discountAmount > Number(voucher.maxDiscount)
        ) {
          discountAmount = Number(voucher.maxDiscount);
        }
      }
    }

    const totalAmount = subtotal - discountAmount;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 Jam dari sekarang

    const preOrder = await tx.transaction.create({
      data: {
        invoiceNumber: `ORD-${Date.now()}`,
        studentId,
        voucherId: voucherId || null,
        subtotal,
        discountAmount,
        totalAmount,
        paymentMethod: paymentMethod || "PAY_ON_PICKUP",
        status: "BOOKED",
        expiresAt,
        items: { create: transactionItemsData },
      },
      include: { items: { include: { product: true } }, voucher: true },
    });

    return preOrder;
  });
};

// Pengecekan & Restorasi Stok untuk Pesanan Kadaluwarsa (Auto Cancel 1 Jam)
const checkAndCancelExpiredOrders = async () => {
  const expiredTransactions = await prisma.transaction.findMany({
    where: {
      status: "BOOKED",
      expiresAt: { lt: new Date() },
    },
    include: { items: true },
  });

  for (const tx of expiredTransactions) {
    await prisma.$transaction(async (prismaTx) => {
      // Kembalikan stok produk
      for (const item of tx.items) {
        if (item.productId) {
          await prismaTx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Ubah status ke CANCELLED
      await prismaTx.transaction.update({
        where: { id: tx.id },
        data: { status: "CANCELLED" },
      });
    });
  }
};

// Pelunasan & Pick-Up Pre-order Siswa oleh Kasir
const completePreOrderService = async (
  transactionId,
  cashierId,
  paymentData,
) => {
  const { payAmount, paymentMethod } = paymentData;

  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: { items: { include: { product: true } }, voucher: true },
    });

    if (!transaction) {
      throw new Error("Transaksi pre-order tidak ditemukan.");
    }

    if (transaction.status === "CANCELLED") {
      throw new Error("Pesanan ini telah kadaluwarsa/dibatalkan.");
    }

    if (transaction.status === "COMPLETED") {
      throw new Error("Pesanan ini sudah pernah diambil dan dilunasi.");
    }

    const totalAmount = Number(transaction.totalAmount);
    const payAmountNum =
      payAmount !== undefined && payAmount !== null && payAmount !== ""
        ? Number(payAmount)
        : totalAmount;

    if (payAmountNum < totalAmount) {
      throw new Error(`Pembayaran kurang. Total tagihan: Rp ${totalAmount}`);
    }

    const changeAmount = payAmountNum - totalAmount;

    // Update status transaksi menjadi COMPLETED
    const updatedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        cashierId,
        payAmount: payAmountNum,
        changeAmount,
        paymentMethod: paymentMethod || "CASH",
        status: "COMPLETED",
      },
    });

    // Tambah poin loyalty ke siswa jika terdaftar (1 Poin per Rp 10.000)
    if (transaction.studentId) {
      const earnedPoints = Math.floor(totalAmount / 10000);
      if (earnedPoints > 0) {
        await tx.user.update({
          where: { id: transaction.studentId },
          data: { points: { increment: earnedPoints } },
        });
      }
    }

    return updatedTransaction;
  });
};

// Tandai pesanan siap diambil di konter (READY)
const markOrderReadyService = async (transactionId, cashierId) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { items: true },
  });

  if (!transaction) {
    throw new Error("Transaksi pre-order tidak ditemukan.");
  }

  if (transaction.status === "CANCELLED") {
    throw new Error("Pesanan ini telah kadaluwarsa/dibatalkan.");
  }

  if (transaction.status === "COMPLETED") {
    throw new Error("Pesanan ini sudah selesai.");
  }

  return await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: "READY",
      ...(cashierId ? { cashierId } : {}),
    },
    include: {
      student: { select: { id: true, name: true, nis: true, email: true } },
      cashier: { select: { id: true, name: true, email: true } },
      voucher: true,
      items: {
        include: {
          product: { select: { name: true, barcode: true, imageUrl: true } },
          printOrder: true,
        },
      },
    },
  });
};

// Update status pesanan secara umum (fleksibel)
const updateTransactionStatusService = async (
  transactionId,
  newStatus,
  cashierId,
) => {
  const allowedStatuses = [
    "PENDING_PAYMENT",
    "BOOKED",
    "READY",
    "COMPLETED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(`Status ${newStatus} tidak valid.`);
  }

  if (newStatus === "CANCELLED") {
    return await cancelTransactionService(transactionId, { id: cashierId });
  }

  if (newStatus === "READY") {
    return await markOrderReadyService(transactionId, cashierId);
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { items: true },
  });

  if (!transaction) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  // Jika dari CANCELLED ingin kembali ke BOOKED / READY, pastikan stok dipotong lagi
  if (
    transaction.status === "CANCELLED" &&
    (newStatus === "BOOKED" || newStatus === "READY")
  ) {
    return await prisma.$transaction(async (tx) => {
      for (const item of transaction.items) {
        if (item.productId) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product || product.stock < item.quantity) {
            throw new Error(
              `Stok produk ${product?.name || item.itemName} tidak mencukupi untuk mengembalikan pesanan.`,
            );
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: product.stock - item.quantity },
          });
        }
      }

      return await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: newStatus,
          ...(cashierId ? { cashierId } : {}),
        },
        include: {
          student: { select: { id: true, name: true, nis: true, email: true } },
          cashier: { select: { id: true, name: true, email: true } },
          voucher: true,
          items: {
            include: {
              product: {
                select: { name: true, barcode: true, imageUrl: true },
              },
              printOrder: true,
            },
          },
        },
      });
    });
  }

  return await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: newStatus,
      ...(cashierId ? { cashierId } : {}),
    },
    include: {
      student: { select: { id: true, name: true, nis: true, email: true } },
      cashier: { select: { id: true, name: true, email: true } },
      voucher: true,
      items: {
        include: {
          product: { select: { name: true, barcode: true, imageUrl: true } },
          printOrder: true,
        },
      },
    },
  });
};

module.exports = {
  createTransactionService,
  getAllTransactionsService,
  getTransactionByIdService,
  cancelTransactionService,
  studentPreOrderService,
  checkAndCancelExpiredOrders,
  completePreOrderService,
  markOrderReadyService,
  updateTransactionStatusService,
};
