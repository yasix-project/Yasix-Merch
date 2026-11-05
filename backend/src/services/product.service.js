const prisma = require("../config/prisma");

const calculateSellingPrice = (hpp, margin) =>
  Math.ceil(Number((hpp + (hpp * margin) / 100).toFixed(2)));

const resolveSellingPrice = (inputPrice, hpp, margin) => {
  const price = Number(inputPrice);
  if (
    inputPrice !== undefined &&
    inputPrice !== null &&
    inputPrice !== "" &&
    Number.isFinite(price) &&
    price > 0
  ) {
    return price;
  }
  return calculateSellingPrice(hpp, margin);
};

const getAllProductsService = async (query = {}) => {
  const { search, categoryId, isLowStock } = query;

  const whereCondition = {};

  if (search) {
    whereCondition.OR = [
      { name: { contains: search } },
      { barcode: { contains: search } },
    ];
  }

  if (categoryId) {
    whereCondition.categoryId = categoryId;
  }
  if (query.isActive !== undefined) {
    whereCondition.isActive = query.isActive === "true" || query.isActive === true;
  }

  const products = await prisma.product.findMany({
    where: whereCondition,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  if (isLowStock === "true") {
    return products.filter((p) => p.stock <= p.minStock);
  }

  return products;
};

const getProductByIdService = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error("Produk tidak ditemukan.");
  }

  return product;
};

const createProductService = async (data, file) => {
  const {
    barcode,
    name,
    categoryId,
    hpp,
    margin = 0,
    sellingPrice: inputPrice,
    stock = 0,
    minStock = 5,
    isActive = true,
    description,
  } = data;

  if (barcode) {
    const existingProduct = await prisma.product.findUnique({
      where: { barcode },
    });
    if (existingProduct) {
      throw new Error("Barcode produk sudah terdaftar.");
    }
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new Error("Kategori tidak ditemukan.");
  }

  const sellingPrice = resolveSellingPrice(
    inputPrice,
    Number(hpp),
    Number(margin),
  );

  // Jika file diunggah, tentukan path URL-nya
  const imageUrl = file
    ? `/uploads/products/${file.filename}`
    : data.imageUrl || null;

  const newProduct = await prisma.product.create({
    data: {
      barcode: barcode || null,
      name,
      categoryId,
      description: description || null,
      hpp: Number(hpp),
      margin: Number(margin),
      sellingPrice,
      stock: Number(stock),
      minStock: Number(minStock),
      isActive: Boolean(isActive === "true" || isActive === true),
      imageUrl,
    },
    include: {
      category: true,
    },
  });

  return newProduct;
};

const updateProductService = async (id, data, file) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new Error("Produk tidak ditemukan.");
  }

  const hpp = Number(data.hpp !== undefined ? data.hpp : product.hpp);
  const margin = Number(
    data.margin !== undefined ? data.margin : product.margin,
  );
  const sellingPrice = resolveSellingPrice(data.sellingPrice, hpp, margin);

  // Tentukan URL gambar baru (jika ada file diunggah), atau pertahankan yang lama
  let imageUrl = product.imageUrl;
  if (file) {
    imageUrl = `/uploads/products/${file.filename}`;
  } else if (data.imageUrl !== undefined) {
    imageUrl = data.imageUrl;
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.barcode !== undefined && { barcode: data.barcode || null }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && {
        isActive: Boolean(data.isActive === "true" || data.isActive === true),
      }),
      imageUrl,
      hpp,
      margin,
      sellingPrice,
      stock: data.stock !== undefined ? Number(data.stock) : product.stock,
      minStock:
        data.minStock !== undefined ? Number(data.minStock) : product.minStock,
    },
    include: {
      category: true,
    },
  });

  return updatedProduct;
};

const deleteProductService = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new Error("Produk tidak ditemukan.");
  }

  await prisma.product.delete({
    where: { id },
  });

  return { message: "Produk berhasil dihapus." };
};

const getLowStockAlertService = async () => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
  });

  return products.filter((p) => p.stock <= p.minStock);
};

module.exports = {
  getAllProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  getLowStockAlertService,
};
