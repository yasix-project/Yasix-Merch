import { useState } from "react";
import { studentPrintService } from "../api/studentPrintService";

export function useStudentPrint() {
  const [file, setFile] = useState(null);
  const [colorType, setColorType] = useState("BW"); // "BW" | "COLOR"
  const [paperSize, setPaperSize] = useState("A4"); // Default backend "A4"
  const [finishing, setFinishing] = useState("");
  const [notes, setNotes] = useState("");

  const [estimate, setEstimate] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  // Hitung estimasi halaman & biaya via service backend
  const calculateEstimate = async (
    selectedFile,
    selectedColor,
    selectedPaper,
  ) => {
    if (!selectedFile) return;

    setIsEstimating(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("colorType", selectedColor === "COLOR" ? "COLOR" : "BW");
      formData.append("paperSize", selectedPaper || "A4");

      const res = await studentPrintService.estimateCost(formData);
      setEstimate(res);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Gagal menghitung halaman file PDF.",
      );
      setEstimate(null);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setErrorMessage("Format file harus berupa PDF.");
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 25 MB.");
      return;
    }

    setFile(selectedFile);
    setSuccessOrder(null);
    calculateEstimate(selectedFile, colorType, paperSize);
  };

  const handleColorChange = (newColor) => {
    setColorType(newColor);
    if (file) calculateEstimate(file, newColor, paperSize);
  };

  const handlePaperChange = (newPaper) => {
    setPaperSize(newPaper);
    if (file) calculateEstimate(file, colorType, newPaper);
  };

  const resetFile = () => {
    setFile(null);
    setEstimate(null);
    setErrorMessage("");
  };

  // Submit order cetak baru
  const submitOrder = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      setErrorMessage("File PDF wajib diunggah.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("colorType", colorType === "COLOR" ? "COLOR" : "BW");
      formData.append("paperSize", paperSize || "A4");

      // Kirim hanya jika diisi agar terbaca null di Prisma backend
      if (finishing.trim()) {
        formData.append("finishing", finishing.trim());
      }
      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }

      const res = await studentPrintService.createOrder(formData);
      setSuccessOrder(res);
      resetFile();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          "Gagal membuat order cetak. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    file,
    colorType,
    paperSize,
    finishing,
    notes,
    estimate,
    isEstimating,
    isSubmitting,
    errorMessage,
    successOrder,
    setFinishing,
    setNotes,
    handleFileSelect,
    handleColorChange,
    handlePaperChange,
    resetFile,
    submitOrder,
  };
}
