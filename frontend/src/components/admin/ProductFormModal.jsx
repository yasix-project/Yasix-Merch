// src/components/admin/ProductFormModal.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, Upload, X } from "lucide-react";

import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { productService } from "../../api/productService";
import { categoryKeys } from "../../hooks/admin/useCategories";
import { formatRupiah } from "../../utils/formatters";

const productSchema = z.object({
  name: z.string().min(3, { message: "Nama produk minimal 3 karakter." }),
  categoryId: z.string().min(1, { message: "Pilih kategori produk." }),
  barcode: z.string().min(3, { message: "Barcode wajib diisi." }),
  hpp: z.coerce.number().min(1, { message: "HPP tidak valid." }),
  margin: z.coerce.number().min(0, {
    message: "Margin minimal 0%. Harga jual tidak boleh di bawah HPP.",
  }),
  sellingPrice: z.coerce
    .number()
    .min(1, { message: "Harga jual tidak valid." }),
  stock: z.coerce.number().min(0, { message: "Stok tidak boleh negatif." }),
  minStock: z.coerce.number().min(0, { message: "Minimal stok tidak valid." }),
});

const round2 = (n) => Math.round(n * 100) / 100;

function Section({ title, description, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmitData,
  initialData = null,
  isSubmitting = false,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  // Fetch Kategori
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: categoryKeys.list(),
    queryFn: async () => {
      const response = await productService.getCategories();
      return Array.isArray(response.data?.data)
        ? response.data.data
        : response.data || [];
    },
    enabled: isOpen,
  });

  // Handler Pilih File Gambar
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file gambar maksimal 2MB!");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Pre-fill & Reset Form
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        categoryId: initialData.categoryId || initialData.category?.id || "",
        barcode: initialData.barcode || "",
        hpp: initialData.hpp || "",
        margin: initialData.margin ?? "",
        sellingPrice: initialData.sellingPrice || "",
        stock: initialData.stock ?? 0,
        minStock: initialData.minStock ?? 10,
      });

      // Tampilkan gambar lama jika ada
      if (initialData.imageUrl) {
        const backendUrl = "http://localhost:5000";
        setPreviewUrl(
          initialData.imageUrl.startsWith("http")
            ? initialData.imageUrl
            : `${backendUrl}${initialData.imageUrl}`,
        );
      } else {
        setPreviewUrl(null);
      }
    } else {
      reset({
        name: "",
        categoryId: "",
        barcode: "",
        hpp: "",
        margin: 20,
        sellingPrice: "",
        stock: 0,
        minStock: 10,
      });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [initialData, reset, isOpen]);

  // Handle Form Submit
  const handleFormSubmit = (data) => {
    const payload = {
      ...data,
      ...(selectedFile && { image: selectedFile }), // Sertakan file jika ada
    };
    onSubmitData(payload);
  };

  // Form Field Kalkulasi Margin
  const setSellingFromMargin = (hppVal, marginVal) => {
    if (hppVal > 0 && marginVal >= 0) {
      setValue("sellingPrice", Math.round(hppVal * (1 + marginVal / 100)), {
        shouldValidate: true,
      });
    }
  };

  const hppField = register("hpp", {
    onChange: (e) => {
      if (e.target.value === "") return;
      const currentMargin = getValues("margin");
      if (currentMargin === "" || currentMargin == null) return;
      setSellingFromMargin(Number(e.target.value), Number(currentMargin));
    },
  });

  const marginField = register("margin", {
    onChange: (e) => {
      if (e.target.value === "") return;
      const currentHpp = getValues("hpp");
      if (currentHpp === "" || currentHpp == null) return;
      setSellingFromMargin(Number(currentHpp), Number(e.target.value));
    },
  });

  const sellingField = register("sellingPrice", {
    onChange: (e) => {
      if (e.target.value === "") return;
      const selling = Number(e.target.value);
      const currentHpp = Number(getValues("hpp"));
      if (currentHpp > 0 && selling > 0) {
        setValue(
          "margin",
          round2(((selling - currentHpp) / currentHpp) * 100),
          { shouldValidate: true },
        );
      }
    },
  });

  const hpp = Number(watch("hpp")) || 0;
  const sellingPrice = Number(watch("sellingPrice")) || 0;
  const margin = Number(watch("margin")) || 0;
  const profit = sellingPrice - hpp;
  const showSummary = hpp > 0 && sellingPrice > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Data Produk" : "Tambah Produk Baru"}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col">
        <div className="-mx-1 max-h-[calc(100dvh-16rem)] space-y-6 overflow-y-auto overscroll-contain px-1 pb-4">
          {/* Upload Foto Produk */}
          <Section
            title="Foto Produk"
            description="Format JPG/PNG, ukuran maksimal 2MB."
          >
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden text-slate-400">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-1 top-1 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <ImageIcon size={24} />
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all">
                <Upload size={14} className="text-slate-500" />
                <span>{previewUrl ? "Ganti Gambar" : "Upload Gambar"}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </Section>

          {/* Informasi Produk */}
          <Section
            title="Informasi Produk"
            description="Nama dan identitas produk di kasir."
          >
            <Input
              id="name"
              label="Nama Produk"
              placeholder="Correction Tape"
              {...register("name")}
              error={errors.name?.message}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                id="barcode"
                label="Barcode / SKU"
                placeholder="095656309465836346"
                {...register("barcode")}
                error={errors.barcode?.message}
              />

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="categoryId"
                  className="text-xs font-semibold text-slate-700"
                >
                  Kategori Produk
                </label>
                <select
                  id="categoryId"
                  {...register("categoryId")}
                  disabled={isLoadingCategories}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100 transition-all font-medium"
                >
                  <option value="">
                    {isLoadingCategories
                      ? "Memuat kategori..."
                      : "-- Pilih Kategori --"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span className="text-xs font-medium text-red-500 mt-0.5">
                    {errors.categoryId.message}
                  </span>
                )}
              </div>
            </div>
          </Section>

          {/* Harga & Margin */}
          <Section
            title="Harga"
            description="Ubah margin untuk menghitung harga jual, atau isi harga jual untuk menghitung margin."
          >
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Input
                  id="hpp"
                  type="number"
                  label="HPP (Modal)"
                  placeholder="3000"
                  {...hppField}
                  error={errors.hpp?.message}
                />
                <Input
                  id="margin"
                  type="number"
                  step="0.01"
                  label="Margin (%)"
                  placeholder="20"
                  {...marginField}
                  error={errors.margin?.message}
                />
                <Input
                  id="sellingPrice"
                  type="number"
                  label="Harga Jual"
                  placeholder="3600"
                  {...sellingField}
                  error={errors.sellingPrice?.message}
                />
              </div>

              {showSummary && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2.5 text-sm ring-1 ring-slate-200">
                  <span className="text-slate-500">
                    Laba per unit{" "}
                    <span
                      className={`font-semibold ${
                        profit >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {formatRupiah(profit)}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      profit >= 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    Margin {round2(margin)}%
                  </span>
                </div>
              )}
            </div>
          </Section>

          {/* Stok */}
          <Section
            title="Stok"
            description="Anda akan diberi peringatan saat stok mencapai batas minimal."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                id="stock"
                type="number"
                label="Jumlah Stok"
                placeholder="50"
                {...register("stock")}
                error={errors.stock?.message}
              />
              <Input
                id="minStock"
                type="number"
                label="Batas Minimal Stok"
                placeholder="10"
                {...register("minStock")}
                error={errors.minStock?.message}
              />
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isFormSubmitting || isSubmitting}
          >
            Simpan Produk
          </Button>
        </div>
      </form>
    </Modal>
  );
}
