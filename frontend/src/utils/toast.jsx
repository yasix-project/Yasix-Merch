import toast from "react-hot-toast";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

/**
 * Toast utility dengan kustomisasi tema Slate & Blue
 * Menggunakan react-hot-toast dengan styling selaras sistem desain Yasix POS
 */

const baseToastStyle = {
  fontFamily: "var(--font-sans, sans-serif)",
  borderRadius: "0.75rem", // rounded-xl
  padding: "12px 16px",
  fontSize: "0.875rem",
  fontWeight: "500",
  lineHeight: "1.4",
  boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
  maxWidth: "420px",
};

/**
 * Menampilkan Toast Sukses
 */
export const showSuccessToast = (message, options = {}) => {
  return toast.success(message, {
    style: {
      ...baseToastStyle,
      background: "#ffffff",
      color: "#0f172a", // slate-900
      border: "1px solid #d1fae5", // emerald-100
      ...options.style,
    },
    iconTheme: {
      primary: "#10b981", // emerald-500
      secondary: "#ffffff",
    },
    duration: 3500,
    ...options,
  });
};

/**
 * Menampilkan Toast Error / Gagal
 */
export const showErrorToast = (message, options = {}) => {
  return toast.error(message, {
    style: {
      ...baseToastStyle,
      background: "#ffffff",
      color: "#0f172a", // slate-900
      border: "1px solid #fee2e2", // rose-100
      ...options.style,
    },
    iconTheme: {
      primary: "#ef4444", // rose-500
      secondary: "#ffffff",
    },
    duration: 4500,
    ...options,
  });
};

/**
 * Menampilkan Toast Peringatan (Warning)
 */
export const showWarningToast = (message, options = {}) => {
  return toast(message, {
    icon: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
    style: {
      ...baseToastStyle,
      background: "#ffffff",
      color: "#0f172a", // slate-900
      border: "1px solid #fef3c7", // amber-100
      ...options.style,
    },
    duration: 4000,
    ...options,
  });
};

/**
 * Menampilkan Toast Informasi (Info)
 */
export const showInfoToast = (message, options = {}) => {
  return toast(message, {
    icon: <Info size={18} className="text-blue-500 shrink-0" />,
    style: {
      ...baseToastStyle,
      background: "#ffffff",
      color: "#0f172a", // slate-900
      border: "1px solid #dbeafe", // blue-100
      ...options.style,
    },
    duration: 3500,
    ...options,
  });
};

/**
 * Menampilkan Toast Promise untuk aksi asynchronous
 */
export const showPromiseToast = (promise, msgs = {}, options = {}) => {
  return toast.promise(
    promise,
    {
      loading: msgs.loading || "Memproses...",
      success: msgs.success || "Berhasil diselesaikan!",
      error: msgs.error || "Terjadi kesalahan.",
    },
    {
      style: {
        ...baseToastStyle,
        background: "#ffffff",
        color: "#0f172a",
        border: "1px solid #e2e8f0",
      },
      success: {
        duration: 3500,
        iconTheme: {
          primary: "#10b981",
          secondary: "#ffffff",
        },
      },
      error: {
        duration: 4500,
        iconTheme: {
          primary: "#ef4444",
          secondary: "#ffffff",
        },
      },
      ...options,
    }
  );
};

// Ekspor instance default juga untuk fleksibilitas
export default toast;
