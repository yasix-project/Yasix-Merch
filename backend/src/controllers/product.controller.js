const productService = require("../services/product.service");

const getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProductsService(req.query);
    return res.status(200).json({
      status: "success",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductByIdService(id);
    return res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    return res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, categoryId, hpp } = req.body;

    if (!name || !categoryId || hpp === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Nama produk, kategori, dan HPP wajib diisi.",
      });
    }

    // Oper req.body dan req.file ke Service
    const product = await productService.createProductService(
      req.body,
      req.file,
    );
    return res.status(201).json({
      status: "success",
      message: "Produk berhasil ditambahkan.",
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // Oper id, req.body, dan req.file ke Service
    const updatedProduct = await productService.updateProductService(
      id,
      req.body,
      req.file,
    );

    return res.status(200).json({
      status: "success",
      message: "Produk berhasil diperbarui.",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productService.deleteProductService(id);

    return res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const getLowStockAlert = async (req, res) => {
  try {
    const lowStockProducts = await productService.getLowStockAlertService();
    return res.status(200).json({
      status: "success",
      data: lowStockProducts,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getPublicProducts = async (req, res) => {
  try {
    const products = await productService.getPublicProductsService(req.query);
    return res.status(200).json({
      status: "success",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockAlert,
  getPublicProducts,
};
