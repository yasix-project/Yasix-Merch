import {
  FileText,
  CheckCircle2,
  XCircle,
  Layers,
  BookOpen,
  Scissors,
} from "lucide-react";
import { FINISHING_OPTIONS, formatPageRanges } from "../../hooks/siswa/useStudentPrint";
import { formatRupiah } from "../../utils/formatters";

export default function PrintConfigOptions({
  colorType,
  paperSize,
  finishing,
  copies = 1,
  docTotalPages = 0,
  selectedPages = [],
  onColorChange,
  onPaperChange,
  onFinishingChange,
  onCopiesChange,
  onTogglePage,
  onSelectAllPages,
  onSelectOddPages,
  onSelectEvenPages,
}) {
  const allDocPages = Array.from({ length: docTotalPages }, (_, i) => i + 1);
  const selectedSet = new Set(selectedPages);
  const skippedPages = allDocPages.filter((p) => !selectedSet.has(p));

  const pageRangeText = formatPageRanges(selectedPages);
  const skippedRangeText = formatPageRanges(skippedPages);

  return (
    <div className="space-y-4">
      {/* 1. SELEKSI HALAMAN INTERAKTIF (Senjata Terkuat Fitur Print) */}
      {docTotalPages > 0 && (
        <div className="bg-white rounded-2xl border-2 border-primary/20 p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <FileText size={13} className="text-primary" />
                Pilih Halaman yang Dicetak
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Klik tombol nomor untuk memilih atau lewati halaman tertentu.
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                {selectedPages.length} dari {docTotalPages} Hal
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold text-slate-400 mr-1">
              Pilih Cepat:
            </span>
            <button
              type="button"
              onClick={onSelectAllPages}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                selectedPages.length === docTotalPages
                  ? "bg-primary text-white border-primary shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Semua Halaman
            </button>
            {docTotalPages > 1 && (
              <>
                <button
                  type="button"
                  onClick={onSelectOddPages}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                >
                  Hal. Ganjil (1, 3, 5...)
                </button>
                <button
                  type="button"
                  onClick={onSelectEvenPages}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                >
                  Hal. Genap (2, 4, 6...)
                </button>
              </>
            )}
          </div>

          {/* Grid Tombol Nomor Halaman */}
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 pt-1 max-h-56 overflow-y-auto pr-1">
            {allDocPages.map((pageNum) => {
              const isSelected = selectedSet.has(pageNum);
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onTogglePage(pageNum)}
                  className={`relative py-2.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs hover:bg-primary/15"
                      : "border-slate-200 bg-slate-100/80 text-slate-400 font-medium hover:bg-slate-200/70"
                  }`}
                  title={
                    isSelected
                      ? `Halaman ${pageNum} akan dicetak (klik untuk lewati)`
                      : `Halaman ${pageNum} dilewati (klik untuk cetak)`
                  }
                >
                  <span
                    className={`text-sm ${
                      isSelected
                        ? "font-extrabold"
                        : "line-through decoration-danger/60 decoration-2"
                    }`}
                  >
                    {pageNum}
                  </span>
                  <span className="text-[9px] mt-0.5 font-normal">
                    {isSelected ? (
                      <span className="text-emerald-600 font-medium">Cetak</span>
                    ) : (
                      <span className="text-slate-400">Lewati</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Banner Status Instruksi Cetak */}
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Halaman Dicetak:
              </span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {pageRangeText}
              </span>
            </div>

            {skippedPages.length > 0 && (
              <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200">
                <span className="font-medium flex items-center gap-1.5 text-rose-600">
                  <XCircle size={13} className="text-rose-500" />
                  Halaman Dilewati:
                </span>
                <span className="font-mono font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {skippedRangeText}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SPESIFIKASI WARNA, KERTAS & RANGKAP */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileText size={13} />
          Spesifikasi Cetak
        </h3>

        {/* Mode Warna */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-2">
            Jenis Warna Cetak
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onColorChange("BW")}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all ${
                colorType === "BW"
                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>Hitam Putih (B/W)</span>
              <span className="text-[10px] font-normal text-slate-500 mt-0.5">
                Rp 500 / halaman
              </span>
            </button>

            <button
              type="button"
              onClick={() => onColorChange("COLOR")}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all ${
                colorType === "COLOR"
                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>Cetak Berwarna</span>
              <span className="text-[10px] font-normal text-slate-500 mt-0.5">
                Rp 1.000 / halaman
              </span>
            </button>
          </div>
        </div>

        {/* Ukuran Kertas & Rangkap */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Ukuran Kertas
            </label>
            <select
              value={paperSize}
              onChange={(e) => onPaperChange(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            >
              <option value="A4">A4 (Standar)</option>
              <option value="F4">F4 / Folio</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Jumlah Rangkap (Copies)
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => onCopiesChange && onCopiesChange(Math.max(1, (copies || 1) - 1))}
                className="w-8 h-8 rounded-l-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border border-slate-200 flex items-center justify-center text-sm"
              >
                -
              </button>
              <div className="flex-1 text-center font-bold text-xs bg-slate-50 border-y border-slate-200 py-1.5 text-slate-800">
                {copies || 1} Rangkap
              </div>
              <button
                type="button"
                onClick={() => onCopiesChange && onCopiesChange((copies || 1) + 1)}
                className="w-8 h-8 rounded-r-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border border-slate-200 flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. OPSI JILID / FINISHING DENGAN HARGA PASTI */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen size={13} />
            Pilihan Jilid & Finishing
          </h3>
          <span className="text-[10px] text-slate-400">
            Dikerjakan rapi oleh staf kasir
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FINISHING_OPTIONS.map((opt) => {
            const isSelected =
              finishing === opt.id ||
              finishing === opt.label ||
              (!finishing && opt.id === "NONE");

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onFinishingChange(opt.id)}
                className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-2xs"
                    : "border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-600"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? "text-primary" : "text-slate-800"
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">{opt.desc}</p>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-2 ${
                    opt.price === 0
                      ? "bg-slate-200/70 text-slate-600"
                      : isSelected
                        ? "bg-primary text-white"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  {opt.price === 0 ? "Gratis" : formatRupiah(opt.price)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
