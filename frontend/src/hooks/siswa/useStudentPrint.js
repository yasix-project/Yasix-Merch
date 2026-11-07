import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { studentPrintService } from "../../api/studentPrintService";

export const studentPrintQueryKeys = {
  all: ["myPrintOrders"],
  list: (params) => ["myPrintOrders", params],
};

// Opsi & Tarif Jilid Standar Yasix
export const FINISHING_OPTIONS = [
  { id: "NONE", label: "Tanpa Jilid (Stapler)", price: 0, desc: "Gratis staples rapi" },
  { id: "KLIP", label: "Klip Penjepit (Paper Clip)", price: 500, desc: "+Rp 500 praktis tanpa melubangi" },
  { id: "LAKBAN", label: "Jilid Lakban Hitam + Mika", price: 3000, desc: "+Rp 3.000 cover mika & lakban hitam" },
  { id: "SPIRAL", label: "Jilid Spiral Kawat + Mika", price: 5000, desc: "+Rp 5000 spiral kawat premium" },
];

// Helper kalkulasi rentang nomor halaman ringkas
export const formatPageRanges = (pages = []) => {
  if (!pages || pages.length === 0) return "-";
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === prev + 1) {
      prev = sorted[i];
    } else {
      if (start === prev) {
        ranges.push(`${start}`);
      } else {
        ranges.push(`${start}-${prev}`);
      }
      if (i < sorted.length) {
        start = sorted[i];
        prev = sorted[i];
      }
    }
  }
  return ranges.join(", ");
};

// 1. Hook Mengambil Antrean Cetak Siswa
export function useStudentPrintOrders(params = {}) {
  return useQuery({
    queryKey: studentPrintQueryKeys.list(params),
    queryFn: () => studentPrintService.getMyOrders(params),
    refetchInterval: 5000, // Sinkronisasi realtime antrean kasir setiap 5 detik
  });
}

// 2. Hook Form Print Mandiri Siswa
export function useStudentPrint() {
  const queryClient = useQueryClient();

  const [file, setFile] = useState(null);
  const [colorType, setColorType] = useState("BW"); // "BW" | "COLOR"
  const [paperSize, setPaperSize] = useState("A4"); // "A4" | "F4"
  const [finishing, setFinishing] = useState("NONE");
  const [copies, setCopies] = useState(1);

  // Seleksi Halaman Interaktif
  const [docTotalPages, setDocTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]);

  const [isEstimating, setIsEstimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  // Kalkulasi estimasi via backend saat file pertama kali diunggah
  const calculateInitialEstimate = async (selectedFile, selectedColor, selectedPaper) => {
    if (!selectedFile) return;

    setIsEstimating(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("colorType", selectedColor === "COLOR" ? "COLOR" : "BW");
      formData.append("paperSize", selectedPaper || "A4");

      const res = await studentPrintService.estimateCost(formData);
      const total = res?.totalPages || res?.specs?.totalPages || 1;
      setDocTotalPages(total);

      // Default: seluruh halaman terpilih saat awal upload
      const initialPages = Array.from({ length: total }, (_, i) => i + 1);
      setSelectedPages(initialPages);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Gagal membaca struktur halaman file PDF.",
      );
      setDocTotalPages(0);
      setSelectedPages([]);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setErrorMessage("Format file harus berupa dokumen PDF (.pdf).");
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 25 MB.");
      return;
    }

    setFile(selectedFile);
    setSuccessOrder(null);
    calculateInitialEstimate(selectedFile, colorType, paperSize);
  };

  const handleColorChange = (newColor) => {
    setColorType(newColor);
  };

  const handlePaperChange = (newPaper) => {
    setPaperSize(newPaper);
  };

  const handleFinishingChange = (newFinishing) => {
    setFinishing(newFinishing);
  };

  // Helper Aksi Pemilihan Halaman Interaktif
  const togglePage = (pageNumber) => {
    setSelectedPages((prev) => {
      if (prev.includes(pageNumber)) {
        if (prev.length <= 1) {
          setErrorMessage("Minimal pilih 1 halaman untuk dicetak.");
          return prev;
        }
        setErrorMessage("");
        return prev.filter((p) => p !== pageNumber);
      } else {
        setErrorMessage("");
        return [...prev, pageNumber].sort((a, b) => a - b);
      }
    });
  };

  const selectAllPages = () => {
    if (docTotalPages <= 0) return;
    setErrorMessage("");
    setSelectedPages(Array.from({ length: docTotalPages }, (_, i) => i + 1));
  };

  const selectOddPages = () => {
    if (docTotalPages <= 0) return;
    const odds = Array.from({ length: docTotalPages }, (_, i) => i + 1).filter(
      (p) => p % 2 !== 0,
    );
    if (odds.length > 0) {
      setErrorMessage("");
      setSelectedPages(odds);
    }
  };

  const selectEvenPages = () => {
    if (docTotalPages <= 0) return;
    const evens = Array.from({ length: docTotalPages }, (_, i) => i + 1).filter(
      (p) => p % 2 === 0,
    );
    if (evens.length > 0) {
      setErrorMessage("");
      setSelectedPages(evens);
    } else {
      setErrorMessage("Dokumen ini tidak memiliki halaman genap (hanya 1 halaman).");
    }
  };

  const resetFile = () => {
    setFile(null);
    setDocTotalPages(0);
    setSelectedPages([]);
    setErrorMessage("");
  };

  // Kalkulasi Live Realtime (Instant feedback tanpa lag)
  const currentEstimate = useMemo(() => {
    if (!file || docTotalPages <= 0) return null;

    const effectivePageCount = selectedPages.length;
    const pricePerPage = colorType === "COLOR" ? 1000 : 500;
    const printCost = effectivePageCount * pricePerPage * copies;

    const matchedFinishing =
      FINISHING_OPTIONS.find((f) => f.id === finishing) || FINISHING_OPTIONS[0];
    const finishingCost = matchedFinishing.price;
    const totalPrice = printCost + finishingCost;

    const allPages = Array.from({ length: docTotalPages }, (_, i) => i + 1);
    const selectedSet = new Set(selectedPages);
    const skippedPages = allPages.filter((p) => !selectedSet.has(p));

    return {
      totalPages: docTotalPages,
      effectivePageCount,
      selectedPages,
      skippedPages,
      pageRangeText: formatPageRanges(selectedPages),
      skippedRangeText: formatPageRanges(skippedPages),
      colorType,
      isColor: colorType === "COLOR",
      paperSize,
      copies,
      pricePerPage,
      printCost,
      finishing: matchedFinishing.label,
      finishingCost,
      totalPrice,
      specs: {
        totalPages: docTotalPages,
        effectivePageCount,
        selectedPages,
        skippedPages,
        pageRangeText: formatPageRanges(selectedPages),
        skippedRangeText: formatPageRanges(skippedPages),
        isColor: colorType === "COLOR",
        paperSize,
        copies,
        finishing: matchedFinishing.label,
        finishingCost,
      },
    };
  }, [file, docTotalPages, selectedPages, colorType, paperSize, finishing, copies]);

  // Submit order cetak baru
  const submitOrder = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      setErrorMessage("File PDF wajib diunggah.");
      return;
    }

    if (selectedPages.length === 0) {
      setErrorMessage("Pilih minimal satu halaman yang ingin dicetak.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("colorType", colorType === "COLOR" ? "COLOR" : "BW");
      formData.append("paperSize", paperSize || "A4");
      formData.append("copies", String(copies || 1));

      // Kirim jilid yang dipilih
      const matchedFinishing =
        FINISHING_OPTIONS.find((f) => f.id === finishing) || FINISHING_OPTIONS[0];
      formData.append("finishing", matchedFinishing.label);

      // Kirim daftar halaman yang dipilih
      formData.append("selectedPages", JSON.stringify(selectedPages));

      const res = await studentPrintService.createOrder(formData);
      setSuccessOrder(res);
      resetFile();

      // Invalidate query antrean print agar tab pesanan langsung menampilkan data terbaru
      queryClient.invalidateQueries({ queryKey: studentPrintQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
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
    copies,
    docTotalPages,
    selectedPages,
    estimate: currentEstimate,
    isEstimating,
    isSubmitting,
    errorMessage,
    successOrder,
    setFinishing: handleFinishingChange,
    setCopies,
    handleFileSelect,
    handleColorChange,
    handlePaperChange,
    togglePage,
    selectAllPages,
    selectOddPages,
    selectEvenPages,
    resetFile,
    submitOrder,
  };
}
