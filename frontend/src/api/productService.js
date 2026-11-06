// src/api/productService.js
import axiosInstance from "./axiosClient";

// Helper untuk mengubah JS Object menjadi FormData
const buildFormData = (data) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (key === "image" && value instanceof File) {
      // Append file binary untuk Multer (req.file)
      formData.append("image", value);
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  return formData;
};

export const productService = {
  getAll: (params) => axiosInstance.get("/products", { params }),

  getById: (id) => axiosInstance.get(`/products/${id}`),

  create: (data) => {
    const formData = buildFormData(data);
    return axiosInstance.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id, data) => {
    const formData = buildFormData(data);
    return axiosInstance.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id) => axiosInstance.delete(`/products/${id}`),

  getCategories: () => axiosInstance.get("/categories"),
};
