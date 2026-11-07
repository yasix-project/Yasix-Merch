import { useEffect } from "react";
import { AlertTriangle, AlertCircle, Info, HelpCircle, Loader2, X } from "lucide-react";
import { useConfirmStore } from "../../store/confirmStore";

export default function ConfirmModal() {
  const {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    variant,
    isLoading,
    handleConfirm,
    handleCancel,
  } = useConfirmStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, handleCancel]);

  if (!isOpen) return null;

  // Konfigurasi visual berdasarkan variant
  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconWrapper: "bg-red-50 text-red-600 border border-red-100 ring-4 ring-red-50/60",
      confirmBtn: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs shadow-red-200 focus:ring-red-500/30",
    },
    warning: {
      icon: AlertCircle,
      iconWrapper: "bg-amber-50 text-amber-600 border border-amber-100 ring-4 ring-amber-50/60",
      confirmBtn: "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-xs shadow-amber-200 focus:ring-amber-500/30",
    },
    info: {
      icon: Info,
      iconWrapper: "bg-sky-50 text-sky-600 border border-sky-100 ring-4 ring-sky-50/60",
      confirmBtn: "bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-xs shadow-sky-200 focus:ring-sky-500/30",
    },
    primary: {
      icon: HelpCircle,
      iconWrapper: "bg-blue-50 text-blue-600 border border-blue-100 ring-4 ring-blue-50/60",
      confirmBtn: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs shadow-blue-200 focus:ring-blue-500/30",
    },
  };

  const currentConfig = variantConfig[variant] || variantConfig.primary;
  const IconComponent = currentConfig.icon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={() => {
        if (!isLoading) handleCancel();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup Silang di Kanan Atas */}
        <div className="flex justify-end pt-4 pr-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Konten Modal */}
        <div className="px-6 pb-6 pt-1">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${currentConfig.iconWrapper}`}
            >
              <IconComponent size={24} />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {title}
              </h3>
              <div className="mt-1.5 text-sm text-slate-500 leading-relaxed break-words">
                {message}
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all focus:outline-hidden focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${currentConfig.confirmBtn}`}
            >
              {isLoading && <Loader2 size={16} className="animate-spin text-current" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
