import { useRef } from "react";
import { UploadCloud, FileText, Trash2 } from "lucide-react";

export default function PrintFileUploader({ file, onSelectFile, onResetFile }) {
  const fileInputRef = useRef(null);

  if (!file) {
    return (
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-primary bg-white hover:bg-primary/5 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 shadow-2xs"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => onSelectFile(e.target.files?.[0])}
          accept=".pdf"
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <UploadCloud size={26} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">
            Pilih atau Tarik File Dokumen PDF
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Maksimal ukuran file 25 MB (.pdf saja)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
          <FileText size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
            {file.name}
          </p>
          <p className="text-[10px] text-slate-400">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onResetFile}
        className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
        title="Ganti File"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
